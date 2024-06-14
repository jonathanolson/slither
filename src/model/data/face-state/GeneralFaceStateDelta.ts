import { GeneralFaceStateAction } from './GeneralFaceStateAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeFaceStateData, TFaceStateData, TSerializedFaceStateData } from './TFaceStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TFace } from '../../board/core/TFace.ts';
import { FaceState } from './FaceState.ts';

export class GeneralFaceStateDelta extends GeneralFaceStateAction implements TDelta<TFaceStateData> {
  public readonly faceStateChangedEmitter = new TinyEmitter<[face: TFace, state: FaceState, oldState: FaceState]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceStateData>,
    faceStateMap: Map<TFace, FaceState> = new Map(),
  ) {
    super(board, faceStateMap);
  }

  public getFaceState(face: TFace): FaceState {
    if (this.faceStateMap.has(face)) {
      return this.faceStateMap.get(face)!;
    } else {
      return this.parentState.getFaceState(face);
    }
  }

  public setFaceState(face: TFace, state: FaceState): void {
    const oldState = this.getFaceState(face);

    if (!oldState.equals(state)) {
      this.faceStateMap.set(face, state);

      this.faceStateChangedEmitter.emit(face, state, oldState);
    }
  }

  public clone(): GeneralFaceStateDelta {
    return new GeneralFaceStateDelta(this.board, this.parentState, new Map(this.faceStateMap));
  }

  public createDelta(): TDelta<TFaceStateData> {
    return new GeneralFaceStateDelta(this.board, this, new Map());
  }

  public serializeState(board: TBoard): TSerializedFaceStateData {
    return serializeFaceStateData(board, this);
  }
}
