import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { NoOpAction } from '../data/core/NoOpAction.ts';
import { TAction, TSerializedAction } from '../data/core/TAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TAnnotation } from '../data/core/TAnnotation.ts';

export class UserPuzzleHintApplyAction implements TAnnotatedAction<TCompleteData> {
  public constructor(public readonly hintAction: TAnnotatedAction<TCompleteData>) {}

  public get annotation(): TAnnotation {
    return this.hintAction.annotation;
  }

  public apply(state: TCompleteData): void {
    this.hintAction.apply(state);
  }

  public getUndo(state: TCompleteData): TAction<TCompleteData> {
    throw new Error('unimplemented');
  }

  public isEmpty(): boolean {
    return this.hintAction.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    throw new Error('unimplemented');
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): NoOpAction<any> {
    throw new Error('unimplemented');
  }
}
