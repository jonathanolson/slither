import { TFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';
import { TEmitter } from 'phet-lib/axon';

export interface TFaceData {
  getFaceState( face: TFace ): FaceState;

  setFaceState( face: TFace, state: FaceState ): void;

  // TODO: consider passing in the old value?
  faceStateChangedEmitter: TEmitter<[ TFace, FaceState ]>;
}

export type TFaceDataListener = ( face: TFace, state: FaceState ) => void;
