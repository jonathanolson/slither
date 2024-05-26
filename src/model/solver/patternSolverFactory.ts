import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { standardSolverFactory } from './standardSolverFactory.ts';
import { BoardPatternBoard } from '../pattern/BoardPatternBoard.ts';
import { BinaryPatternSolver } from './BinaryPatternSolver.ts';
import { BinaryRuleGroup } from '../pattern/rule-group/BinaryRuleGroup.ts';
import { getGeneralEdgeGroup } from '../pattern/rule-group/getGeneralEdgeGroup.ts';
import { TinyProperty } from 'phet-lib/axon';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getGeneralColorGroup } from '../pattern/rule-group/getGeneralColorGroup.ts';
import { getGeneralEdgeColorGroup } from '../pattern/rule-group/getGeneralEdgeColorGroup.ts';
import { getGeneralEdgeSectorGroup } from '../pattern/rule-group/getGeneralEdgeSectorGroup.ts';
import { getGeneralAllGroup } from '../pattern/rule-group/getGeneralAllGroup.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';

const generalEdgePatternGroupProperty = new TinyProperty<BinaryRuleGroup | null>( null );
const generalColorPatternGroupProperty = new TinyProperty<BinaryRuleGroup | null>( null );
const generalEdgeColorPatternGroupProperty = new TinyProperty<BinaryRuleGroup | null>( null );
const generalEdgeSectorPatternGroupProperty = new TinyProperty<BinaryRuleGroup | null>( null );
const generalAllPatternGroupProperty = new TinyProperty<BinaryRuleGroup | null>( null );

const getFactory = ( groupProperty: TinyProperty<BinaryRuleGroup | null>, getGroup: () => BinaryRuleGroup ) => {
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

      ...group.collections.map( collection => new BinaryPatternSolver( board, boardPatternBoard, state, collection ) ),
      standardSolverFactory( board, state, dirty ),
    ] );
  };
};

export const generalEdgePatternSolverFactory = getFactory( generalEdgePatternGroupProperty, getGeneralEdgeGroup );
export const generalColorPatternSolverFactory = getFactory( generalColorPatternGroupProperty, getGeneralColorGroup );
export const generalEdgeColorPatternSolverFactory = getFactory( generalEdgeColorPatternGroupProperty, getGeneralEdgeColorGroup );
export const generalEdgeSectorPatternSolverFactory = getFactory( generalEdgeSectorPatternGroupProperty, getGeneralEdgeSectorGroup );
export const generalAllPatternSolverFactory = getFactory( generalAllPatternGroupProperty, getGeneralAllGroup );
