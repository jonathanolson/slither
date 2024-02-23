import { TBoard } from '../board/core/TBoard.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { Combination } from 'phet-lib/dot';
// @ts-expect-error
import Logic from './logic-solver/logic-solver.js';
import { TVertex } from '../board/core/TVertex.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TState } from '../data/core/TState.ts';
import { MultipleSolutionsError } from './EdgeBacktracker.ts';

export type SatSolveOptions = {
  maxIterations: number;
  // TODO: consider global rename failOnMultipleSolutions
  failOnMultiple: boolean;
};

// TODO: in the future, vertex state might help! anything that gives us more helpful clauses? maybe not
export const satSolve = (
  board: TBoard,
  state: TState<TEdgeData & TFaceData>,
  options: SatSolveOptions
): TEdge[][] => {

  // also, we might as well apply a "normal" solver first, to reduce the number of variables/clauses needed?
  // for instance, this should immediately outlaw 0s

  // TODO: see if outlawing simple loops helps performance later?

  // NOTE: for puzzle generation, holes are either "inside" or "outside" of the puzzle!

  const blackEdges = board.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.BLACK );
  const whiteEdges = board.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.WHITE );

  const whiteEdgeSet = new Set( whiteEdges ); // For faster lookup

  const edgeToVariable = new Map( whiteEdges.map( ( edge, i ) => [ edge, `edge${i + 1}` ] ) );
  const variableToEdge = new Map( whiteEdges.map( ( edge, i ) => [ `edge${i + 1}`, edge ] ) );

  const solver = new Logic.Solver();

  const name = ( edge: TEdge ) => {
    const result = edgeToVariable.get( edge );
    assertEnabled() && assert( result !== undefined, 'Edge not found!' );
    return result;
  };
  const notName = ( edge: TEdge ) => `-${name( edge )}`;

  const none = ( edges: TEdge[] ) => {
    for ( const edge of edges ) {
      solver.require( Logic.not( name( edge ) ) );
    }
  };

  const some = ( edges: TEdge[] ) => {
    solver.require( Logic.or( ...edges.map( name ) ) );
  };

  const notAll = ( edges: TEdge[] ) => {
    // TODO: hotspot (6% of solving time)
    solver.require( Logic.or( ...edges.map( notName ) ) );
  };

  const atLeastN = ( edges: TEdge[], n: number ) => {
    // TODO: hotspot (7% of solving time)
    if ( n > 0 ) {
      some( edges );
      Combination.forEachCombination( edges, ( combination: readonly TEdge[] ) => {
        if ( combination.length === edges.length - n + 1 ) {
          // TODO: is this... horrible?
          solver.require( Logic.not( Logic.and( ...combination.map( notName ) ) ) );
        }
      } );
    }
  };

  const atMostN = ( edges: TEdge[], n: number ) => {
    // TODO: hotspot (15% of solving time)
    Combination.forEachCombination( edges, ( combination: readonly TEdge[] ) => {
      if ( combination.length === n + 1 ) {
        solver.require( Logic.or( ...combination.map( notName ) ) );
      }
    } );
  };

  const not1 = ( edges: TEdge[] ) => {
    // TODO: hotspot (27% of solving time)
    // TODO: see if it's better if we manually add the implications (e.g. for every permutation of 2, ( A or NOT B ))
    solver.require( Logic.not( Logic.exactlyOne( ...edges.map( name ) ) ) );
  };

  const zeroOrTwo = ( edges: TEdge[] ) => {
    atMostN( edges, 2 );
    not1( edges );
  };

  const exactlyN = ( edges: TEdge[], n: number ) => {
    if ( n === 0 ) {
      none( edges );
    }
    else {
      atLeastN( edges, n );
      atMostN( edges, n );
    }
  };

  // Add clauses
  some( whiteEdges ); // Force there to be at least one edge

  for ( const vertex of board.vertices ) {
    let blackCount = 0;
    let whiteCount = 0;

    let edges: TEdge[] = [];

    for ( const edge of vertex.edges ) {
      const edgeState = state.getEdgeState( edge );
      if ( edgeState === EdgeState.BLACK ) {
        blackCount++;
      }
      else if ( edgeState === EdgeState.WHITE ) {
        whiteCount++;
        edges.push( edge );
      }
    }

    if ( whiteCount === 0 ) {
      continue;
    }

    if ( blackCount === 0 ) {
      zeroOrTwo( edges );
    }
    else if ( blackCount === 1 ) {
      exactlyN( edges, 1 );
    }
    else {
      none( edges );
    }
  }

  // TODO: IF WE TRACK which clauses are from what faces, we might be able to remove them faster and do puzzle generation faster? (probably not worth it)
  for ( const face of board.faces ) {
    const faceValue = state.getFaceState( face );
    if ( faceValue === null ) {
      continue;
    }

    let blackCount = 0;
    let whiteCount = 0;

    let edges: TEdge[] = [];

    for ( const edge of face.edges ) {
      const edgeState = state.getEdgeState( edge );
      if ( edgeState === EdgeState.BLACK ) {
        blackCount++;
      }
      else if ( edgeState === EdgeState.WHITE ) {
        whiteCount++;
        edges.push( edge );
      }
    }

    if ( whiteCount === 0 ) {
      continue;
    }

    const openCount = Math.max( faceValue - blackCount, 0 ); // sanity check!!!

    exactlyN( edges, openCount );
  }

  // TODO: if there are no faces, throw an error!

  // TODO: see what happens when we give it something unsatisfiable

  const getBlackEdges = (): TEdge[] | null => {
    let solution: Logic.Solution | null = null;
    Logic.disablingAssertions( () => {
      solution = solver.solve();
    } );

    if ( solution ) {
      const variables = solution.getTrueVars();
      return variables.map( ( variable: string ) => variableToEdge.get( variable ) );
    }
    else {
      return null;
    }
  };

  let iterationNumber = 0;

  // TODO: detect if it is already solved

  // TODO: can we add async/await into minisat somehow? (or web-worker it?)
  const findLoops = (): {
    touchingValueLoops: TEdge[][];
    nonTouchingValueLoops: TEdge[][];
  } => {
    const newBlackEdges = getBlackEdges();
    if ( newBlackEdges === null ) {
      return {
        touchingValueLoops: [],
        nonTouchingValueLoops: []
      };
    }

    // Combine the SAT-solved edges with the excluded edges
    const blackEdgeSet = new Set( [
      ...newBlackEdges,
      ...blackEdges
    ] );

    const touchingValueLoops: TEdge[][] = [];
    const nonTouchingValueLoops: TEdge[][] = [];

    while ( blackEdgeSet.size ) {
      const startEdge = blackEdgeSet.values().next().value;

      const loop: TEdge[] = [];
      let vertex: TVertex = startEdge.end;
      let currentEdge: TEdge | null = startEdge;

      let touchingValue = false;

      while ( currentEdge ) {
        blackEdgeSet.delete( currentEdge );
        loop.push( currentEdge );

        touchingValue = touchingValue || currentEdge.faces.some( face => state.getFaceState( face ) !== null );

        currentEdge = vertex.edges.find( e => blackEdgeSet.has( e ) ) ?? null;

        if ( currentEdge ) {
          vertex = currentEdge.getOtherVertex( vertex );
        }
      }

      assertEnabled() && assert( loop[ 0 ].vertices.some( vertex => loop[ loop.length - 1 ].vertices.includes( vertex ) ), 'Loop is not a loop!' );

      ( touchingValue ? touchingValueLoops : nonTouchingValueLoops ).push( loop );
    }

    return {
      touchingValueLoops,
      nonTouchingValueLoops
    };
  };

  // TODO: the ability to fail out on multiple solutions?

  const solutions: TEdge[][] = [];

  // https://www.dougandjean.com/slither/howitsolves.html describes this partial approach well, thank you!!!
  // TODO: limit iterations

  while ( true ) {
    const loops = findLoops();

    if ( !loops.touchingValueLoops.length ) {
      break;
    }

    if ( loops.touchingValueLoops.length === 1 ) {
      solutions.push( loops.touchingValueLoops[ 0 ] );

      if ( solutions.length > 1 && options.failOnMultiple ) {
        throw new MultipleSolutionsError();
      }
    }

    const allLoops = [
      ...loops.touchingValueLoops,
      ...loops.nonTouchingValueLoops
    ];

    for ( const loop of allLoops ) {
      notAll( loop.filter( edge => whiteEdgeSet.has( edge ) ) );
    }

    iterationNumber++;

    if ( iterationNumber > options.maxIterations ) {
      throw new MaximumSolverIterationsError();
    }
  }

  // TODO: detect loops. detect solutions in those. negate all loops, try again (until UNSAT null)
  // TODO: only use the edges that are "white edges"

  return solutions;
};

export class MaximumSolverIterationsError extends Error {
  public constructor() {
    super( 'Too many iterations!' );
  }
}
