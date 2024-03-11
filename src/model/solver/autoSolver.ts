import { DerivedProperty } from 'phet-lib/axon';
import { CompositeSolver } from './CompositeSolver';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver';
import { SimpleVertexSolver } from './SimpleVertexSolver';
import { SimpleFaceSolver } from './SimpleFaceSolver';
import { LocalStorageBooleanProperty } from '../../util/localStorage.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { EdgeBacktrackerSolver } from './EdgeBacktracker.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SimpleFaceColorSolver } from './SimpleFaceColorSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { FaceColorParitySolver } from './FaceColorParitySolver.ts';
import { iterateSolverFactory } from './TSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { StaticDoubleMinusOneFacesSolver } from './StaticDoubleMinusOneFacesSolver.ts';

export const autoSolveSimpleVertexJointToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexJointToRedProperty', true );
export const autoSolveSimpleVertexForcedLineToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexForcedLineToBlackProperty', true );
export const autoSolveSimpleVertexAlmostEmptyToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexAlmostEmptyToRedProperty', true );

export const autoSolveSimpleFaceToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleFaceToRedProperty', true );
export const autoSolveSimpleFaceToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleFaceToBlackProperty', true );

export const autoSolveSimpleLoopToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleLoopToRedProperty', true );
export const autoSolveSimpleLoopToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleLoopToBlackProperty', false );

export const autoSolveDoubleMinusOneFacesProperty = new LocalStorageBooleanProperty( 'autoSolveDoubleMinusOneFacesProperty', false );

export const autoSolveFaceColorToRedProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorToRedProperty', false );
export const autoSolveFaceColorToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorToBlackProperty', false );

export const autoSolveFaceColorParityToRedProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorParityToRedProperty', false );
export const autoSolveFaceColorParityToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorParityToBlackProperty', false );
export const autoSolveFaceColorParityColorsProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorParityColorsProperty', false );
export const autoSolveFaceColorParityPartialReductionProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorParityPartialReductionProperty', false );

// TODO: have some way of the autoSolver ALWAYS having these solvers?
export const safeSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
    new SafeEdgeToSimpleRegionSolver( board, state ),
    new SafeSolvedEdgeSolver( board, state ),
    new SafeEdgeToFaceColorSolver( board, state )
  ] );
};

export const safeSolve = ( board: TBoard, state: TState<TCompleteData> ) => {
  iterateSolverFactory( safeSolverFactory, board, state, true );
};

export const autoSolverFactoryProperty = new DerivedProperty( [
  autoSolveSimpleVertexJointToRedProperty,
  autoSolveSimpleVertexForcedLineToBlackProperty,
  autoSolveSimpleVertexAlmostEmptyToRedProperty,
  autoSolveSimpleFaceToRedProperty,
  autoSolveSimpleFaceToBlackProperty,
  autoSolveSimpleLoopToRedProperty,
  autoSolveSimpleLoopToBlackProperty,
  autoSolveDoubleMinusOneFacesProperty,
  autoSolveFaceColorToRedProperty,
  autoSolveFaceColorToBlackProperty,
  autoSolveFaceColorParityToRedProperty,
  autoSolveFaceColorParityToBlackProperty,
  autoSolveFaceColorParityColorsProperty,
  autoSolveFaceColorParityPartialReductionProperty
], (
  simpleVertexJointToRed,
  simpleVertexOnlyOptionToBlack,
  simpleVertexAlmostEmptyToRed,
  simpleFaceToRed,
  simpleFaceToBlack,
  simpleLoopToRed,
  simpleLoopToBlack,
  doubleMinusOneFaces,
  simpleFaceColorToRed,
  simpleFaceColorToBlack,
  simpleFaceColorParityToRed,
  simpleFaceColorParityToBlack,
  simpleFaceColorParityColors,
  simpleFaceColorParityPartialReduction
) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      ...( simpleVertexJointToRed || simpleVertexOnlyOptionToBlack || simpleVertexAlmostEmptyToRed ? [
        new SimpleVertexSolver( board, state, {
          solveJointToRed: simpleVertexJointToRed,
          solveForcedLineToBlack: simpleVertexOnlyOptionToBlack,
          solveAlmostEmptyToRed: simpleVertexAlmostEmptyToRed
        }, dirty ? undefined : [] )
      ] : [] ),
      ...( simpleFaceToRed || simpleFaceToBlack ? [
        new SimpleFaceSolver( board, state, {
          solveToRed: simpleFaceToRed,
          solveToBlack: simpleFaceToBlack,
        }, dirty ? undefined : [] )
      ] : [] ),
      ...( doubleMinusOneFaces ? [
        new StaticDoubleMinusOneFacesSolver( board, state, dirty ? undefined : [] )
      ] : [] ),
      safeSolverFactory( board, state, dirty ),

      // We rely on the Simple Regions being accurate here, so they are lower down
      ...( simpleLoopToRed || simpleLoopToBlack ? [
        new SimpleLoopSolver( board, state, {
          solveToRed: simpleLoopToRed,
          solveToBlack: simpleLoopToBlack,
          resolveAllRegions: false // TODO: for full better exhaustive solvers, have true
        }, dirty ? undefined : [] )
      ] : [] ),

      ...( simpleFaceColorToRed || simpleFaceColorToBlack ? [
        new SimpleFaceColorSolver( board, state, {
          solveToRed: simpleFaceColorToRed,
          solveToBlack: simpleFaceColorToBlack
        }, dirty ? undefined : [] )
      ] : [] ),

      ...( simpleFaceColorParityToRed || simpleFaceColorParityToBlack || simpleFaceColorParityColors ? [
        new FaceColorParitySolver( board, state, {
          solveToRed: simpleFaceColorParityToRed,
          solveToBlack: simpleFaceColorParityToBlack,
          solveColors: simpleFaceColorParityColors,
          allowPartialReduction: simpleFaceColorParityPartialReduction
        }, dirty ? undefined : [] )
      ] : [] )
    ] );
  };
} );

export const standardSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
    new SimpleVertexSolver( board, state, {
      solveJointToRed: true,
      solveForcedLineToBlack: true,
      solveAlmostEmptyToRed: true
    } ),
    new SimpleFaceSolver( board, state, {
      solveToRed: true,
      solveToBlack: true,
    } ),
    new SafeEdgeToSimpleRegionSolver( board, state ),
    new SafeSolvedEdgeSolver( board, state ),

    // We rely on the Simple Regions being accurate here, so they are lower down
    new SimpleLoopSolver( board, state, {
      solveToRed: true,
      solveToBlack: true,
      resolveAllRegions: false // NOTE: this will be faster
    } ),

    // e.g. double-3s adjacent in square form
    new StaticDoubleMinusOneFacesSolver( board, state ),

    // We rely on the Face colors being accurate here
    new SimpleFaceColorSolver( board, state, {
      solveToRed: true,
      solveToBlack: true
    } ),

    new FaceColorParitySolver( board, state, {
      solveToRed: true,
      solveToBlack: true,
      solveColors: true,
      allowPartialReduction: true,
    } )
  ] );
};

export const backtrackerSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new EdgeBacktrackerSolver( board, state, {
    solverFactory: standardSolverFactory,
    depth: 1
  } );
};
