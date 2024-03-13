import { EdgeStateCycleAction } from '../edge-state/EdgeStateCycleAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { EdgeStateSetAction } from '../edge-state/EdgeStateSetAction.ts';
import { GeneralEdgeStateAction } from '../edge-state/GeneralEdgeStateAction.ts';
import { FaceValueSetAction } from '../face-value/FaceValueSetAction.ts';
import { GeneralFaceValueAction } from '../face-value/GeneralFaceValueAction.ts';
import { NoOpAction } from './NoOpAction.ts';
import { CompositeAction } from './CompositeAction.ts';
import { CompleteAction } from '../combined/CompleteAction.ts';
import { GeneralSimpleRegionAction } from '../simple-region/GeneralSimpleRegionAction.ts';
import { UserLoadPuzzleAutoSolveAction, UserRequestSolveAction } from '../../puzzle/PuzzleModel.ts';

export interface TAction<Data> {
  apply( state: Data ): void;

  getUndo( state: Data ): TAction<Data>; // the action to undo this action (if we applied the action on it).

  isEmpty(): boolean;

  serializeAction(): TSerializedAction;
}

export type TSerializedAction = {
  type: string;
} & any;

export const deserializeAction = ( board: TBoard, serializedAction: TSerializedAction ): TAction<TCompleteData> => {
  const type = serializedAction.type;

  if ( type === 'CompositeAction' ) {
    return CompositeAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'CompleteAction' ) {
    return CompleteAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'EdgeStateCycleAction' ) {
    return EdgeStateCycleAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'EdgeStateSetAction' ) {
    return EdgeStateSetAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'GeneralEdgeAction' ) {
    return GeneralEdgeStateAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'FaceValueSetAction' ) {
    return FaceValueSetAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'GeneralFaceAction' ) {
    return GeneralFaceValueAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'GeneralSimpleRegionAction' ) {
    return GeneralSimpleRegionAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'NoOpAction' ) {
    return NoOpAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'UserLoadPuzzleAutoSolveAction' ) {
    return UserLoadPuzzleAutoSolveAction.deserializeAction( board, serializedAction );
  }
  else if ( type === 'UserRequestSolveAction' ) {
    return UserRequestSolveAction.deserializeAction( board, serializedAction );
  }
  else {
    throw new Error( `Unknown action type: ${type}, could not deserialize` );
  }
};
