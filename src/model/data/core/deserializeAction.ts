import { TBoard } from '../../board/core/TBoard.ts';
import { UserLoadPuzzleAutoSolveAction } from '../../puzzle/UserLoadPuzzleAutoSolveAction.ts';
import { UserRequestSolveAction } from '../../puzzle/UserRequestSolveAction.ts';
import { CompleteAction } from '../combined/CompleteAction.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { EdgeStateCycleAction } from '../edge-state/EdgeStateCycleAction.ts';
import { EdgeStateSetAction } from '../edge-state/EdgeStateSetAction.ts';
import { GeneralEdgeStateAction } from '../edge-state/GeneralEdgeStateAction.ts';
import { FaceColorMakeOppositeAction } from '../face-color/FaceColorMakeOppositeAction.ts';
import { FaceColorMakeSameAction } from '../face-color/FaceColorMakeSameAction.ts';
import { FaceColorSetAbsoluteAction } from '../face-color/FaceColorSetAbsoluteAction.ts';
import { FaceValueSetAction } from '../face-value/FaceValueSetAction.ts';
import { GeneralFaceValueAction } from '../face-value/GeneralFaceValueAction.ts';
import { SectorStateSetAction } from '../sector-state/SectorStateSetAction.ts';
import { GeneralSimpleRegionAction } from '../simple-region/GeneralSimpleRegionAction.ts';
import { AnnotatedAction } from './AnnotatedAction.ts';
import { CompositeAction } from './CompositeAction.ts';
import { NoOpAction } from './NoOpAction.ts';
import { TAction, TSerializedAction } from './TAction.ts';

export const deserializeAction = (board: TBoard, serializedAction: TSerializedAction): TAction<TCompleteData> => {
  const type = serializedAction.type;

  if (type === 'CompositeAction') {
    return CompositeAction.deserializeAction(board, serializedAction);
  } else if (type === 'AnnotatedAction') {
    return AnnotatedAction.deserializeAction(board, serializedAction);
  } else if (type === 'CompleteAction') {
    return CompleteAction.deserializeAction(board, serializedAction);
  } else if (type === 'EdgeStateCycleAction') {
    return EdgeStateCycleAction.deserializeAction(board, serializedAction);
  } else if (type === 'EdgeStateSetAction') {
    return EdgeStateSetAction.deserializeAction(board, serializedAction);
  } else if (type === 'GeneralEdgeAction') {
    return GeneralEdgeStateAction.deserializeAction(board, serializedAction);
  } else if (type === 'FaceValueSetAction') {
    return FaceValueSetAction.deserializeAction(board, serializedAction);
  } else if (type === 'GeneralFaceAction') {
    return GeneralFaceValueAction.deserializeAction(board, serializedAction);
  } else if (type === 'GeneralSimpleRegionAction') {
    return GeneralSimpleRegionAction.deserializeAction(board, serializedAction);
  } else if (type === 'NoOpAction') {
    return NoOpAction.deserializeAction(board, serializedAction);
  } else if (type === 'UserLoadPuzzleAutoSolveAction') {
    return UserLoadPuzzleAutoSolveAction.deserializeAction(board, serializedAction);
  } else if (type === 'UserRequestSolveAction') {
    return UserRequestSolveAction.deserializeAction(board, serializedAction);
  } else if (type === 'FaceColorMakeOppositeAction') {
    return FaceColorMakeOppositeAction.deserializeAction(board, serializedAction);
  } else if (type === 'FaceColorMakeSameAction') {
    return FaceColorMakeSameAction.deserializeAction(board, serializedAction);
  } else if (type === 'FaceColorSetAbsoluteAction') {
    return FaceColorSetAbsoluteAction.deserializeAction(board, serializedAction);
  } else if (type === 'SectorStateSetAction') {
    return SectorStateSetAction.deserializeAction(board, serializedAction);
  } else {
    throw new Error(`Unknown action type: ${type}, could not deserialize`);
  }
};
