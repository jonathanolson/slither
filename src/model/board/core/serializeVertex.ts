import { TSerializedVertex } from './TSerializedVertex.ts';
import { TVertex } from './TVertex.ts';

export const serializeVertex = ( vertex: TVertex ): TSerializedVertex => {
  return {
    x: vertex.logicalCoordinates.x,
    y: vertex.logicalCoordinates.y
  };
};