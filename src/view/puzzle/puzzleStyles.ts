import { BooleanProperty, DerivedProperty, DynamicProperty, Property, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TBoard } from '../../model/board/core/TBoard.ts';
import { TState } from '../../model/data/core/TState.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';
import { CompositeSolver } from '../../model/solver/CompositeSolver.ts';
import { TAnnotatedAction } from '../../model/data/core/TAnnotatedAction.ts';
import { SimpleFaceColorSolver } from '../../model/solver/SimpleFaceColorSolver.ts';
import { allVertexStateVisibleProperty, currentTheme, edgesHaveColorsProperty, edgesVisibleProperty, faceColorsVisibleProperty, faceColorThresholdProperty, faceStateVisibleProperty, faceValueStyleProperty, joinedLinesCapProperty, joinedLinesJoinProperty, redLineStyleProperty, redLineVisibleProperty, redXsAlignedProperty, redXsVisibleProperty, sectorsNextToEdgesVisibleProperty, sectorsTrivialVisibleProperty, sectorsVisibleProperty, smallVertexProperty, themeFromProperty, TRuntimeTheme, vertexStateVisibleProperty, vertexStyleProperty, verticesVisibleProperty, whiteLineVisibleProperty } from '../Theme.ts';
import { autoSolverFactoryProperty, autoSolveSimpleLoopsProperty, autoSolveToBlackProperty } from '../../model/solver/autoSolver.ts';
import { LocalStorageBooleanProperty, LocalStorageProperty } from '../../util/localStorage.ts';
import { StaticSectorSolver } from '../../model/solver/StaticSectorSolver.ts';
import { CompleteAnnotatedSolverFactory } from '../../model/solver/TSolver.ts';
import { SimpleVertexSolver } from '../../model/solver/SimpleVertexSolver.ts';
import { SimpleFaceSolver } from '../../model/solver/SimpleFaceSolver.ts';
import { SimpleLoopSolver } from '../../model/solver/SimpleLoopSolver.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { getSafeSolverFactory } from '../../model/solver/getSafeSolverFactory.ts';

export const customPuzzleStyle: TPuzzleStyle = {
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

  safeSolverFactoryProperty: new DerivedProperty( [
    faceColorsVisibleProperty, sectorsVisibleProperty, vertexStateVisibleProperty, faceStateVisibleProperty
  ], ( faceColors, sectors, vertexState, faceState ) => {
    return getSafeSolverFactory( faceColors, sectors, vertexState, faceState );
  } ),
  autoSolverFactoryProperty: autoSolverFactoryProperty,

  theme: currentTheme
};
const getPartialPuzzleStyle = (
  faceColors: boolean,
  sectors: boolean,
  vertexState: boolean,
  faceState: boolean,
  additionalSolverFactoryProperty?: TReadOnlyProperty<CompleteAnnotatedSolverFactory>
) => {
  const safeSolverFactory = getSafeSolverFactory( faceColors, sectors, vertexState, faceState );

  return {
    faceColorsVisibleProperty: new BooleanProperty( faceColors ),
    sectorsVisibleProperty: new BooleanProperty( sectors ),
    vertexStateVisibleProperty: new BooleanProperty( vertexState ),
    faceStateVisibleProperty: new BooleanProperty( faceState ),

    safeSolverFactoryProperty: new Property( safeSolverFactory ),
    autoSolverFactoryProperty: additionalSolverFactoryProperty ? new DerivedProperty( [ additionalSolverFactoryProperty ], factory => {
      return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
        return new CompositeSolver( [
          safeSolverFactory( board, state, dirty ),
          factory( board, state, dirty )
        ] );
      };
    } ) : new Property( safeSolverFactory )
  };
};
const basicSolverFactoryProperty = new DerivedProperty( [
  autoSolveToBlackProperty,
  autoSolveSimpleLoopsProperty
], ( toBlack, simpleLoops ) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      new SimpleVertexSolver( board, state, {
        solveJointToRed: true,
        solveForcedLineToBlack: toBlack,
        solveAlmostEmptyToRed: true
      }, dirty ? undefined : [] ),
      new SimpleFaceSolver( board, state, {
        solveToRed: true,
        solveToBlack: toBlack
      }, dirty ? undefined : [] ),
      ...( simpleLoops ? [
        new SimpleLoopSolver( board, state, {
          solveToRed: true,
          solveToBlack: toBlack,
          resolveAllRegions: false // TODO: for full better exhaustive solvers, have true
        }, dirty ? undefined : [] )
      ] : [] )
    ] );
  };
} );
const basicWithColorToEdgeSolverFactoryProperty = new DerivedProperty( [
  basicSolverFactoryProperty
], ( basicSolverFactory ) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      basicSolverFactory( board, state, dirty ),

      new SimpleFaceColorSolver( board, state, {
        solveToRed: true,
        solveToBlack: true,
      } )
    ] );
  };
} );
const sectorSolverFactoryProperty = new DerivedProperty( [
  basicSolverFactoryProperty
], ( basicSolverFactory ) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      basicSolverFactory( board, state, dirty ),

      // TODO: create a new "sector"-only solver?
      new StaticSectorSolver( board, state, dirty ? undefined : [] )
    ] );
  };
} );
const sectorWithColorToEdgeSolverFactoryProperty = new DerivedProperty( [
  sectorSolverFactoryProperty
], ( basicSolverFactory ) => {
  return ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      basicSolverFactory( board, state, dirty ),

      new SimpleFaceColorSolver( board, state, {
        solveToRed: true,
        solveToBlack: true,
      } )
    ] );
  };
} );

// TODO: refactor the rest to this pattern?
export const getClassicPuzzleStyleWithTheme = ( theme: TRuntimeTheme ): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle( false, false, false, false, basicSolverFactoryProperty ),
    theme: theme,

    edgesVisibleProperty: new TinyProperty( true ),
    edgesHaveColorsProperty: new TinyProperty( false ),

    faceColorThresholdProperty: new TinyProperty( Number.POSITIVE_INFINITY ),

    sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
    sectorsTrivialVisibleProperty: new TinyProperty( false ),
    allVertexStateVisibleProperty: new TinyProperty( false ),


    whiteLineVisibleProperty: new TinyProperty( false ),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty( true ),
    smallVertexProperty: new TinyProperty( false ),

    redXsVisibleProperty: new TinyProperty( true ),
    redXsAlignedProperty: new TinyProperty( false ),

    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty( 'middle' ),
    vertexStyleProperty: new TinyProperty( 'square' ),
    joinedLinesJoinProperty: new TinyProperty( 'miter' ),
    joinedLinesCapProperty: new TinyProperty( 'square' )
  };
};

export const getSectorsWithColorsPuzzleStyleWithTheme = ( theme: TRuntimeTheme ): TPuzzleStyle => {
  return {
    ...getPartialPuzzleStyle( true, true, false, false, sectorWithColorToEdgeSolverFactoryProperty ),
    theme: theme,

    // TODO: Control directly what "edit bar" options are available

    // TODO: Dynamically update what edit bar actions are available to match


    edgesVisibleProperty: new TinyProperty( true ),
    edgesHaveColorsProperty: new TinyProperty( false ),

    faceColorThresholdProperty: new TinyProperty( 2 ),

    sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
    sectorsTrivialVisibleProperty: new TinyProperty( false ),
    allVertexStateVisibleProperty: new TinyProperty( false ),


    whiteLineVisibleProperty: new TinyProperty( true ),

    redLineVisibleProperty: redLineVisibleProperty,

    verticesVisibleProperty: new TinyProperty( false ),
    smallVertexProperty: new TinyProperty( false ),

    redXsVisibleProperty: new TinyProperty( false ),
    redXsAlignedProperty: new TinyProperty( false ),

    // TODO: fix this, we should reference a dynamic global property
    faceValueStyleProperty: faceValueStyleProperty,

    redLineStyleProperty: new TinyProperty( 'middle' ),
    vertexStyleProperty: new TinyProperty( 'round' ),
    joinedLinesJoinProperty: new TinyProperty( 'round' ),
    joinedLinesCapProperty: new TinyProperty( 'round' )
  };
};

export const basicLinesPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, false, basicSolverFactoryProperty ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match

  edgesVisibleProperty: new TinyProperty( true ),
  edgesHaveColorsProperty: new TinyProperty( true ),

  faceColorThresholdProperty: new TinyProperty( Number.POSITIVE_INFINITY ),

  sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
  sectorsTrivialVisibleProperty: new TinyProperty( false ),
  allVertexStateVisibleProperty: new TinyProperty( false ),


  whiteLineVisibleProperty: new TinyProperty( true ),

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: new TinyProperty( false ),
  smallVertexProperty: new TinyProperty( false ),

  redXsVisibleProperty: new TinyProperty( false ),
  redXsAlignedProperty: new TinyProperty( false ),

  // TODO: fix this, we should reference a dynamic global property
  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: new TinyProperty( 'middle' ),
  vertexStyleProperty: new TinyProperty( 'round' ),
  joinedLinesJoinProperty: new TinyProperty( 'round' ),
  joinedLinesCapProperty: new TinyProperty( 'round' )
};
export const basicFaceColoringPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, false, basicWithColorToEdgeSolverFactoryProperty ),
  theme: currentTheme,

  edgesVisibleProperty: new TinyProperty( true ),
  edgesHaveColorsProperty: new TinyProperty( false ),

  faceColorThresholdProperty: new TinyProperty( 2 ),

  sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
  sectorsTrivialVisibleProperty: new TinyProperty( false ),
  allVertexStateVisibleProperty: new TinyProperty( false ),


  whiteLineVisibleProperty: new TinyProperty( true ),

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: new TinyProperty( false ),
  smallVertexProperty: new TinyProperty( false ),

  redXsVisibleProperty: new TinyProperty( false ),
  redXsAlignedProperty: new TinyProperty( false ),

  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: new TinyProperty( 'middle' ),
  vertexStyleProperty: new TinyProperty( 'round' ),
  joinedLinesJoinProperty: new TinyProperty( 'round' ),
  joinedLinesCapProperty: new TinyProperty( 'round' )
};
export const pureFaceColorPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, false, new Property( ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
      new SimpleFaceColorSolver( board, state, {
        solveToRed: true,
        solveToBlack: true
      }, dirty ? undefined : [] )
    ] );
  } ) ),
  theme: currentTheme,

  edgesVisibleProperty: new TinyProperty( false ),
  edgesHaveColorsProperty: new TinyProperty( false ),

  faceColorThresholdProperty: new TinyProperty( 2 ),

  sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
  sectorsTrivialVisibleProperty: new TinyProperty( false ),
  allVertexStateVisibleProperty: new TinyProperty( false ),


  whiteLineVisibleProperty: new TinyProperty( false ),

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: new TinyProperty( false ),
  smallVertexProperty: new TinyProperty( false ),

  redXsVisibleProperty: new TinyProperty( false ),
  redXsAlignedProperty: new TinyProperty( false ),

  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: new TinyProperty( 'middle' ),
  vertexStyleProperty: new TinyProperty( 'round' ),
  joinedLinesJoinProperty: new TinyProperty( 'round' ),
  joinedLinesCapProperty: new TinyProperty( 'round' )
};
export const classicPuzzleStyle: TPuzzleStyle = getClassicPuzzleStyleWithTheme( currentTheme );
export const basicSectorsPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, true, false, false, sectorSolverFactoryProperty ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match


  edgesVisibleProperty: new TinyProperty( true ),
  edgesHaveColorsProperty: new TinyProperty( true ),

  faceColorThresholdProperty: new TinyProperty( Number.POSITIVE_INFINITY ),

  sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
  sectorsTrivialVisibleProperty: new TinyProperty( false ),
  allVertexStateVisibleProperty: new TinyProperty( false ),


  whiteLineVisibleProperty: new TinyProperty( true ),

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: new TinyProperty( false ),
  smallVertexProperty: new TinyProperty( false ),

  redXsVisibleProperty: new TinyProperty( false ),
  redXsAlignedProperty: new TinyProperty( false ),

  // TODO: fix this, we should reference a dynamic global property
  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: new TinyProperty( 'middle' ),
  vertexStyleProperty: new TinyProperty( 'round' ),
  joinedLinesJoinProperty: new TinyProperty( 'round' ),
  joinedLinesCapProperty: new TinyProperty( 'round' )
};
export const sectorsWithColorsPuzzleStyle: TPuzzleStyle = getSectorsWithColorsPuzzleStyleWithTheme( currentTheme );
export const vertexStatePuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, true, false, basicSolverFactoryProperty ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match


  edgesVisibleProperty: new TinyProperty( true ),
  edgesHaveColorsProperty: new TinyProperty( false ),

  faceColorThresholdProperty: new TinyProperty( 2 ),

  sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
  sectorsTrivialVisibleProperty: new TinyProperty( false ),
  allVertexStateVisibleProperty: new TinyProperty( false ),


  whiteLineVisibleProperty: new TinyProperty( true ),

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: new TinyProperty( false ),
  smallVertexProperty: new TinyProperty( false ),

  redXsVisibleProperty: new TinyProperty( false ),
  redXsAlignedProperty: new TinyProperty( false ),

  // TODO: fix this, we should reference a dynamic global property
  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: new TinyProperty( 'middle' ),
  vertexStyleProperty: new TinyProperty( 'round' ),
  joinedLinesJoinProperty: new TinyProperty( 'round' ),
  joinedLinesCapProperty: new TinyProperty( 'round' )
};
export const faceStatePuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, true, basicSolverFactoryProperty ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match


  edgesVisibleProperty: new TinyProperty( true ),
  edgesHaveColorsProperty: new TinyProperty( false ),

  faceColorThresholdProperty: new TinyProperty( 2 ),

  sectorsNextToEdgesVisibleProperty: new TinyProperty( false ),
  sectorsTrivialVisibleProperty: new TinyProperty( false ),
  allVertexStateVisibleProperty: new TinyProperty( false ),


  whiteLineVisibleProperty: new TinyProperty( true ),

  redLineVisibleProperty: redLineVisibleProperty,

  verticesVisibleProperty: new TinyProperty( false ),
  smallVertexProperty: new TinyProperty( false ),

  redXsVisibleProperty: new TinyProperty( false ),
  redXsAlignedProperty: new TinyProperty( false ),

  // TODO: fix this, we should reference a dynamic global property
  faceValueStyleProperty: faceValueStyleProperty,

  redLineStyleProperty: new TinyProperty( 'middle' ),
  vertexStyleProperty: new TinyProperty( 'round' ),
  joinedLinesJoinProperty: new TinyProperty( 'round' ),
  joinedLinesCapProperty: new TinyProperty( 'round' )
};
export const puzzleStyleMap = {
  basicLines: basicLinesPuzzleStyle,
  basicFaceColoring: basicFaceColoringPuzzleStyle,
  pureFaceColor: pureFaceColorPuzzleStyle,
  classic: classicPuzzleStyle,
  basicSectors: basicSectorsPuzzleStyle,
  sectorsWithColors: sectorsWithColorsPuzzleStyle,
  vertexState: vertexStatePuzzleStyle,
  faceState: faceStatePuzzleStyle,
  custom: customPuzzleStyle
};
export const defaultPuzzleStyle = classicPuzzleStyle;
export const puzzleStyleFromProperty = ( puzzleStyleProperty: TReadOnlyProperty<TPuzzleStyle> ): TPuzzleStyle => {
  // TODO: reduce duplication...
  return {
    edgesVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'edgesVisibleProperty' } ),

    edgesHaveColorsProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'edgesHaveColorsProperty' } ),

    faceColorsVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'faceColorsVisibleProperty' } ),
    faceColorThresholdProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'faceColorThresholdProperty' } ),

    sectorsVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'sectorsVisibleProperty' } ),
    sectorsNextToEdgesVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'sectorsNextToEdgesVisibleProperty' } ),
    sectorsTrivialVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'sectorsTrivialVisibleProperty' } ),

    vertexStateVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'vertexStateVisibleProperty' } ),
    allVertexStateVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'allVertexStateVisibleProperty' } ),

    faceStateVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'faceStateVisibleProperty' } ),


    whiteLineVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'whiteLineVisibleProperty' } ),

    redLineVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'redLineVisibleProperty' } ),

    verticesVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'verticesVisibleProperty' } ),
    smallVertexProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'smallVertexProperty' } ),

    redXsVisibleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'redXsVisibleProperty' } ),
    redXsAlignedProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'redXsAlignedProperty' } ),

    faceValueStyleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'faceValueStyleProperty' } ),

    redLineStyleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'redLineStyleProperty' } ),
    vertexStyleProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'vertexStyleProperty' } ),
    joinedLinesJoinProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'joinedLinesJoinProperty' } ),
    joinedLinesCapProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'joinedLinesCapProperty' } ),

    safeSolverFactoryProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'safeSolverFactoryProperty' } ),
    autoSolverFactoryProperty: new DynamicProperty( puzzleStyleProperty, { derive: 'autoSolverFactoryProperty' } ),

    theme: themeFromProperty( new DerivedProperty( [ puzzleStyleProperty ], style => style.theme ) )
  };
};
export const puzzleStyleProperty = new LocalStorageProperty<TPuzzleStyle>( 'puzzleStyle', {
  serialize: style => Object.keys( puzzleStyleMap ).find( key => puzzleStyleMap[ key as keyof typeof puzzleStyleMap ] === style )!,
  deserialize: name => name ? puzzleStyleMap[ name as keyof typeof puzzleStyleMap ] ?? defaultPuzzleStyle : defaultPuzzleStyle
} );
export const currentPuzzleStyle: TPuzzleStyle = puzzleStyleFromProperty( puzzleStyleProperty );
export const showPuzzleStyleProperty = new LocalStorageBooleanProperty( 'showPuzzleStyleProperty', true );