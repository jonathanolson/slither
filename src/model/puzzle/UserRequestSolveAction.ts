import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { NoOpAction } from '../data/core/NoOpAction.ts';
import { TSerializedAction } from '../data/core/TAction.ts';

export class UserRequestSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserRequestSolveAction = true;

  public override serializeAction(): TSerializedAction {
    return {
      type: 'UserRequestSolveAction',
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): UserRequestSolveAction {
    return new UserRequestSolveAction();
  }
}
