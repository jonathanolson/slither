import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { BinaryMixedRuleGroup } from '../pattern/collection/BinaryMixedRuleGroup.ts';
import { generalAllMixedGroup } from '../pattern/collection/generalAllMixedGroup.ts';
import { generalColorMixedGroup } from '../pattern/collection/generalColorMixedGroup.ts';
import { generalEdgeColorMixedGroup } from '../pattern/collection/generalEdgeColorMixedGroup.ts';
import { generalEdgeMixedGroup } from '../pattern/collection/generalEdgeMixedGroup.ts';
import { generalEdgeSectorMixedGroup } from '../pattern/collection/generalEdgeSectorMixedGroup.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { BinaryPatternSolver } from './BinaryPatternSolver.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { FaceColorDisconnectionSolver } from './FaceColorDisconnectionSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';

const getFactory = (groups: BinaryMixedRuleGroup[], includeColorDisconnection: boolean) => {
  return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
    const boardPatternBoard = BoardPatternBoard.get(board);

    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
      new SafeEdgeToSimpleRegionSolver(board, state),
      new SafeSolvedEdgeSolver(board, state),
      new SafeEdgeToFaceColorSolver(board, state),

      ...(includeColorDisconnection ? [new FaceColorDisconnectionSolver(board, state)] : []),

      ...groups.map((group) => BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, group)),

      new SimpleLoopSolver(board, state, {
        solveToRed: true,
        solveToBlack: true,
        resolveAllRegions: false, // NOTE: this will be faster
      }),
    ]);
  };
};

export const generalEdgePatternSolverFactory = getFactory([generalEdgeMixedGroup], false);
export const generalColorPatternSolverFactory = getFactory([generalColorMixedGroup], true);
export const generalEdgeColorPatternSolverFactory = getFactory(
  [generalEdgeColorMixedGroup, generalColorMixedGroup, generalEdgeMixedGroup],
  true,
);
export const generalEdgeSectorPatternSolverFactory = getFactory(
  [generalEdgeSectorMixedGroup, generalEdgeMixedGroup],
  true,
);
export const generalAllPatternSolverFactory = getFactory(
  [
    generalAllMixedGroup,
    generalEdgeColorMixedGroup,
    generalEdgeSectorMixedGroup,
    generalColorMixedGroup,
    generalEdgeMixedGroup,
  ],
  true,
);
