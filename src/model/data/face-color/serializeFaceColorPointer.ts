import { serializeFace } from '../../board/core/serializeFace.ts';
import { TFaceColorPointer, TSerializedFaceColorPointer } from './FaceColorPointer.ts';

export const serializeFaceColorPointer = ( pointer: TFaceColorPointer ): TSerializedFaceColorPointer => {
  if ( pointer.type === 'face' ) {
    return {
      type: 'face',
      face: serializeFace( pointer.face )
    };
  }
  else {
    return {
      type: 'absolute',
      isOutside: pointer.isOutside
    };
  }
};