import { serializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TSerializedState } from '../core/TState.ts';

export interface TFaceData {
  getFaceValue( face: TFace ): FaceValue;

  setFaceValue( face: TFace, state: FaceValue ): void;

  // TODO: consider passing in the old value?
  faceValueChangedEmitter: TEmitter<[ TFace, FaceValue ]>;
}

export type TFaceDataListener = ( face: TFace, state: FaceValue ) => void;

export interface TSerializedFaceData extends TSerializedState {
  type: 'FaceData';
  faces: {
    face: TSerializedFace;
    state: FaceValue;
  }[];
}

export const serializeFaceData = ( board: TBoard, faceData: TFaceData ): TSerializedFaceData => ( {
  type: 'FaceData',
  faces: board.faces.filter( face => faceData.getFaceValue( face ) !== null ).map( face => ( {
    face: serializeFace( face ),
    state: faceData.getFaceValue( face )
  } ) )
} );
