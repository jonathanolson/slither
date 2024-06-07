import { TReadOnlyProperty } from 'phet-lib/axon';
import { TFaceValueStyle, TLineCap, TLineJoin, TRedLineStyle, TRuntimeTheme, TVertexStyle } from '../Theme.ts';
import { AnnotatedSolverFactory } from '../../model/solver/TSolver.ts';
import { TStructure } from '../../model/board/core/TStructure.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';

export interface TPuzzleModelStyle {
  readonly edgesVisibleProperty: TReadOnlyProperty<boolean>;
  readonly faceColorsVisibleProperty: TReadOnlyProperty<boolean>;
  readonly sectorsVisibleProperty: TReadOnlyProperty<boolean>;
  readonly vertexStateVisibleProperty: TReadOnlyProperty<boolean>;
  readonly faceStateVisibleProperty: TReadOnlyProperty<boolean>;

  readonly allowEdgeEditProperty: TReadOnlyProperty<boolean>;
  readonly allowFaceColorEditProperty: TReadOnlyProperty<boolean>;
  readonly allowSectorEditProperty: TReadOnlyProperty<boolean>;

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

