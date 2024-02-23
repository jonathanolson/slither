import { TBoard } from '../board/core/TBoard.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { Combination } from 'phet-lib/dot';
// @ts-expect-error
import Logic from './logic-solver/logic-solver.js';

// TODO: in the future, vertex state might help! anything that gives us more helpful clauses? maybe not
export const minisatTest = ( board: TBoard, state: TEdgeData & TFaceData ) => {

  // also, we might as well apply a "normal" solver first, to reduce the number of variables/clauses needed?
  // for instance, this should immediately outlaw 0s

  // TODO: see if outlawing simple loops helps performance later?

  // NOTE: for puzzle generation, holes are either "inside" or "outside" of the puzzle!

  const whiteEdges = board.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.WHITE );

  const edgeToVariable = new Map( whiteEdges.map( ( edge, i ) => [ edge, `edge${i + 1}` ] ) );
  const variableToEdge = new Map( whiteEdges.map( ( edge, i ) => [ `edge${i + 1}`, edge ] ) );

  const solver = new Logic.Solver();

  const name = ( edge: TEdge ) => edgeToVariable.get( edge );
  const notName = ( edge: TEdge ) => `-${name( edge )}`;

  const none = ( edges: TEdge[] ) => {
    for ( const edge of edges ) {
      solver.require( Logic.not( name( edge ) ) );
    }
  };

  const some = ( edges: TEdge[] ) => {
    solver.require( Logic.or( ...edges.map( name ) ) );
  };

  const atLeastN = ( edges: TEdge[], n: number ) => {
    if ( n > 0 ) {
      some( edges );
      Combination.forEachCombination( edges, ( combination: readonly TEdge[] ) => {
        if ( combination.length === edges.length - n + 1 ) {
          solver.require( Logic.or( ...combination.map( notName ) ) );
        }
      } );
    }
  };

  const atMostN = ( edges: TEdge[], n: number ) => {
    Combination.forEachCombination( edges, ( combination: readonly TEdge[] ) => {
      if ( combination.length === n + 1 ) {
        solver.require( Logic.or( ...combination.map( notName ) ) );
      }
    } );
  };

  const not1 = ( edges: TEdge[] ) => {
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

  // TODO: see what happens when we give it something unsatisfiable

  const getBlackEdges = (): TEdge[] | null => {
    const solution = solver.solve();
    if ( solution ) {
      const variables = solution.getTrueVars();
      return variables.map( ( variable: string ) => variableToEdge.get( variable ) );
    }
    else {
      return null;
    }
  };

  console.log( getBlackEdges() );

  // wrap in Logic.disablingAssertions(function () { ... }) for faster behavior!
};
