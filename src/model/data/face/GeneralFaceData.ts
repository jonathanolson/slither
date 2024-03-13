import { TState } from '../core/TState.ts';
import { serializeFaceData, TFaceData, TSerializedFaceData } from './TFaceData.ts';
import { deserializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { GeneralFaceDelta } from './GeneralFaceDelta.ts';

export class GeneralFaceData implements TState<TFaceData> {

  public readonly faceValueChangedEmitter = new TinyEmitter<[ TFace, FaceValue ]>();

  public readonly faceValueMap: Map<TFace, FaceValue> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialFaceValue: ( face: TFace ) => FaceValue
  ) {
    board.faces.forEach( face => {
      this.faceValueMap.set( face, getInitialFaceValue( face ) );
    } );
  }

  public getFaceValue( face: TFace ): FaceValue {
    assertEnabled() && assert( this.faceValueMap.has( face ) );

    return this.faceValueMap.get( face )!;
  }

  public setFaceValue( face: TFace, state: FaceValue ): void {
    assertEnabled() && assert( this.faceValueMap.has( face ) );

    const oldValue = this.faceValueMap.get( face )!;

    if ( oldValue !== state ) {
      this.faceValueMap.set( face, state );

      this.faceValueChangedEmitter.emit( face, state );
    }
  }

  public clone(): GeneralFaceData {
    return new GeneralFaceData( this.board, face => this.getFaceValue( face ) );
  }

  public createDelta(): TDelta<TFaceData> {
    return new GeneralFaceDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedFaceData {
    return serializeFaceData( board, this );
  }

  public static deserializeState( board: TBoard, serializedFaceData: TSerializedFaceData ): GeneralFaceData {
    const map: Map<TFace, FaceValue> = new Map( serializedFaceData.faces.map( ( serializedFaceValue: { face: TSerializedFace; state: FaceValue } ) => [
      deserializeFace( board, serializedFaceValue.face ),
      serializedFaceValue.state
    ] ) );

    return new GeneralFaceData(
      board,
      face => map.get( face ) ?? null
    );
  }
}