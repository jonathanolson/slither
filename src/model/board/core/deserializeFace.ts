import { TBoard } from './TBoard.ts';
import { TFace } from './TFace.ts';
import { TSerializedFace } from './TSerializedFace.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const deserializeFace = (board: TBoard, serializedFace: TSerializedFace): TFace => {
  // TODO: more efficient lookup
  const face = board.faces.find((face) => {
    return face.logicalCoordinates.x === serializedFace.x && face.logicalCoordinates.y === serializedFace.y;
  });

  assertEnabled() && assert(face);
  return face!;
};
