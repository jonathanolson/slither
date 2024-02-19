import { BooleanProperty, DerivedProperty } from 'phet-lib/axon';
import { TBoard, TCompleteData, TState } from '../structure';
import { CompositeSolver } from './CompositeSolver';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver';
import { SimpleVertexSolver } from './SimpleVertexSolver';
import { SimpleFaceSolver } from './SimpleFaceSolver';

// TODO: have certain Properties that serialize to localStorage transparently!
export const autoSolveSimpleVertexJointToRedProperty = new BooleanProperty( true );
export const autoSolveSimpleVertexOnlyOptionToBlackProperty = new BooleanProperty( true );
export const autoSolveSimpleVertexAlmostEmptyToRedProperty = new BooleanProperty( true );
export const autoSolveSimpleFaceToRedProperty = new BooleanProperty( true );
export const autoSolveSimpleFaceToBlackProperty = new BooleanProperty( true );

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
