import { TState } from '../core/TState.ts';
import { serializeFaceData, TFaceData, TSerializedFaceData } from './TFaceData.ts';
import { deserializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { GeneralFaceDelta } from './GeneralFaceDelta.ts';

export class GeneralFaceData implements TState<TFaceData> {

  public readonly faceStateChangedEmitter = new TinyEmitter<[ TFace, FaceState ]>();

  public readonly faceStateMap: Map<TFace, FaceState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState
  ) {
    board.faces.forEach( face => {
      this.faceStateMap.set( face, getInitialFaceState( face ) );
    } );
  }

  public getFaceState( face: TFace ): FaceState {
    assertEnabled() && assert( this.faceStateMap.has( face ) );

    return this.faceStateMap.get( face )!;
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    assertEnabled() && assert( this.faceStateMap.has( face ) );

    const oldState = this.faceStateMap.get( face )!;

    if ( oldState !== state ) {
      this.faceStateMap.set( face, state );

      this.faceStateChangedEmitter.emit( face, state );
    }
  }

  public clone(): GeneralFaceData {
    return new GeneralFaceData( this.board, face => this.getFaceState( face ) );
  }

  public createDelta(): TDelta<TFaceData> {
    return new GeneralFaceDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedFaceData {
    return serializeFaceData( board, this );
  }

  public static deserializeState( board: TBoard, serializedFaceData: TSerializedFaceData ): GeneralFaceData {
    const map: Map<TFace, FaceState> = new Map( serializedFaceData.faces.map( ( serializedFaceState: { face: TSerializedFace; state: FaceState } ) => [
      deserializeFace( board, serializedFaceState.face ),
      serializedFaceState.state
    ] ) );

    return new GeneralFaceData(
      board,
      face => map.get( face ) ?? null
    );
  }
}