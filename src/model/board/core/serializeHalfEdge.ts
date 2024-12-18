import { THalfEdge } from './THalfEdge.ts';
import { TSerializedHalfEdge } from './TSerializedHalfEdge.ts';

export const serializeHalfEdge = (halfEdge: THalfEdge): TSerializedHalfEdge => {
  return {
    start: { x: halfEdge.start.logicalCoordinates.x, y: halfEdge.start.logicalCoordinates.y },
    end: { x: halfEdge.end.logicalCoordinates.x, y: halfEdge.end.logicalCoordinates.y },
  };
};
