import { TFace } from './TFace.ts';
import { TSerializedFace } from './TSerializedFace.ts';

export const serializeFace = (face: TFace): TSerializedFace => {
  return {
    x: face.logicalCoordinates.x,
    y: face.logicalCoordinates.y,
  };
};
