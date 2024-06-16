import { TFaceColorPointer } from './FaceColorPointer.ts';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';

export const dereferenceFaceColorPointer = (data: TFaceColorData, pointer: TFaceColorPointer): TFaceColor => {
  if (pointer.type === 'face') {
    return data.getFaceColor(pointer.face);
  } else {
    return pointer.isOutside ? data.getOutsideColor() : data.getInsideColor();
  }
};
