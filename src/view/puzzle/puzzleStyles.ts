import {
  TRuntimeTheme,
  allVertexStateVisibleProperty,
  currentTheme,
  customAllowAbsoluteFaceColorEditProperty,
  customAllowEdgeEditProperty,
  customAllowFaceColorEditProperty,
  customAllowSectorEditProperty,
  edgesHaveColorsProperty,
  edgesVisibleProperty,
  faceColorThresholdProperty,
  faceColorsVisibleProperty,
  faceStateVisibleProperty,
  faceValueStyleProperty,
  joinedLinesCapProperty,
  joinedLinesJoinProperty,
  redLineStyleProperty,
  redLineVisibleProperty,
  redXsAlignedProperty,
  redXsVisibleProperty,
  sectorsNextToEdgesVisibleProperty,
  sectorsTrivialVisibleProperty,
  sectorsVisibleProperty,
  smallVertexProperty,
  themeFromProperty,
  vertexStateVisibleProperty,
  vertexStyleProperty,
  verticesVisibleProperty,
  whiteLineVisibleProperty,
} from '../Theme.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

import {
  BooleanProperty,
  DerivedProperty,
  DynamicProperty,
  Property,
  TReadOnlyProperty,
  TinyProperty,
} from 'phet-lib/axon';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../../model/data/core/TAnnotatedAction.ts';
import { TState } from '../../model/data/core/TState.ts';
import { CompositeSolver } from '../../model/solver/CompositeSolver.ts';
import { SimpleFaceColorSolver } from '../../model/solver/SimpleFaceColorSolver.ts';
import { SimpleFaceSolver } from '../../model/solver/SimpleFaceSolver.ts';
import { SimpleLoopSolver } from '../../model/solver/SimpleLoopSolver.ts';
import { SimpleVertexSolver } from '../../model/solver/SimpleVertexSolver.ts';
import { StaticSectorSolver } from '../../model/solver/StaticSectorSolver.ts';
import { CompleteAnnotatedSolverFactory } from '../../model/solver/TSolver.ts';
import {
  autoSolveSimpleLoopsProperty,
  autoSolveToBlackProperty,
  autoSolverFactoryProperty,
} from '../../model/solver/autoSolver.ts';
import { getSafeSolverFactory } from '../../model/solver/getSafeSolverFactory.ts';

import { LocalStorageBooleanProperty, LocalStorageProperty } from '../../util/localStorage.ts';

export const customPuzzleStyle: TPuzzleStyle = {
  allowEdgeEditProperty: customAllowEdgeEditProperty,
  allowAbsoluteFaceColorEditProperty: customAllowAbsoluteFaceColorEditProperty,
  allowFaceColorEditProperty: customAllowFaceColorEditProperty,
  allowSectorEditProperty: customAllowSectorEditProperty,

  edgesVisibleProperty: edgesVisibleProperty,
  edgesHaveColorsProperty: edgesHaveColorsProperty,

  faceColorsVisibleProperty: faceColorsVisibleProperty,
  faceColorThresholdProperty: faceColorThresholdProperty,

  sectorsVisibleProperty: sectorsVisibleProperty,
  sectorsNextToEdgesVisibleProperty: sectorsNextToEdgesVisibleProperty,
  sectorsTrivialVisibleProperty: sectorsTrivialVisibleProperty,

  vertexStateVisibleProperty: vertexStateVisibleProperty,
  allVertexStateVisibleProperty: allVertexStateVisibleProperty,

  faceStateVisibleProperty: faceStateVisibleProperty,

  whiteLineVisibleProperty: whiteLineVisibleProperty,

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: verticesVisibleProperty,
  smallVertexProperty: smallVertexProperty,

  redXsVisibleProperty: redXsVisibleProperty,
  redXsAlignedProperty: redXsAlignedProperty,

  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: redLineStyleProperty,
  vertexStyleProperty: vertexStyleProperty,
  joinedLinesJoinProperty: joinedLinesJoinProperty,
  joinedLinesCapProperty: joinedLinesCapProperty,

  safeSolverFactoryProperty: new DerivedProperty(
    [faceColorsVisibleProperty, sectorsVisibleProperty, vertexStateVisibleProperty, faceStateVisibleProperty],
    (faceColors, sectors, vertexState, faceState) => {
      return getSafeSolverFactory(faceColors, sectors, vertexState, faceState);
    },
  ),
  autoSolverFactoryProperty: autoSolverFactoryProperty,

  theme: currentTheme,
};
const getPartialPuzzleStyle = (
  faceColors: boolean,
  sectors: boolean,
  vertexState: boolean,
  faceState: boolean,
  additionalSolverFactoryProperty?: TReadOnlyProperty<CompleteAnnotatedSolverFactory>,
) => {
  const safeSolverFactory = getSafeSolverFactory(faceColors, sectors, vertexState, faceState);

  return {
    faceColorsVisibleProperty: new BooleanProperty(faceColors),
    sectorsVisibleProperty: new BooleanProperty(sectors),
    vertexStateVisibleProperty: new BooleanProperty(vertexState),
    faceStateVisibleProperty: new BooleanProperty(faceState),

    safeSolverFactoryProperty: new Property(safeSolverFactory),
    autoSolverFactoryProperty:
      additionalSolverFactoryProperty ?
        new DerivedProperty([additionalSolverFactoryProperty], (factory) => {
          return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
            return new CompositeSolver([safeSolverFactory(board, state, dirty), factory(board, state, dirty)]);
          };
        })
      : new Property(safeSolverFactory),
  };
};
const basicSolverFactoryProperty = new DerivedProperty(
  [autoSolveToBlackProperty, autoSolveSimpleLoopsProperty],
  (toBlack, simpleLoops) => {
    return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
      return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
        new SimpleVertexSolver(
          board,
          state,
          {
            solveJointToRed: true,
            solveForcedLineToBlack: toBlack,
            solveAlmostEmptyToRed: true,
          },
          dirty ? undefined : [],
        ),
        new SimpleFaceSolver(
          board,
          state,
          {
            solveToRed: true,
            solveToBlack: toBlack,
          },
          dirty ? undefined : [],
        ),
        ...(simpleLoops ?
          [
            new SimpleLoopSolver(
              board,
              state,
              {
                solveToRed: true,
                solveToBlack: toBlack,
                resolveAllRegions: false, // TODO: for full better exhaustive solvers, have true
              },
              dirty ? undefined : [],
            ),
          ]
        : []),
      ]);
    };
  },
);
const basicWithColorToEdgeSolverFactoryProperty = new DerivedProperty(
  [basicSolverFactoryProperty],
  (basicSolverFactory) => {
    return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
      return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
        basicSolverFactory(board, state, dirty),

        new SimpleFaceColorSolver(board, state, {
          solveToRed: true,
          solveToBlack: true,
        }),
      ]);
    };
  },
);
const sectorSolverFactoryProperty = new DerivedProperty([basicSolverFactoryProperty], (basicSolverFactory) => {
  return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
      basicSolverFactory(board, state, dirty),

      // TODO: create a new "sector"-only solver?
      new StaticSectorSolver(board, state, dirty ? undefined : []),
    ]);
  };
});
const sectorWithColorToEdgeSolverFactoryProperty = new DerivedProperty(
  [sectorSolverFactoryProperty],
  (basicSolverFactory) => {
    return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
      return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
        basicSolverFactory(board, state, dirty),

        new SimpleFaceColorSolver(board, state, {
          solveToRed: true,
          solveToBlack: true,
        }),
      ]);
    };
  },
);

export const getBasicLinesPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(true, false, false, false, basicSolverFactoryProperty),
    theme: theme,

    // TODO: Control directly what "edit bar" options are available

    // TODO: Dynamically update what edit bar actions are available to match

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(true),
    allowFaceColorEditProperty: new TinyProperty(false),
    allowSectorEditProperty: new TinyProperty(false),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(true),

    faceColorThresholdProperty: new TinyProperty(Number.POSITIVE_INFINITY),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(true),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    // TODO: fix this, we should reference a dynamic global property
    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const getBasicColoringPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(true, false, false, false, basicWithColorToEdgeSolverFactoryProperty),
    theme: theme,

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(true),
    allowSectorEditProperty: new TinyProperty(false),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(2),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(true),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const getPureColoringPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(
      true,
      false,
      false,
      false,
      new Property((board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
        return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
          new SimpleFaceColorSolver(
            board,
            state,
            {
              solveToRed: true,
              solveToBlack: true,
            },
            dirty ? undefined : [],
          ),
        ]);
      }),
    ),
    theme: theme,

    allowEdgeEditProperty: new TinyProperty(false),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(true),
    allowSectorEditProperty: new TinyProperty(false),

    edgesVisibleProperty: new TinyProperty(false),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(2),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(false),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const getClassicPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(false, false, false, false, basicSolverFactoryProperty),
    theme: theme,

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(false),
    allowSectorEditProperty: new TinyProperty(false),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(Number.POSITIVE_INFINITY),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(false),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(true),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(true),
    redXsAlignedProperty: new TinyProperty(false),

    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('square'),
    joinedLinesJoinProperty: new TinyProperty('miter'),
    joinedLinesCapProperty: new TinyProperty('square'),
  };
};

export const getClassicWithSectorsPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(false, true, false, false, basicSolverFactoryProperty),
    theme: theme,

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(false),
    allowSectorEditProperty: new TinyProperty(true),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(Number.POSITIVE_INFINITY),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(false),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(true),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(true),
    redXsAlignedProperty: new TinyProperty(false),

    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('square'),
    joinedLinesJoinProperty: new TinyProperty('miter'),
    joinedLinesCapProperty: new TinyProperty('square'),
  };
};

export const getBasicSectorsPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(true, true, false, false, sectorSolverFactoryProperty),
    theme: theme,

    // TODO: Control directly what "edit bar" options are available

    // TODO: Dynamically update what edit bar actions are available to match

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(true),
    allowFaceColorEditProperty: new TinyProperty(false),
    allowSectorEditProperty: new TinyProperty(true),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(true),

    faceColorThresholdProperty: new TinyProperty(Number.POSITIVE_INFINITY),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(true),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    // TODO: fix this, we should reference a dynamic global property
    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const getSectorsWithColorsPuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(true, true, false, false, sectorWithColorToEdgeSolverFactoryProperty),
    theme: theme,

    // TODO: Control directly what "edit bar" options are available

    // TODO: Dynamically update what edit bar actions are available to match

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(true),
    allowSectorEditProperty: new TinyProperty(true),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(2),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(true),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    // TODO: fix this, we should reference a dynamic global property
    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const getVertexStatePuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(true, false, true, false, basicSolverFactoryProperty),
    theme: theme,

    // TODO: Control directly what "edit bar" options are available

    // TODO: Dynamically update what edit bar actions are available to match

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(true),
    allowSectorEditProperty: new TinyProperty(false),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(2),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(true),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    // TODO: fix this, we should reference a dynamic global property
    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const getFaceStatePuzzleStyleWithTheme = (theme: TRuntimeTheme): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle(true, false, false, true, basicSolverFactoryProperty),
    theme: theme,

    // TODO: Control directly what "edit bar" options are available

    // TODO: Dynamically update what edit bar actions are available to match

    allowEdgeEditProperty: new TinyProperty(true),
    allowAbsoluteFaceColorEditProperty: new TinyProperty(false),
    allowFaceColorEditProperty: new TinyProperty(true),
    allowSectorEditProperty: new TinyProperty(false),

    edgesVisibleProperty: new TinyProperty(true),
    edgesHaveColorsProperty: new TinyProperty(false),

    faceColorThresholdProperty: new TinyProperty(2),

    sectorsNextToEdgesVisibleProperty: new TinyProperty(false),
    sectorsTrivialVisibleProperty: new TinyProperty(false),
    allVertexStateVisibleProperty: new TinyProperty(false),

    whiteLineVisibleProperty: new TinyProperty(true),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty(false),
    smallVertexProperty: new TinyProperty(false),

    redXsVisibleProperty: new TinyProperty(false),
    redXsAlignedProperty: new TinyProperty(false),

    // TODO: fix this, we should reference a dynamic global property
    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty('middle'),
    vertexStyleProperty: new TinyProperty('round'),
    joinedLinesJoinProperty: new TinyProperty('round'),
    joinedLinesCapProperty: new TinyProperty('round'),
  };
};

export const basicLinesPuzzleStyle: TPuzzleStyle = getBasicLinesPuzzleStyleWithTheme(currentTheme);
export const basicFaceColoringPuzzleStyle: TPuzzleStyle = getBasicColoringPuzzleStyleWithTheme(currentTheme);
export const pureFaceColorPuzzleStyle: TPuzzleStyle = getPureColoringPuzzleStyleWithTheme(currentTheme);
export const classicPuzzleStyle: TPuzzleStyle = getClassicPuzzleStyleWithTheme(currentTheme);
export const basicSectorsPuzzleStyle: TPuzzleStyle = getBasicSectorsPuzzleStyleWithTheme(currentTheme);
export const sectorsWithColorsPuzzleStyle: TPuzzleStyle = getSectorsWithColorsPuzzleStyleWithTheme(currentTheme);
export const vertexStatePuzzleStyle: TPuzzleStyle = getVertexStatePuzzleStyleWithTheme(currentTheme);
export const faceStatePuzzleStyle: TPuzzleStyle = getFaceStatePuzzleStyleWithTheme(currentTheme);

export const puzzleStyleMap = {
  basicLines: basicLinesPuzzleStyle,
  basicFaceColoring: basicFaceColoringPuzzleStyle,
  pureFaceColor: pureFaceColorPuzzleStyle,
  classic: classicPuzzleStyle,
  basicSectors: basicSectorsPuzzleStyle,
  sectorsWithColors: sectorsWithColorsPuzzleStyle,
  vertexState: vertexStatePuzzleStyle,
  faceState: faceStatePuzzleStyle,
  custom: customPuzzleStyle,
};

export const defaultPuzzleStyle = classicPuzzleStyle;

export const puzzleStyleFromProperty = (puzzleStyleProperty: TReadOnlyProperty<TPuzzleStyle>): TPuzzleStyle => {
  // TODO: reduce duplication...
  return {
    allowEdgeEditProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'allowEdgeEditProperty' }),
    allowAbsoluteFaceColorEditProperty: new DynamicProperty(puzzleStyleProperty, {
      derive: 'allowAbsoluteFaceColorEditProperty',
    }),
    allowFaceColorEditProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'allowFaceColorEditProperty' }),
    allowSectorEditProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'allowSectorEditProperty' }),

    edgesVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'edgesVisibleProperty' }),

    edgesHaveColorsProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'edgesHaveColorsProperty' }),

    faceColorsVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'faceColorsVisibleProperty' }),
    faceColorThresholdProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'faceColorThresholdProperty' }),

    sectorsVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'sectorsVisibleProperty' }),
    sectorsNextToEdgesVisibleProperty: new DynamicProperty(puzzleStyleProperty, {
      derive: 'sectorsNextToEdgesVisibleProperty',
    }),
    sectorsTrivialVisibleProperty: new DynamicProperty(puzzleStyleProperty, {
      derive: 'sectorsTrivialVisibleProperty',
    }),

    vertexStateVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'vertexStateVisibleProperty' }),
    allVertexStateVisibleProperty: new DynamicProperty(puzzleStyleProperty, {
      derive: 'allVertexStateVisibleProperty',
    }),

    faceStateVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'faceStateVisibleProperty' }),

    whiteLineVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'whiteLineVisibleProperty' }),

    redLineVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'redLineVisibleProperty' }),

    verticesVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'verticesVisibleProperty' }),
    smallVertexProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'smallVertexProperty' }),

    redXsVisibleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'redXsVisibleProperty' }),
    redXsAlignedProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'redXsAlignedProperty' }),

    faceValueStyleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'faceValueStyleProperty' }),

    redLineStyleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'redLineStyleProperty' }),
    vertexStyleProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'vertexStyleProperty' }),
    joinedLinesJoinProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'joinedLinesJoinProperty' }),
    joinedLinesCapProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'joinedLinesCapProperty' }),

    safeSolverFactoryProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'safeSolverFactoryProperty' }),
    autoSolverFactoryProperty: new DynamicProperty(puzzleStyleProperty, { derive: 'autoSolverFactoryProperty' }),

    theme: themeFromProperty(new DerivedProperty([puzzleStyleProperty], (style) => style.theme)),
  };
};

export const puzzleStyleProperty = new LocalStorageProperty<TPuzzleStyle>('puzzleStyle', {
  serialize: (style) =>
    Object.keys(puzzleStyleMap).find((key) => puzzleStyleMap[key as keyof typeof puzzleStyleMap] === style)!,
  deserialize: (name) =>
    name ? puzzleStyleMap[name as keyof typeof puzzleStyleMap] ?? defaultPuzzleStyle : defaultPuzzleStyle,
});

export const currentPuzzleStyle: TPuzzleStyle = puzzleStyleFromProperty(puzzleStyleProperty);

export const showPuzzleStyleProperty = new LocalStorageBooleanProperty('showPuzzleStyleProperty', true);

export const showPuzzleTimerProperty = new LocalStorageBooleanProperty('showPuzzleTimerProperty', false);

export const showSectorViewModesProperty = new LocalStorageBooleanProperty('showSectorViewModesProperty', false);
