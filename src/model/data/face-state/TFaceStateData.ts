import { TEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { FaceState, TSerializedFaceState } from './FaceState.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { TSerializedState } from '../core/TSerializedState.ts';

export interface TFaceStateData {
  getFaceState(face: TFace): FaceState;

  setFaceState(face: TFace, state: FaceState): void;

  faceStateChangedEmitter: TEmitter<[face: TFace, state: FaceState, oldState: FaceState]>;
}

export type TFaceStateListener = (face: TFace, state: FaceState, oldState: FaceState) => void;

export interface TSerializedFaceStateData extends TSerializedState {
  type: 'FaceStateData';
  faces: {
    face: TSerializedFace;
    state: TSerializedFaceState;
  }[];
}

export const serializeFaceStateData = (board: TBoard, faceData: TFaceStateData): TSerializedFaceStateData => ({
  type: 'FaceStateData',
  faces: board.faces.map((face) => ({
    face: serializeFace(face),
    state: faceData.getFaceState(face).serialize(),
  })),
});
