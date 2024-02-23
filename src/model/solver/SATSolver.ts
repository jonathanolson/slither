
// @ts-expect-error
import minisat from './minisat.js';
import { TBoard } from '../board/core/TBoard.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { Combination } from 'phet-lib/dot';
// @ts-expect-error
import Logic from './logic-solver/logic-solver.js';

var solver = new Logic.Solver();

solver.require(Logic.atMostOne("Alice", "Bob"));
solver.require(Logic.or("Bob", "Charlie"));

var sol1 = solver.solve();
console.log( sol1.getTrueVars() ) // => ["Bob"]

// TODO: in the future, vertex state might help! anything that gives us more helpful clauses? maybe not
export const minisatTest = ( board: TBoard, state: TEdgeData & TFaceData ) => {

  // Vertex rule: 0 or 2, of N edges
  //   negating all triples, e.g. (-a, -b, -c) for each triple --- caps "satisfied" at 2
  //   ai => aj, for all i,j pairs, i != j:  (-ai, aj)    ---- seems sufficient for now, could introduce auxiliary variables?
  // face rules (for N edges, value is K):
  //   combine:
  //   at least K true: for each combination of K edges, specify that, e.g. K=3 have (a,b,c), (a,b,d), (a,c,d), (b,c,d), etc.
  //   at most K true: for each combination of K+1 edges, specify that, e.g. K=3 have (-a,-b,-c,-d), (-a,-b,-c,-e), (-a,-b,-d,-e), (-a,-c,-d,-e), (-b,-c,-d,-e), etc.
  // to negate a loop that the solver has found, just have (-a, -b, ..., -z) for all of the edges in the loop

  // also, we might as well apply a "normal" solver first, to reduce the number of variables/clauses needed?
  // for instance, this should immediately outlaw 0s

  // TODO: see if outlawing simple loops helps performance later?

  // NOTE: for puzzle generation, holes are either "inside" or "outside" of the puzzle!

  const whiteEdges = board.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.WHITE );

  const edgeToVariable = new Map( whiteEdges.map( ( edge, i ) => [ edge, i + 1 ] ) );
  const variableToEdge = new Map( whiteEdges.map( ( edge, i ) => [ i + 1, edge ] ) );

  // for now, no Tseitin Transformation
  const mainClauses: string[] = [];

  const none = ( edges: TEdge[] ) => {
    for ( const edge of edges ) {
      mainClauses.push( `${edgeToVariable.get( edge )} 0` );
    }
  };

  const some = ( edges: TEdge[] ) => {
    mainClauses.push( edges.map( edge => `${edgeToVariable.get( edge )}` ).join( ' ' ) + ' 0' );
  };

  const atLeastN = ( edges: TEdge[], n: number ) => {
    Combination.forEachCombination( edges, ( combination: readonly TEdge[] ) => {
      if ( combination.length === edges.length - n + 1 ) {
        mainClauses.push( combination.map( edge => `-${edgeToVariable.get( edge )}` ).join( ' ' ) + ' 0' );
      }
    } );
  };

  const atMostN = ( edges: TEdge[], n: number ) => {
    Combination.forEachCombination( edges, ( combination: readonly TEdge[] ) => {
      if ( combination.length === n + 1 ) {
        mainClauses.push( combination.map( edge => `-${edgeToVariable.get( edge )}` ).join( ' ' ) + ' 0' );
      }
    } );
  };

  const not1 = ( edges: TEdge[] ) => {
    for ( let i = 0; i < edges.length; i++ ) {
      for ( let j = i + 1; j < edges.length; j++ ) {
        mainClauses.push( `-${edgeToVariable.get( edges[ i ] )} ${edgeToVariable.get( edges[ j ] )} 0` );
        mainClauses.push( `-${edgeToVariable.get( edges[ j ] )} ${edgeToVariable.get( edges[ i ] )} 0` );
      }
    }
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

    console.log( blackCount );

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

  const initialString = clausesToString( mainClauses, whiteEdges.length );

  console.log( initialString );
  console.log( minisat( initialString ) );

//   console.log( minisat( `p cnf 403 2029
// c Factors encoded in variables 1-11 and 12-22
// 2 3 4 5 6 7 8 9 10 11 0
//
//   ` ) );
};

const clausesToString = ( clauses: string[], numVariables: number ) => {
  return `p cnf ${numVariables} ${clauses.length}\n${clauses.join( '\n' )}`;
};
