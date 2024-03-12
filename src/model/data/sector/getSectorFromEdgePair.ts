import { TSector } from './TSector.ts';
import { TEdge } from '../../board/core/TEdge.ts';

export const getSectorFromEdgePair = ( edgeA: TEdge, edgeB: TEdge ): TSector => {
  // Be a bit paranoid and handle all cases
  if ( edgeA.forwardHalf.next.edge === edgeB ) {
    return edgeA.forwardHalf;
  }
  else if ( edgeA.reversedHalf.next.edge === edgeB ) {
    return edgeA.reversedHalf;
  }
  else if ( edgeB.forwardHalf.next.edge === edgeA ) {
    return edgeB.forwardHalf;
  }
  else if ( edgeB.reversedHalf.next.edge === edgeA ) {
    return edgeB.reversedHalf;
  }
  else {
    throw new Error( 'Edges are not connected' );
  }
};