
import { BooleanProperty, DerivedProperty } from "phet-lib/axon";
import { TAction, TBoard, TCompleteData, TState, TStructure } from '../structure';
import { TSolver } from "./TSolver";
import { CompositeSolver } from "./CompositeSolver";
import { SafeEdgeToSimpleRegionSolver } from "./SafeEdgeToSimpleRegionSolver";
import { SimpleVertexSolver } from "./SimpleVertexSolver";
import { SimpleFaceSolver } from "./SimpleFaceSolver";

export type SolverFactory<Structure extends TStructure, Data> = ( board: TBoard<TStructure>, state: TState<Data> ) => TSolver<Data, TAction<Data>>;

// TODO: have certain Properties that serialize to localStorage transparently!
export const autoSolveSimpleVertexJointToRedProperty = new BooleanProperty( true );
export const autoSolveSimpleVertexOnlyOptionToBlackProperty = new BooleanProperty( true );
export const autoSolveSimpleVertexAlmostEmptyToRedProperty = new BooleanProperty( true );
export const autoSolveSimpleFaceToRedProperty = new BooleanProperty( true );
export const autoSolveSimpleFaceToBlackProperty = new BooleanProperty( true );

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
  return ( board: TBoard, state: TState<TCompleteData> ) => {
    return new CompositeSolver( [
      new SimpleVertexSolver( board, state, {
        solveJointToRed: simpleVertexJointToRed,
        solveOnlyOptionToBlack: simpleVertexOnlyOptionToBlack,
        solveAlmostEmptyToRed: simpleVertexAlmostEmptyToRed
      } ),
      new SimpleFaceSolver( board, state, {
        solveToRed: simpleFaceToRed,
        solveToBlack: simpleFaceToBlack,
      }, [] ),
      new SafeEdgeToSimpleRegionSolver( board, state )
    ] );
  };
} );

export const safeSolverFactory = ( board: TBoard, state: TState<TCompleteData> ) => {
  return new CompositeSolver( [
    new SafeEdgeToSimpleRegionSolver( board, state )
  ] );
};