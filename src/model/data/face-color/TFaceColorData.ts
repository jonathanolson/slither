import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { serializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';

export default class FaceColorState extends EnumerationValue {
  public static readonly OUTSIDE = new FaceColorState();
  public static readonly INSIDE = new FaceColorState();
  public static readonly UNDECIDED = new FaceColorState();

  public static readonly enumeration = new Enumeration( FaceColorState );
}

export interface TFaceColor {
  // An identifier that is tracked across face colors over time. Algorithms will try to keep this consistent, for
  // visual continuity (so that the largest face color of combined regions will NOT experience a change of this, and
  // it can be used for coloring.
  id: number;

  colorState: FaceColorState;
}

export interface TSerializedFaceColor {
  id: number;
  colorState: 'OUTSIDE' | 'INSIDE' | 'UNDECIDED';
  faces: TSerializedFace[];
  oppositeFaceColorId: number | null;
}

export const serializeFaceColor = ( faceColor: TFaceColor, faces: TFace[], oppositeFaceColorId: number | null ): TSerializedFaceColor => {
  return {
    id: faceColor.id,
    colorState: faceColor.colorState.toString() as 'OUTSIDE' | 'INSIDE' | 'UNDECIDED',
    faces: faces.map( serializeFace ),
    oppositeFaceColorId: oppositeFaceColorId
  };
};

export interface TFaceColorData {

  // Initially, we'll have a face color for each face, plus the outside and inside.
  getFaceColors(): TFaceColor[];
  getInsideColor(): TFaceColor;
  getOutsideColor(): TFaceColor;

  getFaceColor( face: TFace ): TFaceColor;
  getFacesWithColor( faceColor: TFaceColor ): TFace[];
  getFaceColorMap(): Map<TFace, TFaceColor>;
  getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null;

  modifyFaceColors(
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null>
  ): void;

  faceColorsChangedEmitter: TEmitter<[
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    oppositeChangedFaceColors: Iterable<TFaceColor>,
    changedFaces: Iterable<TFace>,
  ]>;
}

export type TFaceColorDataListener = (
  changedFaces: Iterable<TFace>,
  changedColors: Iterable<TFaceColor>
) => void;

export interface TSerializedFaceColorData extends TSerializedState {
  type: 'FaceColorData';
  colors: TSerializedFaceColor[];
}

export const serializeFaceColorData = ( faceData: TFaceColorData ): TSerializedFaceColorData => ( {
  type: 'FaceColorData',
  colors: faceData.getFaceColors().map( faceColor => serializeFaceColor(
    faceColor,
    faceData.getFacesWithColor( faceColor ),
    faceData.getOppositeFaceColor( faceColor )?.id ?? null
  ) )
} );
