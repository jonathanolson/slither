import { TFace } from '../board/core/TFace.ts';
import { TFaceColor } from '../data/face-color/TFaceColorData.ts';

export type SelectedFaceColorHighlight = {
  faceColor: TFaceColor;
  face: TFace | null;
  faces: TFace[];
};
