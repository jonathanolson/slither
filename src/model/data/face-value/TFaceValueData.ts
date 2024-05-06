import { TFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { TSerializedState } from '../core/TSerializedState.ts';

export interface TFaceValueData {
  getFaceValue( face: TFace ): FaceValue;

  setFaceValue( face: TFace, state: FaceValue ): void;

  // TODO: consider passing in the old value?
  faceValueChangedEmitter: TEmitter<[ TFace, FaceValue ]>;
}

export type TFaceValueListener = ( face: TFace, state: FaceValue ) => void;

export interface TSerializedFaceValueData extends TSerializedState {
  type: 'FaceValueData';
  faces: {
    face: TSerializedFace;
    state: FaceValue;
  }[];
}

export const serializeFaceValueData = ( board: TBoard, faceData: TFaceValueData ): TSerializedFaceValueData => ( {
  type: 'FaceValueData',
  faces: board.faces.filter( face => faceData.getFaceValue( face ) !== null ).map( face => ( {
    face: serializeFace( face ),
    state: faceData.getFaceValue( face )
  } ) )
} );
