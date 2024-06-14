import { NoOpAction } from '../data/core/NoOpAction.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TSerializedAction } from '../data/core/TAction.ts';
import { TBoard } from '../board/core/TBoard.ts';

export class UserLoadPuzzleAutoSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserLoadPuzzleAutoSolveAction = true;

  public override serializeAction(): TSerializedAction {
    return {
      type: 'UserLoadPuzzleAutoSolveAction',
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): UserLoadPuzzleAutoSolveAction {
    return new UserLoadPuzzleAutoSolveAction();
  }
}
