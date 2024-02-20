import { DerivedProperty } from 'phet-lib/axon';
import { TBoard, TCompleteData, TState } from '../structure';
import { CompositeSolver } from './CompositeSolver';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver';
import { SimpleVertexSolver } from './SimpleVertexSolver';
import { SimpleFaceSolver } from './SimpleFaceSolver';
import { LocalStorageBooleanProperty } from '../../util/localStorage.ts';

// TODO: have certain Properties that serialize to localStorage transparently!
export const autoSolveSimpleVertexJointToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexJointToRedProperty', true );
export const autoSolveSimpleVertexOnlyOptionToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexOnlyOptionToBlackProperty', true );
export const autoSolveSimpleVertexAlmostEmptyToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexAlmostEmptyToRedProperty', true );
export const autoSolveSimpleFaceToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleFaceToRedProperty', true );
export const autoSolveSimpleFaceToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleFaceToBlackProperty', true );

// TODO: have some way of the autoSolver ALWAYS having these solvers?
export const safeSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new CompositeSolver( [
    new SafeEdgeToSimpleRegionSolver( board, state )
  ] );
};

export const autoSolverFactoryProperty = new DerivedProperty( [
  autoSolveSimpleVertexJointToRedProperty,
  autoSolveSimpleVertexOnlyOptionToBlackProperty,
  autoSolveSimpleVertexAlmostEmptyToRedProperty,
  autoSolveSimpleFaceToRedProperty,
  autoSolveSimpleFaceToBlackProperty
], (
  simpleVertexJointToRed,
  simpleVertexOnlyOptionToBlack,
  simpleVertexAlmostEmptyToRed,
  simpleFaceToRed,
  simpleFaceToBlack
) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver( [
      new SimpleVertexSolver( board, state, {
        solveJointToRed: simpleVertexJointToRed,
        solveOnlyOptionToBlack: simpleVertexOnlyOptionToBlack,
        solveAlmostEmptyToRed: simpleVertexAlmostEmptyToRed
      }, dirty ? undefined : [] ),
      new SimpleFaceSolver( board, state, {
        solveToRed: simpleFaceToRed,
        solveToBlack: simpleFaceToBlack,
      }, dirty ? undefined : [] ),
      safeSolverFactory( board, state, dirty )
    ] );
  };
} );
