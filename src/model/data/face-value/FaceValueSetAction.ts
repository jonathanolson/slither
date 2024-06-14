import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceValueData } from './TFaceValueData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';

export class FaceValueSetAction implements TAction<TFaceValueData> {
  public constructor(
    public readonly face: TFace,
    public readonly state: FaceValue,
  ) {}

  public apply(state: TFaceValueData): void {
    state.setFaceValue(this.face, this.state);
  }

  public getUndo(state: TFaceValueData): TAction<TFaceValueData> {
    const previousValue = state.getFaceValue(this.face);
    return new FaceValueSetAction(this.face, previousValue);
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'FaceValueSetAction',
      edge: serializeFace(this.face),
      state: this.state,
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): FaceValueSetAction {
    return new FaceValueSetAction(deserializeFace(board, serializedAction.edge), serializedAction.state);
  }
}
