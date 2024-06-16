import { TBoard } from '../../board/core/TBoard.ts';
import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceColorData } from './TFaceColorData.ts';

export class FaceColorInvalidAction implements TAction<TFaceColorData> {
  public constructor() {}

  public apply(state: TFaceColorData): void {
    state.modifyFaceColors([], [], new Map(), new Map(), true);
  }

  public getUndo(state: TFaceColorData): TAction<TFaceColorData> {
    throw new Error('getUndo unimplemented in FaceColorInvalidAction');
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    // TODO: implement
    throw new Error('serializeAction unimplemented in FaceColorInvalidAction');
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): FaceColorInvalidAction {
    throw new Error('deserializeAction unimplemented in FaceColorInvalidAction');
  }
}
