import { TPatternBoard } from './TPatternBoard.ts';
import { BlackEdgeFeature } from './feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from './feature/RedEdgeFeature.ts';
import { TPatternEdge } from './TPatternEdge.ts';

export const coalesceEdgeFeatures = ( patternBoard: TPatternBoard, solutions: TPatternEdge[][] ): ( BlackEdgeFeature | RedEdgeFeature )[] => {
  const hasBlack = new Array( patternBoard.edges.length ).fill( false );
  const hasRed = new Array( patternBoard.edges.length ).fill( false );

  const allEdges = new Set( patternBoard.edges );

  const redExitVertices = new Set( patternBoard.vertices.filter( vertex => vertex.isExit ) );

  for ( const solution of solutions ) {

    // TODO: faster... ways in the future? Performance?
    const edgesRemaining = new Set( allEdges );

    for ( const edge of solution ) {
      hasBlack[ edge.index ] = true;
      edgesRemaining.delete( edge );
    }

    for ( const edge of edgesRemaining ) {
      hasRed[ edge.index ] = true;
    }

    for ( const redExitVertex of [ ...redExitVertices ] ) {

      // If we have a black edge in our exit, it can't be red

      // TODO: omg, improve performance here lol
      if ( solution.includes( redExitVertex.exitEdge! ) ) {
        redExitVertices.delete( redExitVertex );
      }

      // If we have zero or one black edges to our exit vertex, it can't be red.
      // NOTE: if zero black edges, then we can't rule out exit edge matching to 2 edges that could both be black.

      // TODO: omg, improve performance here lol
      if ( redExitVertex.edges.filter( edge => solution.includes( edge ) ).length < 2 ) {
        redExitVertices.delete( redExitVertex );
      }
    }
  }

  const features: ( BlackEdgeFeature | RedEdgeFeature )[] = [];

  for ( const edge of patternBoard.edges ) {
    if ( !edge.isExit ) {
      const isBlack = hasBlack[ edge.index ];
      const isRed = hasRed[ edge.index ];

      if ( isBlack && !isRed ) {
        features.push( new BlackEdgeFeature( edge ) );
      }
      if ( !isBlack && isRed ) {
        features.push( new RedEdgeFeature( edge ) );
      }
    }
  }
  for ( const redExitVertex of redExitVertices ) {
    features.push( new RedEdgeFeature( redExitVertex.exitEdge! ) );
  }

  return features;
};