import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternFace } from './TPatternFace.ts';

export const getEdgeConnectedComponentFaces = ( patternBoard: TPatternBoard ): TPatternFace[][] => {
  const remainingFaces = new Set( patternBoard.faces );
  const components: TPatternFace[][] = [];

  while ( remainingFaces.size ) {
    const face = remainingFaces.values().next().value;
    remainingFaces.delete( face );
    const component = [ face ];

    const queue = [ face ];

    while ( queue.length ) {
      const currentFace = queue.shift();

      for ( const edge of currentFace.edges ) {
        for ( const adjacentFace of edge.faces ) {
          if ( remainingFaces.has( adjacentFace ) ) {
            remainingFaces.delete( adjacentFace );
            component.push( adjacentFace );
            queue.push( adjacentFace );
          }
        }
      }
    }

    components.push( component );
  }


  return components;
};
