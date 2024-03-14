import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeFace, TSerializedFace, TFace } from '../../board/core/TFace.ts';
import { TSerializedFaceState, FaceState } from './FaceState.ts';

export interface TFaceStateData {
  getFaceState( face: TFace ): FaceState;

  setFaceState( face: TFace, state: FaceState ): void;

  faceStateChangedEmitter: TEmitter<[ face: TFace, state: FaceState, oldState: FaceState ]>;
}

export type TFaceStateListener = ( face: TFace, state: FaceState, oldState: FaceState ) => void;

export interface TSerializedFaceStateData extends TSerializedState {
  type: 'FaceStateData';
  faces: {
    face: TSerializedFace;
    state: TSerializedFaceState;
  }[];
}

export const serializeFaceStateData = ( board: TBoard, faceData: TFaceStateData ): TSerializedFaceStateData => ( {
  type: 'FaceStateData',
  faces: board.faces.map( face => ( {
    face: serializeFace( face ),
    state: faceData.getFaceState( face ).serialize()
  } ) )
} );
