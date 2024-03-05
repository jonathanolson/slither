import { TBoard } from '../board/core/TBoard.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { simpleRegionIsSolved, TSimpleRegionData } from '../data/simple-region/TSimpleRegionData.ts';
import { TState } from '../data/core/TState.ts';
import { iterateSolver, SolverFactory, TSolver } from './TSolver.ts';
import { TAction } from '../data/core/TAction.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { InvalidStateError } from './InvalidStateError.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnyData, TAnyDataListener } from '../data/combined/TAnyData.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TDelta } from '../data/core/TDelta.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { backtrackerSolverFactory, standardSolverFactory } from './autoSolver.ts';
import { TEdge } from '../board/core/TEdge.ts';

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

        // NOTE: set state AFTER cloning subSolver
        delta.setEdgeState( whiteEdge, edgeState );

        edgeBacktrack( board, delta, subSolver, options, depth + 1 );
      }
    }
  }
};

export type GetBacktrackedSolutionsOptions = {
  failOnMultipleSolutions: boolean;
  useEdgeBacktrackerSolver: boolean;
};

export class MultipleSolutionsError extends Error {
  public constructor(
    public readonly solutionEdges: TEdge[][]
  ) {
    super( 'Multiple solutions found' );
  }
}

export class InterruptedError extends Error {
  public constructor() {
    super( 'Interrupted' );
  }
}

export const getBacktrackedSolutions = <Data extends TCompleteData>(
  board: TBoard,
  state: TState<Data>,
  options: GetBacktrackedSolutionsOptions
): TState<Data>[] => {
  const initialState = state.clone();

  const solverFactory = options.useEdgeBacktrackerSolver ? backtrackerSolverFactory : standardSolverFactory;
  const initialSolver = solverFactory( board, state, true );

  const solutions: TState<Data>[] = [];
  const multipleSolutions: TEdge[][] = [];

  try {
    edgeBacktrack<Data>(
      board,
      initialState,
      initialSolver,
      {
        solutionCallback: solutionState => {
          solutions.push( solutionState );
          multipleSolutions.push( solutionState.getSimpleRegions()[ 0 ].edges );

          if ( solutions.length === 1 && options.failOnMultipleSolutions ) {
            throw new MultipleSolutionsError( multipleSolutions );
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

export type EdgeBacktrackSolverData = EdgeBacktrackData & TAnyData;

export type EdgeBacktrackSolverOptions<Data extends EdgeBacktrackSolverData> = {
  solverFactory: SolverFactory<TStructure, Data>;
  depth: number;
};

export class EdgeBacktrackerSolver<Data extends EdgeBacktrackSolverData> implements TSolver<Data, TAction<Data>> {

  private isDirty: boolean = true;
  private readonly solver: TSolver<Data, TAction<Data>>;

  private readonly anyChangeListener: TAnyDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly options: EdgeBacktrackSolverOptions<Data>
  ) {
    // to support more depth, we can recursively create EdgeBacktrackerSolvers.
    // TODO: for performance, this probably isn't great (since we're copying solvers more freely?)
    if ( options.depth === 1 ) {
      this.solver = options.solverFactory( board, state, true );
    }
    else {
      this.solver = new EdgeBacktrackerSolver( board, state, {
        solverFactory: options.solverFactory,
        depth: options.depth - 1
      } );
    }

    this.anyChangeListener = () => {
      this.isDirty = true;
    };

    this.state.anyStateChangedEmitter.addListener( this.anyChangeListener );
  }

  public get dirty(): boolean {
    return this.isDirty;
  }

  public nextAction(): TAction<Data> | null {
    if ( !this.dirty ) { return null; }

    // actions we take might make us dirty again.
    this.isDirty = false;

    // First, we'll just run our main solver
    if ( this.solver.dirty ) {
      const action = this.solver.nextAction();
      if ( action ) {
        return action;
      }
    }

    // If that is clean...
    // TODO: potentially more coherency!!! (check where the last edges were set?)
    // TODO: or at least spatial coherency
    const whiteEdges = this.board.edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE );

    // TODO: generalize the "find shared state" ability!!!!

    for ( const whiteEdge of whiteEdges ) {
      const states: TDelta<Data>[] = [];

      for ( const edgeState of [ EdgeState.BLACK, EdgeState.RED ] ) {
        // console.log( whiteEdges.indexOf( whiteEdge ), edgeState );

        const delta = this.state.createDelta();
        const subSolver = this.solver.clone( delta );

        // NOTE: set state AFTER cloning subSolver
        delta.setEdgeState( whiteEdge, edgeState );

        // TODO: if we run across a solution... IMMEDIATELY apply it!!!!

        try {
          iterateSolver( subSolver, delta );
        }
        catch ( e ) {
          if ( e instanceof InvalidStateError ) {
            // We ran into an error in one path, so we NEED to take the other path!
            return new EdgeStateSetAction( whiteEdge, edgeState === EdgeState.BLACK ? EdgeState.RED : EdgeState.BLACK );
          }
          else {
            throw e;
          }
        }

        states.push( delta );
      }

      // inspect for commonalities
      const commonActions: TAction<Data>[] = [];
      for ( const otherWhiteEdge of whiteEdges ) {
        if ( otherWhiteEdge === whiteEdge ) {
          continue;
        }

        const edgeState0 = states[ 0 ].getEdgeState( otherWhiteEdge );
        const edgeState1 = states[ 1 ].getEdgeState( otherWhiteEdge );

        if ( edgeState0 === edgeState1 && edgeState0 !== EdgeState.WHITE ) {
          commonActions.push( new EdgeStateSetAction( otherWhiteEdge, edgeState0 ) );
        }
      }
      if ( commonActions.length ) {
        return new CompositeAction( commonActions );
      }
    }

    return null;
  }
  public clone( equivalentState: TState<Data> ): EdgeBacktrackerSolver<Data> {
    return new EdgeBacktrackerSolver( this.board, equivalentState, this.options );
  }

  public dispose(): void {
    this.solver.dispose();
    this.state.anyStateChangedEmitter.removeListener( this.anyChangeListener );
  }
}
