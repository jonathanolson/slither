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

// TODO: have certain Properties that serialize to localStorage transparently!
export const autoSolveSimpleVertexJointToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexJointToRedProperty', true );
export const autoSolveSimpleVertexOnlyOptionToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexOnlyOptionToBlackProperty', true );
export const autoSolveSimpleVertexAlmostEmptyToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleVertexAlmostEmptyToRedProperty', true );
export const autoSolveSimpleFaceToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleFaceToRedProperty', true );
export const autoSolveSimpleFaceToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleFaceToBlackProperty', true );
export const autoSolveSimpleLoopToRedProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleLoopToRedProperty', true );
export const autoSolveSimpleLoopToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveSimpleLoopToBlackProperty', false );
export const autoSolveFaceColorToRedProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorToRedProperty', false );
export const autoSolveFaceColorToBlackProperty = new LocalStorageBooleanProperty( 'autoSolveFaceColorToBlackProperty', false );

// TODO: have some way of the autoSolver ALWAYS having these solvers?
export const safeSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new CompositeSolver<TCompleteData>( [
    new SafeEdgeToSimpleRegionSolver( board, state ),
    new SafeEdgeToFaceColorSolver( board, state )
  ] );
};

export const autoSolverFactoryProperty = new DerivedProperty( [
  autoSolveSimpleVertexJointToRedProperty,
  autoSolveSimpleVertexOnlyOptionToBlackProperty,
  autoSolveSimpleVertexAlmostEmptyToRedProperty,
  autoSolveSimpleFaceToRedProperty,
  autoSolveSimpleFaceToBlackProperty,
  autoSolveSimpleLoopToRedProperty,
  autoSolveSimpleLoopToBlackProperty,
  autoSolveFaceColorToRedProperty,
  autoSolveFaceColorToBlackProperty
], (
  simpleVertexJointToRed,
  simpleVertexOnlyOptionToBlack,
  simpleVertexAlmostEmptyToRed,
  simpleFaceToRed,
  simpleFaceToBlack,
  simpleLoopToRed,
  simpleLoopToBlack,
  simpleFaceColorToRed,
  simpleFaceColorToBlack
) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData>( [
      ...( simpleVertexJointToRed || simpleVertexOnlyOptionToBlack || simpleVertexAlmostEmptyToRed ? [
        new SimpleVertexSolver( board, state, {
          solveJointToRed: simpleVertexJointToRed,
          solveOnlyOptionToBlack: simpleVertexOnlyOptionToBlack,
          solveAlmostEmptyToRed: simpleVertexAlmostEmptyToRed
        }, dirty ? undefined : [] )
      ] : [] ),
      ...( simpleFaceToRed || simpleFaceToBlack ? [
        new SimpleFaceSolver( board, state, {
          solveToRed: simpleFaceToRed,
          solveToBlack: simpleFaceToBlack,
        }, dirty ? undefined : [] )
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
      ] : [] )
    ] );
  };
} );

export const standardSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new CompositeSolver( [
    new SimpleVertexSolver( board, state, {
      solveJointToRed: true,
      solveOnlyOptionToBlack: true,
      solveAlmostEmptyToRed: true
    } ),
    new SimpleFaceSolver( board, state, {
      solveToRed: true,
      solveToBlack: true,
    } ),
    new SafeEdgeToSimpleRegionSolver( board, state ),

    // We rely on the Simple Regions being accurate here, so they are lower down
    new SimpleLoopSolver( board, state, {
      solveToRed: true,
      solveToBlack: true,
      resolveAllRegions: false // NOTE: this will be faster
    } ),

    // We rely on the Face colors being accurate here
    new SimpleFaceColorSolver( board, state, {
      solveToRed: true,
      solveToBlack: true
    } )
  ] );
};

export const backtrackerSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new EdgeBacktrackerSolver( board, state, {
    solverFactory: standardSolverFactory,
    depth: 1
  } );
};
