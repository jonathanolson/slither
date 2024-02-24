import { serializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';
import { TEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TSerializedState } from '../core/TState.ts';

export interface TFaceData {
  getFaceState( face: TFace ): FaceState;

  setFaceState( face: TFace, state: FaceState ): void;

  // TODO: consider passing in the old value?
  faceStateChangedEmitter: TEmitter<[ TFace, FaceState ]>;
}

export type TFaceDataListener = ( face: TFace, state: FaceState ) => void;

export interface TSerializedFaceData extends TSerializedState {
  type: 'FaceData';
  faces: {
    face: TSerializedFace;
    state: FaceState;
  }[];
}

export const serializeFaceData = ( board: TBoard, faceData: TFaceData ): TSerializedFaceData => ( {
  type: 'FaceData',
  faces: board.faces.filter( face => faceData.getFaceState( face ) !== null ).map( face => ( {
    face: serializeFace( face ),
    state: faceData.getFaceState( face )
  } ) )
} );
