import { GeneralFaceAction } from './GeneralFaceAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeFaceData, TFaceData, TSerializedFaceData } from './TFaceData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';

export class GeneralFaceDelta extends GeneralFaceAction implements TDelta<TFaceData> {

  public readonly faceValueChangedEmitter = new TinyEmitter<[ TFace, FaceValue ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceData>,
    faceValueMap: Map<TFace, FaceValue> = new Map()
  ) {
    super( board, faceValueMap );
  }

  public getFaceValue( face: TFace ): FaceValue {
    if ( this.faceValueMap.has( face ) ) {
      return this.faceValueMap.get( face )!;
    }
    else {
      return this.parentState.getFaceValue( face );
    }
  }

  public setFaceValue( face: TFace, state: FaceValue ): void {
    const oldValue = this.getFaceValue( face );

    if ( oldValue !== state ) {
      this.faceValueMap.set( face, state );

      this.faceValueChangedEmitter.emit( face, state );
    }
  }

  public clone(): GeneralFaceDelta {
    return new GeneralFaceDelta( this.board, this.parentState, new Map( this.faceValueMap ) );
  }

  public createDelta(): TDelta<TFaceData> {
    return new GeneralFaceDelta( this.board, this, new Map() );
  }

  public serializeState( board: TBoard ): TSerializedFaceData {
    return serializeFaceData( board, this );
  }
}