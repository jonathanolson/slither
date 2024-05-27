import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { BinaryPatternSolver } from './BinaryPatternSolver.ts';
import { TinyProperty } from 'phet-lib/axon';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';
import { getGeneralEdgeMixedGroup } from '../pattern/collection/getGeneralEdgeMixedGroup.ts';
import { getGeneralColorMixedGroup } from '../pattern/collection/getGeneralColorMixedGroup.ts';
import { getGeneralEdgeColorMixedGroup } from '../pattern/collection/getGeneralEdgeColorMixedGroup.ts';
import { getGeneralEdgeSectorMixedGroup } from '../pattern/collection/getGeneralEdgeSectorMixedGroup.ts';
import { getGeneralAllMixedGroup } from '../pattern/collection/getGeneralAllMixedGroup.ts';
import { BinaryMixedRuleGroup } from '../pattern/collection/BinaryMixedRuleGroup.ts';
import { TPatternBoard } from '../pattern/pattern-board/TPatternBoard.ts';
import { TBoardFeatureData } from '../pattern/feature/TBoardFeatureData.ts';
import { PatternRule } from '../pattern/pattern-rule/PatternRule.ts';
import { Embedding } from '../pattern/embedding/Embedding.ts';

const generalEdgePatternGroupProperty = new TinyProperty<BinaryMixedRuleGroup | null>( null );
const generalColorPatternGroupProperty = new TinyProperty<BinaryMixedRuleGroup | null>( null );
const generalEdgeColorPatternGroupProperty = new TinyProperty<BinaryMixedRuleGroup | null>( null );
const generalEdgeSectorPatternGroupProperty = new TinyProperty<BinaryMixedRuleGroup | null>( null );
const generalAllPatternGroupProperty = new TinyProperty<BinaryMixedRuleGroup | null>( null );

const getFactory = ( groupProperty: TinyProperty<BinaryMixedRuleGroup | null>, getGroup: () => BinaryMixedRuleGroup ) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    if ( !groupProperty.value ) {
      groupProperty.value = getGroup();
    }

    const group = groupProperty.value!;
    assertEnabled() && assert( group );

    // TODO: how can we NOT leak things? Embeddings...? Lazy creation?
    const boardPatternBoard = new BoardPatternBoard( board );

    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      new SafeEdgeToSimpleRegionSolver( board, state ),
      new SafeSolvedEdgeSolver( board, state ),
      new SafeEdgeToFaceColorSolver( board, state ),

      // TODO: should we move this code into BinaryMixedRuleGroup?
      new BinaryPatternSolver( board, boardPatternBoard, state, {
        size: group.size,
        findNextActionableEmbeddedRuleFromData: (
          targetPatternBoard: TPatternBoard,
          boardData: TBoardFeatureData,
          initialRuleIndex = 0
        ): { rule: PatternRule; embeddedRule: PatternRule; embedding: Embedding; ruleIndex: number } | null => {
          return group.collection.findNextActionableEmbeddedRuleFromData( targetPatternBoard, boardData, initialRuleIndex, ruleIndex => {
            return group.isRuleIndexHighlander( ruleIndex );
          } );
        }
      } ),

      new SimpleLoopSolver( board, state, {
        solveToRed: true,
        solveToBlack: true,
        resolveAllRegions: false // NOTE: this will be faster
      } ),
    ] );
  };
};

export const generalEdgePatternSolverFactory = getFactory( generalEdgePatternGroupProperty, getGeneralEdgeMixedGroup );
export const generalColorPatternSolverFactory = getFactory( generalColorPatternGroupProperty, getGeneralColorMixedGroup );
export const generalEdgeColorPatternSolverFactory = getFactory( generalEdgeColorPatternGroupProperty, getGeneralEdgeColorMixedGroup );
export const generalEdgeSectorPatternSolverFactory = getFactory( generalEdgeSectorPatternGroupProperty, getGeneralEdgeSectorMixedGroup );
export const generalAllPatternSolverFactory = getFactory( generalAllPatternGroupProperty, getGeneralAllMixedGroup );
