import { TPatternEdge } from './pattern-board/TPatternEdge.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { arrayRemove } from 'phet-lib/phet-core';
import _ from '../../workarounds/_.ts';

export const filterHighlanderSolutions = (
  solutions: TPatternEdge[][],
  indeterminateEdges: TPatternEdge[],
): {
  highlanderSolutions: TPatternEdge[][];
  excludedSolutionGroups: TPatternEdge[][][];
} => {
  const solutionMap = new Map<string, TPatternEdge[][]>;

  const getKey = ( solution: TPatternEdge[] ): string => {
    const remainingEdges = solution.slice();

    const connections: { minVertexIndex: number; maxVertexIndex: number }[] = [];

    while ( remainingEdges.length ) {
      const startExitEdge = remainingEdges.find( edge => edge.isExit )!;
      assertEnabled() && assert( startExitEdge );

      const getNextEdge = ( currentEdge: TPatternEdge ): TPatternEdge => {
        // TODO: performance?
        const potentialEdges = currentEdge.vertices.flatMap( vertex => vertex.edges ).filter( edge => remainingEdges.includes( edge ) );
        assertEnabled() && assert( potentialEdges.length === 1 );

        return potentialEdges[ 0 ];
      };

      arrayRemove( remainingEdges, startExitEdge );
      let currentEdge = startExitEdge;

      while ( currentEdge === startExitEdge || !currentEdge.isExit ) {
        const nextEdge = getNextEdge( currentEdge );
        arrayRemove( remainingEdges, nextEdge );
        currentEdge = nextEdge;
      }

      const endExitEdge = currentEdge;

      const minVertexIndex = Math.min( startExitEdge.exitVertex!.index, endExitEdge.exitVertex!.index );
      const maxVertexIndex = Math.max( startExitEdge.exitVertex!.index, endExitEdge.exitVertex!.index );

      connections.push( { minVertexIndex, maxVertexIndex } );
    }

    const sortedConnections = _.sortBy( connections, connection => connection.minVertexIndex );

    return `${indeterminateEdges.map( edge => solution.includes( edge ) ? '1' : '0' )}${sortedConnections.map( connection => {
      return `,c${connection.minVertexIndex}-${connection.maxVertexIndex}`;
    } )}`;
  };

  for ( const solution of solutions ) {
    const key = getKey( solution );
    if ( solutionMap.has( key ) ) {
      solutionMap.get( key )!.push( solution );
    }
    else {
      solutionMap.set( key, [ solution ] );
    }
  }

  const highlanderSolutions: TPatternEdge[][] = [];
  const excludedSolutionGroups: TPatternEdge[][][] = [];
  for ( const solutions of solutionMap.values() ) {
    if ( solutions.length > 1 ) {
      excludedSolutionGroups.push( solutions );
    }
    else {
      highlanderSolutions.push( solutions[ 0 ] );
    }
  }

  return { highlanderSolutions, excludedSolutionGroups };
};