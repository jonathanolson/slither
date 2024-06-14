import { TBoard } from '../../board/core/TBoard.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { TFaceColorPointer, TSerializedFaceColorPointer } from './FaceColorPointer.ts';

export const deserializeFaceColorPointer = (board: TBoard, pointer: TSerializedFaceColorPointer): TFaceColorPointer => {
  if (pointer.type === 'face') {
    return {
      type: 'face',
      face: deserializeFace(board, pointer.face),
    };
  } else {
    return {
      type: 'absolute',
      isOutside: pointer.isOutside,
    };
  }
};
