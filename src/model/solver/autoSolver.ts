import { DerivedProperty } from 'phet-lib/axon';
import { CompositeSolver } from './CompositeSolver';
import { SimpleVertexSolver } from './SimpleVertexSolver';
import { SimpleFaceSolver } from './SimpleFaceSolver';
import { LocalStorageBooleanProperty } from '../../util/localStorage.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { SimpleFaceColorSolver } from './SimpleFaceColorSolver.ts';
import { FaceColorParitySolver } from './FaceColorParitySolver.ts';
import { AnnotatedSolverFactory, iterateSolverFactory } from './TSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { StaticDoubleMinusOneFacesSolver } from './StaticDoubleMinusOneFacesSolver.ts';
import { SimpleSectorSolver } from './SimpleSectorSolver.ts';
import { StaticSectorSolver } from './StaticSectorSolver.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { VertexToEdgeSolver } from './VertexToEdgeSolver.ts';
import { VertexToSectorSolver } from './VertexToSectorSolver.ts';
import { VertexToFaceColorSolver } from './VertexToFaceColorSolver.ts';
import { VertexColorToFaceSolver } from './VertexColorToFaceSolver.ts';
import { FaceToEdgeSolver } from './FaceToEdgeSolver.ts';
import { FaceToSectorSolver } from './FaceToSectorSolver.ts';
import { FaceToFaceColorSolver } from './FaceToFaceColorSolver.ts';
import { FaceToVertexSolver } from './FaceToVertexSolver.ts';
import { safeSolverFactory } from './safeSolverFactory.ts';

// Top-level setting that controls whether auto-solve is enabled at all
export const autoSolveEnabledProperty = new LocalStorageBooleanProperty('autoSolveEnabledProperty', true);

// Meta-level settings that control properties of the default auto-solvers
export const autoSolveToBlackProperty = new LocalStorageBooleanProperty('autoSolveToBlackProperty', false);
export const autoSolveSimpleLoopsProperty = new LocalStorageBooleanProperty('autoSolveSimpleLoopsProperty', false);

export const autoSolveSimpleVertexJointToRedProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleVertexJointToRedProperty',
  true,
);
export const autoSolveSimpleVertexForcedLineToBlackProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleVertexForcedLineToBlackProperty',
  true,
);
export const autoSolveSimpleVertexAlmostEmptyToRedProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleVertexAlmostEmptyToRedProperty',
  true,
);

export const autoSolveSimpleFaceToRedProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleFaceToRedProperty',
  true,
);
export const autoSolveSimpleFaceToBlackProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleFaceToBlackProperty',
  true,
);

export const autoSolveSimpleLoopToRedProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleLoopToRedProperty',
  true,
);
export const autoSolveSimpleLoopToBlackProperty = new LocalStorageBooleanProperty(
  'autoSolveSimpleLoopToBlackProperty',
  false,
);

export const autoSolveDoubleMinusOneFacesProperty = new LocalStorageBooleanProperty(
  'autoSolveDoubleMinusOneFacesProperty',
  false,
);

export const autoSolveStaticFaceSectorProperty = new LocalStorageBooleanProperty(
  'autoSolveStaticFaceSectorProperty',
  true,
);

export const autoSolveSimpleSectorProperty = new LocalStorageBooleanProperty('autoSolveSimpleSectorProperty', false);

export const autoSolveVertexToRedEdgeProperty = new LocalStorageBooleanProperty(
  'autoSolveVertexToRedEdgeProperty',
  false,
);
export const autoSolveVertexToBlackEdgeProperty = new LocalStorageBooleanProperty(
  'autoSolveVertexToBlackEdgeProperty',
  false,
);
export const autoSolveVertexToSectorsProperty = new LocalStorageBooleanProperty(
  'autoSolveVertexToSectorsProperty',
  false,
);
export const autoSolveVertexToFaceColorProperty = new LocalStorageBooleanProperty(
  'autoSolveVertexToFaceColorProperty',
  false,
);

export const autoSolveFaceColorToRedProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceColorToRedProperty',
  false,
);
export const autoSolveFaceColorToBlackProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceColorToBlackProperty',
  false,
);

export const autoSolveFaceColorParityToRedProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceColorParityToRedProperty',
  false,
);
export const autoSolveFaceColorParityToBlackProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceColorParityToBlackProperty',
  false,
);
export const autoSolveFaceColorParityColorsProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceColorParityColorsProperty',
  false,
);
export const autoSolveFaceColorParityPartialReductionProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceColorParityPartialReductionProperty',
  false,
);

export const autoSolveVertexColorToFaceProperty = new LocalStorageBooleanProperty(
  'autoSolveVertexColorToFaceProperty',
  false,
);
export const autoSolveFaceToRedProperty = new LocalStorageBooleanProperty('autoSolveFaceToRedProperty', false);
export const autoSolveFaceToBlackProperty = new LocalStorageBooleanProperty('autoSolveFaceToBlackProperty', false);
export const autoSolveFaceToSectorsProperty = new LocalStorageBooleanProperty('autoSolveFaceToSectorsProperty', false);
export const autoSolveFaceToFaceColorsProperty = new LocalStorageBooleanProperty(
  'autoSolveFaceToFaceColorsProperty',
  false,
);
export const autoSolveFaceToVertexProperty = new LocalStorageBooleanProperty('autoSolveFaceToVertexProperty', false);

export const finalStateSolverFactory = (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
    safeSolverFactory(board, state, dirty),
    new VertexColorToFaceSolver(board, state),
  ]);
};

export const finalStateSolve = (board: TBoard, state: TState<TCompleteData>) => {
  iterateSolverFactory(finalStateSolverFactory, board, state, true);
};

// TODO: we should use a more scalable approach(!)
// @ts-expect-error - omg, DerivedProperty is... limit. TODO find a better approach, we hit the maximum number.
export const autoSolverFactoryProperty = new DerivedProperty<
  AnnotatedSolverFactory<TStructure, TCompleteData>,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
>(
  [
    autoSolveSimpleVertexJointToRedProperty,
    autoSolveSimpleVertexForcedLineToBlackProperty,
    autoSolveSimpleVertexAlmostEmptyToRedProperty,
    autoSolveSimpleFaceToRedProperty,
    autoSolveSimpleFaceToBlackProperty,
    autoSolveSimpleLoopToRedProperty,
    autoSolveSimpleLoopToBlackProperty,
    autoSolveDoubleMinusOneFacesProperty,
    autoSolveStaticFaceSectorProperty,
    autoSolveSimpleSectorProperty,
    autoSolveVertexToRedEdgeProperty,
    autoSolveVertexToBlackEdgeProperty,
    autoSolveVertexToSectorsProperty,
    autoSolveVertexToFaceColorProperty,
    autoSolveFaceColorToRedProperty,
    autoSolveFaceColorToBlackProperty,
    autoSolveFaceColorParityToRedProperty,
    autoSolveFaceColorParityToBlackProperty,
    autoSolveFaceColorParityColorsProperty,
    autoSolveFaceColorParityPartialReductionProperty,
    autoSolveVertexColorToFaceProperty,
    autoSolveFaceToRedProperty,
    autoSolveFaceToBlackProperty,
    autoSolveFaceToSectorsProperty,
    autoSolveFaceToFaceColorsProperty,
    autoSolveFaceToVertexProperty,
  ],
  (
    simpleVertexJointToRed: boolean,
    simpleVertexOnlyOptionToBlack: boolean,
    simpleVertexAlmostEmptyToRed: boolean,
    simpleFaceToRed: boolean,
    simpleFaceToBlack: boolean,
    simpleLoopToRed: boolean,
    simpleLoopToBlack: boolean,
    doubleMinusOneFaces: boolean,
    staticFaceSector: boolean,
    simpleSector: boolean,
    vertexToRedEdge: boolean,
    vertexToBlackEdge: boolean,
    vertexToSectors: boolean,
    vertexToFaceColor: boolean,
    simpleFaceColorToRed: boolean,
    simpleFaceColorToBlack: boolean,
    simpleFaceColorParityToRed: boolean,
    simpleFaceColorParityToBlack: boolean,
    simpleFaceColorParityColors: boolean,
    simpleFaceColorParityPartialReduction: boolean,
    vertexColorToFace: boolean,
    faceToRed: boolean,
    faceToBlack: boolean,
    faceToSectors: boolean,
    faceToFaceColors: boolean,
    faceToVertex: boolean,
  ) => {
    return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
      return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
        ...(simpleVertexJointToRed || simpleVertexOnlyOptionToBlack || simpleVertexAlmostEmptyToRed ?
          [
            new SimpleVertexSolver(
              board,
              state,
              {
                solveJointToRed: simpleVertexJointToRed,
                solveForcedLineToBlack: simpleVertexOnlyOptionToBlack,
                solveAlmostEmptyToRed: simpleVertexAlmostEmptyToRed,
              },
              dirty ? undefined : [],
            ),
          ]
        : []),
        ...(simpleFaceToRed || simpleFaceToBlack ?
          [
            new SimpleFaceSolver(
              board,
              state,
              {
                solveToRed: simpleFaceToRed,
                solveToBlack: simpleFaceToBlack,
              },
              dirty ? undefined : [],
            ),
          ]
        : []),
        ...(doubleMinusOneFaces ? [new StaticDoubleMinusOneFacesSolver(board, state, dirty ? undefined : [])] : []),

        safeSolverFactory(board, state, dirty),

        ...(staticFaceSector ? [new StaticSectorSolver(board, state, dirty ? undefined : [])] : []),

        ...(simpleSector ? [new SimpleSectorSolver(board, state, dirty ? undefined : [])] : []),

        // We rely on the Simple Regions being accurate here, so they are lower down
        ...(simpleLoopToRed || simpleLoopToBlack ?
          [
            new SimpleLoopSolver(
              board,
              state,
              {
                solveToRed: simpleLoopToRed,
                solveToBlack: simpleLoopToBlack,
                resolveAllRegions: false, // TODO: for full better exhaustive solvers, have true
              },
              dirty ? undefined : [],
            ),
          ]
        : []),

        ...(vertexToRedEdge || vertexToBlackEdge ?
          [
            new VertexToEdgeSolver(
              board,
              state,
              {
                solveToRed: vertexToRedEdge,
                solveToBlack: vertexToBlackEdge,
              },
              dirty ? undefined : [],
            ),
          ]
        : []),

        ...(vertexToSectors ? [new VertexToSectorSolver(board, state, dirty ? undefined : [])] : []),

        ...(simpleFaceColorToRed || simpleFaceColorToBlack ?
          [
            new SimpleFaceColorSolver(
              board,
              state,
              {
                solveToRed: simpleFaceColorToRed,
                solveToBlack: simpleFaceColorToBlack,
              },
              dirty ? undefined : [],
            ),
          ]
        : []),

        ...(simpleFaceColorParityToRed || simpleFaceColorParityToBlack || simpleFaceColorParityColors ?
          [
            new FaceColorParitySolver(
              board,
              state,
              {
                solveToRed: simpleFaceColorParityToRed,
                solveToBlack: simpleFaceColorParityToBlack,
                solveColors: simpleFaceColorParityColors,
                allowPartialReduction: simpleFaceColorParityPartialReduction,
              },
              dirty ? undefined : [],
            ),
          ]
        : []),

        ...(vertexToFaceColor ? [new VertexToFaceColorSolver(board, state, dirty ? undefined : [])] : []),

        ...(vertexColorToFace ? [new VertexColorToFaceSolver(board, state, dirty ? undefined : [])] : []),

        ...(faceToRed || faceToBlack ?
          [
            new FaceToEdgeSolver(
              board,
              state,
              {
                solveToRed: faceToRed,
                solveToBlack: faceToBlack,
              },
              dirty ? undefined : [],
            ),
          ]
        : []),

        ...(faceToSectors ? [new FaceToSectorSolver(board, state, dirty ? undefined : [])] : []),

        ...(faceToFaceColors ? [new FaceToFaceColorSolver(board, state, dirty ? undefined : [])] : []),

        ...(faceToVertex ? [new FaceToVertexSolver(board, state, dirty ? undefined : [])] : []),
      ]);
    };
  },
);
