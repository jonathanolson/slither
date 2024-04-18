import { TBoard } from './TBoard.ts';
import { TSerializedVertex } from './TSerializedVertex.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TVertex } from './TVertex.ts';

export const deserializeVertex = ( board: TBoard, serializedVertex: TSerializedVertex ): TVertex => {
  // TODO: more efficient lookup
  const vertex = board.vertices.find( vertex => {
    return ( vertex.logicalCoordinates.x === serializedVertex.x && vertex.logicalCoordinates.y === serializedVertex.y );
  } );

  assertEnabled() && assert( vertex );
  return vertex!;
};