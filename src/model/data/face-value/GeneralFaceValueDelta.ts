import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import FaceValue from './FaceValue.ts';
import { GeneralFaceValueAction } from './GeneralFaceValueAction.ts';
import { TFaceValueData, TSerializedFaceValueData, serializeFaceValueData } from './TFaceValueData.ts';

import { TinyEmitter } from 'phet-lib/axon';

export class GeneralFaceValueDelta extends GeneralFaceValueAction implements TDelta<TFaceValueData> {
  public readonly faceValueChangedEmitter = new TinyEmitter<[TFace, FaceValue]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceValueData>,
    faceValueMap: Map<TFace, FaceValue> = new Map(),
  ) {
    super(board, faceValueMap);
  }

  public getFaceValue(face: TFace): FaceValue {
    if (this.faceValueMap.has(face)) {
      return this.faceValueMap.get(face)!;
    } else {
      return this.parentState.getFaceValue(face);
    }
  }

  public setFaceValue(face: TFace, state: FaceValue): void {
    const oldValue = this.getFaceValue(face);

    if (oldValue !== state) {
      this.faceValueMap.set(face, state);

      this.faceValueChangedEmitter.emit(face, state);
    }
  }

  public clone(): GeneralFaceValueDelta {
    return new GeneralFaceValueDelta(this.board, this.parentState, new Map(this.faceValueMap));
  }

  public createDelta(): TDelta<TFaceValueData> {
    return new GeneralFaceValueDelta(this.board, this, new Map());
  }

  public serializeState(board: TBoard): TSerializedFaceValueData {
    return serializeFaceValueData(board, this);
  }
}
