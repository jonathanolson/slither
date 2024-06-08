import { TFace } from '../../board/core/TFace.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';

export type TFaceColorPointer = {
  type: 'face';
  face: TFace;
} | {
  type: 'absolute';
  isOutside: boolean;
};

export type TSerializedFaceColorPointer = {
  type: 'face';
  face: TSerializedFace;
} | {
  type: 'absolute';
  isOutside: boolean;
};

