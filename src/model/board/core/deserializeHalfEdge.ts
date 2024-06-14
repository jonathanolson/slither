import { TBoard } from './TBoard.ts';
import { TSerializedHalfEdge } from './TSerializedHalfEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { THalfEdge } from './THalfEdge.ts';

export const deserializeHalfEdge = (board: TBoard, serializedHalfEdge: TSerializedHalfEdge): THalfEdge => {
  // TODO: more efficient lookup
  const halfEdge = board.halfEdges.find((halfEdge) => {
    return (
      halfEdge.start.logicalCoordinates.x === serializedHalfEdge.start.x &&
      halfEdge.start.logicalCoordinates.y === serializedHalfEdge.start.y &&
      halfEdge.end.logicalCoordinates.x === serializedHalfEdge.end.x &&
      halfEdge.end.logicalCoordinates.y === serializedHalfEdge.end.y
    );
  });

  assertEnabled() && assert(halfEdge);
  return halfEdge!;
};
