import { TFaceColor } from '../data/face-color/TFaceColorData.ts';
import { TFace } from '../board/core/TFace.ts';

export type SelectedFaceColorHighlight = {
  faceColor: TFaceColor;
  face: TFace | null;
  faces: TFace[];
};