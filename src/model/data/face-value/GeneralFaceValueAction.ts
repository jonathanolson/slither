import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceValueData } from './TFaceValueData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';

export class GeneralFaceValueAction implements TAction<TFaceValueData> {
  public constructor(
    public readonly board: TBoard,
    public readonly faceValueMap: Map<TFace, FaceValue> = new Map(),
  ) {}

  public apply(state: TFaceValueData): void {
    for (const [face, faceValue] of this.faceValueMap) {
      state.setFaceValue(face, faceValue);
    }
  }

  public getUndo(state: TFaceValueData): TAction<TFaceValueData> {
    const faceValueMap = new Map<TFace, FaceValue>();

    for (const face of this.faceValueMap.keys()) {
      faceValueMap.set(face, state.getFaceValue(face));
    }

    return new GeneralFaceValueAction(this.board, faceValueMap);
  }

  public isEmpty(): boolean {
    return this.faceValueMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralFaceAction',
      faces: Array.from(this.faceValueMap.entries()).map(([face, faceValue]) => ({
        face: serializeFace(face),
        state: faceValue,
      })),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): GeneralFaceValueAction {
    return new GeneralFaceValueAction(
      board,
      new Map(
        serializedAction.faces.map((serializedFaceValue: { face: TSerializedFace; state: FaceValue }) => [
          deserializeFace(board, serializedFaceValue.face),
          serializedFaceValue.state,
        ]),
      ),
    );
  }
}
