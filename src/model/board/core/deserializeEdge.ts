import { TBoard } from './TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TEdge } from './TEdge.ts';
import { TSerializedEdge } from './TSerializedEdge.ts';

export const deserializeEdge = (board: TBoard, serializedEdge: TSerializedEdge): TEdge => {
  // TODO: more efficient lookup
  const edge = board.edges.find((edge) => {
    return (
      edge.start.logicalCoordinates.x === serializedEdge.start.x &&
      edge.start.logicalCoordinates.y === serializedEdge.start.y &&
      edge.end.logicalCoordinates.x === serializedEdge.end.x &&
      edge.end.logicalCoordinates.y === serializedEdge.end.y
    );
  });

  assertEnabled() && assert(edge);
  return edge!;
};
