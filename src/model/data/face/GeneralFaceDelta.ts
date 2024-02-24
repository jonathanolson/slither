import { GeneralFaceAction } from './GeneralFaceAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeFaceData, TFaceData, TSerializedFaceData } from './TFaceData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';

export class GeneralFaceDelta extends GeneralFaceAction implements TDelta<TFaceData> {

  public readonly faceStateChangedEmitter = new TinyEmitter<[ TFace, FaceState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceData>,
    faceStateMap: Map<TFace, FaceState> = new Map()
  ) {
    super( board, faceStateMap );
  }

  public getFaceState( face: TFace ): FaceState {
    if ( this.faceStateMap.has( face ) ) {
      return this.faceStateMap.get( face )!;
    }
    else {
      return this.parentState.getFaceState( face );
    }
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    const oldState = this.getFaceState( face );

    if ( oldState !== state ) {
      this.faceStateMap.set( face, state );

      this.faceStateChangedEmitter.emit( face, state );
    }
  }

  public clone(): GeneralFaceDelta {
    return new GeneralFaceDelta( this.board, this.parentState, new Map( this.faceStateMap ) );
  }

  public createDelta(): TDelta<TFaceData> {
    return new GeneralFaceDelta( this.board, this, new Map() );
  }

  public serializeState( board: TBoard ): TSerializedFaceData {
    return serializeFaceData( board, this );
  }
}