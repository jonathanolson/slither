import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import FaceValue from './FaceValue.ts';
import { GeneralFaceValueDelta } from './GeneralFaceValueDelta.ts';
import { TFaceValueData, TSerializedFaceValueData, serializeFaceValueData } from './TFaceValueData.ts';

import { TinyEmitter } from 'phet-lib/axon';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class GeneralFaceValueData implements TState<TFaceValueData> {
  public readonly faceValueChangedEmitter = new TinyEmitter<[TFace, FaceValue]>();

  public readonly faceValueMap: Map<TFace, FaceValue> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialFaceValue: (face: TFace) => FaceValue,
  ) {
    board.faces.forEach((face) => {
      this.faceValueMap.set(face, getInitialFaceValue(face));
    });
  }

  public getFaceValue(face: TFace): FaceValue {
    assertEnabled() && assert(this.faceValueMap.has(face));

    return this.faceValueMap.get(face)!;
  }

  public setFaceValue(face: TFace, state: FaceValue): void {
    assertEnabled() && assert(this.faceValueMap.has(face));

    const oldValue = this.faceValueMap.get(face)!;

    if (oldValue !== state) {
      this.faceValueMap.set(face, state);

      this.faceValueChangedEmitter.emit(face, state);
    }
  }

  public clone(): GeneralFaceValueData {
    return new GeneralFaceValueData(this.board, (face) => this.getFaceValue(face));
  }

  public createDelta(): TDelta<TFaceValueData> {
    return new GeneralFaceValueDelta(this.board, this);
  }

  public serializeState(board: TBoard): TSerializedFaceValueData {
    return serializeFaceValueData(board, this);
  }

  public static deserializeState(
    board: TBoard,
    serializedFaceValueData: TSerializedFaceValueData,
  ): GeneralFaceValueData {
    const map: Map<TFace, FaceValue> = new Map(
      serializedFaceValueData.faces.map((serializedFaceValue: { face: TSerializedFace; state: FaceValue }) => [
        deserializeFace(board, serializedFaceValue.face),
        serializedFaceValue.state,
      ]),
    );

    return new GeneralFaceValueData(board, (face) => map.get(face) ?? null);
  }
}
