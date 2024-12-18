import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { TAction, TSerializedAction } from '../core/TAction.ts';
import { FaceState } from './FaceState.ts';
import { TFaceStateData } from './TFaceStateData.ts';

export class FaceStateSetAction implements TAction<TFaceStateData> {
  public constructor(
    public readonly face: TFace,
    public readonly state: FaceState,
  ) {}

  public apply(state: TFaceStateData): void {
    state.setFaceState(this.face, this.state);
  }

  public getUndo(state: TFaceStateData): TAction<TFaceStateData> {
    const previousState = state.getFaceState(this.face);
    return new FaceStateSetAction(this.face, previousState);
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'FaceStateSetAction',
      face: serializeFace(this.face),
      state: this.state.serialize(),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): FaceStateSetAction {
    const face = deserializeFace(board, serializedAction.face);
    return new FaceStateSetAction(face, FaceState.deserialize(face, serializedAction.state));
  }
}
