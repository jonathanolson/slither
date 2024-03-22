import { BooleanProperty, DerivedProperty, DynamicProperty, Property, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { allVertexStateVisibleProperty, currentTheme, edgesHaveColorsProperty, edgesVisibleProperty, faceColorsVisibleProperty, faceColorThresholdProperty, faceStateVisibleProperty, faceValueStyleProperty, joinedLinesCapProperty, joinedLinesJoinProperty, redLineStyleProperty, redLineVisibleProperty, redXsAlignedProperty, redXsVisibleProperty, sectorsNextToEdgesVisibleProperty, sectorsTrivialVisibleProperty, sectorsVisibleProperty, smallVertexProperty, TFaceValueStyle, TLineCap, TLineJoin, TRuntimeTheme, TRedLineStyle, TVertexStyle, vertexStateVisibleProperty, vertexStyleProperty, verticesVisibleProperty, whiteLineVisibleProperty, themeFromProperty } from '../Theme.ts';
import { AnnotatedSolverFactory } from '../../model/solver/TSolver.ts';
import { TStructure } from '../../model/board/core/TStructure.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';
import { autoSolverFactoryProperty, getSafeSolverFactory } from '../../model/solver/autoSolver.ts';
import { LocalStorageProperty } from '../../util/localStorage.ts';

export interface TPuzzleModelStyle {
  readonly edgesVisibleProperty: TReadOnlyProperty<boolean>;
  readonly faceColorsVisibleProperty: TReadOnlyProperty<boolean>;
  readonly sectorsVisibleProperty: TReadOnlyProperty<boolean>;
  readonly vertexStateVisibleProperty: TReadOnlyProperty<boolean>;
  readonly faceStateVisibleProperty: TReadOnlyProperty<boolean>;

  readonly safeSolverFactoryProperty: TReadOnlyProperty<AnnotatedSolverFactory<TStructure, TCompleteData>>;
  readonly autoSolverFactoryProperty: TReadOnlyProperty<AnnotatedSolverFactory<TStructure, TCompleteData>>;
}

export interface TPuzzleStyle extends TPuzzleModelStyle {
  readonly edgesHaveColorsProperty: TReadOnlyProperty<boolean>;

  readonly faceColorThresholdProperty: TReadOnlyProperty<number>;

  readonly sectorsNextToEdgesVisibleProperty: TReadOnlyProperty<boolean>;
  readonly sectorsTrivialVisibleProperty: TReadOnlyProperty<boolean>;

  readonly allVertexStateVisibleProperty: TReadOnlyProperty<boolean>;

  readonly whiteLineVisibleProperty: TReadOnlyProperty<boolean>;

  readonly redLineVisibleProperty: TReadOnlyProperty<boolean>;

  readonly verticesVisibleProperty: TReadOnlyProperty<boolean>;
  readonly smallVertexProperty: TReadOnlyProperty<boolean>;

  readonly redXsVisibleProperty: TReadOnlyProperty<boolean>;
  readonly redXsAlignedProperty: TReadOnlyProperty<boolean>;

  readonly faceValueStyleProperty: TReadOnlyProperty<TFaceValueStyle>; // TODO: potentially vary this based on global settings

  readonly redLineStyleProperty: TReadOnlyProperty<TRedLineStyle>;
  readonly vertexStyleProperty: TReadOnlyProperty<TVertexStyle>;
  readonly joinedLinesJoinProperty: TReadOnlyProperty<TLineJoin>;
  readonly joinedLinesCapProperty: TReadOnlyProperty<TLineCap>;

  readonly theme: TRuntimeTheme;
}

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

const getPartialPuzzleStyle = ( faceColors: boolean, sectors: boolean, vertexState: boolean, faceState: boolean ) => {
  return {
    faceColorsVisibleProperty: new BooleanProperty( faceColors ),
    sectorsVisibleProperty: new BooleanProperty( sectors ),
    vertexStateVisibleProperty: new BooleanProperty( vertexState ),
    faceStateVisibleProperty: new BooleanProperty( faceState ),

    safeSolverFactoryProperty: new Property( getSafeSolverFactory( faceColors, sectors, vertexState, faceState ) ),
  };
};

export const basicLinesPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, false ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match

  // TODO: FIX THIS, it looks like we mis-typed it (shouldn't be the annotated type)
  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
};

export const basicFaceColoringPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, false ),
  theme: currentTheme,

  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
};

export const pureFaceColorPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, false ),
  theme: currentTheme,

  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
};

export const classicPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( false, false, false, false ),
  theme: currentTheme,

  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'square' ),
};

export const basicSectorsPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, true, false, false ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match

  // TODO: FIX THIS, it looks like we mis-typed it (shouldn't be the annotated type)
  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
};

export const sectorsWithColorsPuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, true, false, false ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match

  // TODO: FIX THIS, it looks like we mis-typed it (shouldn't be the annotated type)
  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
};

export const vertexStatePuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, true, false ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match

  // TODO: FIX THIS, it looks like we mis-typed it (shouldn't be the annotated type)
  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
};

export const faceStatePuzzleStyle: TPuzzleStyle = {
  ...getPartialPuzzleStyle( true, false, false, true ),
  theme: currentTheme,

  // TODO: Control directly what "edit bar" options are available

  // TODO: Dynamically update what edit bar actions are available to match

  // TODO: FIX THIS, it looks like we mis-typed it (shouldn't be the annotated type)
  autoSolverFactoryProperty: autoSolverFactoryProperty,

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
  joinedLinesCapProperty: new TinyProperty( 'round' ),
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
export const defaultPuzzleStyle = basicLinesPuzzleStyle;

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
