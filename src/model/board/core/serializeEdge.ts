import { TEdge } from './TEdge.ts';
import { TSerializedEdge } from './TSerializedEdge.ts';

export const serializeEdge = ( edge: TEdge ): TSerializedEdge => {
  return {
    start: { x: edge.start.logicalCoordinates.x, y: edge.start.logicalCoordinates.y },
    end: { x: edge.end.logicalCoordinates.x, y: edge.end.logicalCoordinates.y }
  };
};