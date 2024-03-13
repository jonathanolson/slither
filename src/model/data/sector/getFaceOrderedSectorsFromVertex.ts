import { TVertex } from '../../board/core/TVertex.ts';
import { TSector } from './TSector.ts';
import { getSectorsFromVertex } from './getSectorsFromVertex.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const getFaceOrderedSectorsFromVertex = ( vertex: TVertex ): TSector[] => {
  let sectors = getSectorsFromVertex( vertex );

  // Reorder sectors (so that sector[ 0 ] is between edge[ 0 ] and edge[ 1 ], and so on)
  // TODO: function for this
  sectors = [ ...sectors.slice( 1 ), sectors[ 0 ] ];
  assertEnabled() && assert( sectors[ 0 ].edge === vertex.edges[ 1 ] && sectors[ 0 ].next.edge === vertex.edges[ 0 ] );

  return sectors;
};
