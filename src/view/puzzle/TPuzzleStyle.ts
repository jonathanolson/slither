import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { allVertexStateVisibleProperty, currentTheme, edgesHaveColorsProperty, edgesVisibleProperty, faceColorsVisibleProperty, faceColorThresholdProperty, faceStateVisibleProperty, faceValueStyleProperty, joinedLinesCapProperty, joinedLinesJoinProperty, redLineStyleProperty, redLineVisibleProperty, redXsAlignedProperty, redXsVisibleProperty, sectorsNextToEdgesVisibleProperty, sectorsTrivialVisibleProperty, sectorsVisibleProperty, smallVertexProperty, TFaceValueStyle, TLineCap, TLineJoin, TReadOnlyTheme, TRedLineStyle, TVertexStyle, vertexStateVisibleProperty, vertexStyleProperty, verticesVisibleProperty, whiteLineVisibleProperty } from '../Theme.ts';
import { AnnotatedSolverFactory } from '../../model/solver/TSolver.ts';
import { TStructure } from '../../model/board/core/TStructure.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';
import { autoSolverFactoryProperty, getSafeSolverFactory } from '../../model/solver/autoSolver.ts';

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

  readonly theme: TReadOnlyTheme;
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