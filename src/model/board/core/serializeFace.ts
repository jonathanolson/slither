import { TSerializedFace } from './TSerializedFace.ts';
import { TFace } from './TFace.ts';

export const serializeFace = (face: TFace): TSerializedFace => {
  return {
    x: face.logicalCoordinates.x,
    y: face.logicalCoordinates.y,
  };
};
