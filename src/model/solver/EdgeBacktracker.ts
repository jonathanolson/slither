import { TBoard } from '../board/core/TBoard.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { simpleRegionIsSolved, TSimpleRegionData } from '../data/simple-region/TSimpleRegionData.ts';
import { TState } from '../data/core/TState.ts';
import { iterateSolver, TSolver } from './TSolver.ts';
import { TAction } from '../data/core/TAction.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { InvalidStateError } from './InvalidStateError.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { SimpleVertexSolver } from './SimpleVertexSolver.ts';
import { SimpleFaceSolver } from './SimpleFaceSolver.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';

export type EdgeBacktrackData = TEdgeData & TSimpleRegionData;

export type BacktrackOptions<Data extends EdgeBacktrackData> = {
  solutionCallback( state: TState<Data> ): void;
  depth: number | null;
};

// TODO: convert to async/await with sleep(0)
export const edgeBacktrack = <Data extends EdgeBacktrackData>(
  board: TBoard,
  state: TState<Data>,
  solver: TSolver<Data, TAction<Data>>,
  options: BacktrackOptions<Data>,
  depth: number = 0
) => {
  try {
    iterateSolver( solver, state );
  }
  catch ( e ) {
    if ( e instanceof InvalidStateError ) {
      // TODO: make sure our solvers aren't needing disposal? (we ditch the state/delta AND the solver, so no other refs?)
      return;
    }
    else {
      throw e;
    }
  }

  if ( simpleRegionIsSolved( state ) ) {
    options.solutionCallback( state );
  }
  else if ( options.depth === null || depth < options.depth ) {

    const whiteEdge = board.edges.find( edge => state.getEdgeState( edge ) === EdgeState.WHITE );
    if ( whiteEdge ) {
      for ( const edgeState of [ EdgeState.BLACK, EdgeState.RED ] ) {
        const delta = state.createDelta();

        const subSolver = solver.clone( delta );

        delta.setEdgeState( whiteEdge, edgeState );

        edgeBacktrack( board, delta, subSolver, options, depth + 1 );
      }
    }
  }
};

export type GetBacktrackedSolutionsOptions = {
  failOnMultiple: boolean;
};

export class MultipleSolutionsError extends Error {
  public constructor() {
    super( 'Multiple solutions found' );
  }
}

export const getBacktrackedSolutions = <Data extends TCompleteData>(
  board: TBoard,
  state: TState<Data>,
  options: GetBacktrackedSolutionsOptions
): TState<Data>[] => {
  const initialState = state.clone();

  const initialSolver = new CompositeSolver( [
    new SimpleVertexSolver( board, initialState, {
      solveJointToRed: true,
      solveOnlyOptionToBlack: true,
      solveAlmostEmptyToRed: true
    } ),
    new SimpleFaceSolver( board, initialState, {
      solveToRed: true,
      solveToBlack: true,
    } ),
    new SafeEdgeToSimpleRegionSolver( board, initialState ),

    // We rely on the Simple Regions being accurate here, so they are lower down
    new SimpleLoopSolver( board, initialState, {
      solveToRed: true,
      solveToBlack: true,
      resolveAllRegions: false // NOTE: this will be faster
    } )
  ] );

  const solutions: TState<Data>[] = [];

  try {
    edgeBacktrack<Data>(
      board,
      initialState,
      initialSolver,
      {
        solutionCallback: solutionState => {
          if ( solutions.length === 1 && options.failOnMultiple ) {
            throw new MultipleSolutionsError();
          }
          else {
            solutions.push( solutionState );
          }
        },
        depth: null
      }
    );
  }
  catch ( e ) {
    if ( e instanceof MultipleSolutionsError ) {
      throw new InvalidStateError( 'Multiple solutions found' );
    }
    else {
      throw e;
    }
  }

  return solutions;
};
