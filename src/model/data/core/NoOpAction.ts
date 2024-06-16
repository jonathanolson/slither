import { TBoard } from '../../board/core/TBoard.ts';
import { TAction, TSerializedAction } from './TAction.ts';

export class NoOpAction<Data> implements TAction<Data> {
  public apply(state: Data): void {
    // DO NOTHING
  }

  public getUndo(state: Data): TAction<Data> {
    return this;
  }

  public isEmpty(): boolean {
    return true;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'NoOpAction',
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): NoOpAction<any> {
    return new NoOpAction();
  }
}
