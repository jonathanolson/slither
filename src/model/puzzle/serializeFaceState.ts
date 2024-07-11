import { TBoard } from '../board/core/TBoard.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TSerializedFaceData } from './TSerializedFaceData.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

export const serializeFaceData = <Data extends TFaceValueData>(board: TBoard, data: Data): TSerializedFaceData => {
  return board.faces
    .map((face) => {
      const value = data.getFaceValue(face);

      assertEnabled() && assert(value === null || (value >= 0 && value < 10), 'Invalid face value: ' + value);

      return value === null ? '.' : value.toString();
    })
    .join('');
};
