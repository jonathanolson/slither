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
import { Embedding } from '../pattern/embedding/Embedding.ts';
import { TBoardFeatureData } from '../pattern/feature/TBoardFeatureData.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { TPatternBoard } from '../pattern/pattern-board/TPatternBoard.ts';
import { PatternRule } from '../pattern/pattern-rule/PatternRule.ts';
import { BinaryPatternSolver } from './BinaryPatternSolver.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';

const getFactory = (groups: BinaryMixedRuleGroup[]) => {
  return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
    // TODO: how can we NOT leak things? Embeddings...? Lazy creation?
    const boardPatternBoard = new BoardPatternBoard(board);

    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
      new SafeEdgeToSimpleRegionSolver(board, state),
      new SafeSolvedEdgeSolver(board, state),
      new SafeEdgeToFaceColorSolver(board, state),

      ...groups.map((group) => {
        // TODO: should we move this code into BinaryMixedRuleGroup?
        return new BinaryPatternSolver(board, boardPatternBoard, state, {
          size: group.size,
          findNextActionableEmbeddedRuleFromData: (
            targetPatternBoard: TPatternBoard,
            boardData: TBoardFeatureData,
            initialRuleIndex = 0,
          ): { rule: PatternRule; embeddedRule: PatternRule; embedding: Embedding; ruleIndex: number } | null => {
            return group.collection.findNextActionableEmbeddedRuleFromData(
              targetPatternBoard,
              boardData,
              initialRuleIndex,
              (ruleIndex) => {
                return group.isRuleIndexHighlander(ruleIndex);
              },
            );
          },
        });
      }),

      new SimpleLoopSolver(board, state, {
        solveToRed: true,
        solveToBlack: true,
        resolveAllRegions: false, // NOTE: this will be faster
      }),
    ]);
  };
};

export const generalEdgePatternSolverFactory = getFactory([generalEdgeMixedGroup]);
export const generalColorPatternSolverFactory = getFactory([generalColorMixedGroup]);
export const generalEdgeColorPatternSolverFactory = getFactory([
  generalEdgeColorMixedGroup,
  generalColorMixedGroup,
  generalEdgeMixedGroup,
]);
export const generalEdgeSectorPatternSolverFactory = getFactory([generalEdgeSectorMixedGroup, generalEdgeMixedGroup]);
export const generalAllPatternSolverFactory = getFactory([
  generalAllMixedGroup,
  generalEdgeColorMixedGroup,
  generalEdgeSectorMixedGroup,
  generalColorMixedGroup,
  generalEdgeMixedGroup,
]);
