import { TEmitter } from 'phet-lib/axon';
import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { TFace } from '../../board/core/TFace.ts';
import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { TSerializedState } from '../core/TSerializedState.ts';

export default class FaceColorState extends EnumerationValue {
  public static readonly OUTSIDE = new FaceColorState();
  public static readonly INSIDE = new FaceColorState();
  public static readonly UNDECIDED = new FaceColorState();

  public static readonly enumeration = new Enumeration(FaceColorState);
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

export const serializeFaceColor = (
  faceColor: TFaceColor,
  faces: TFace[],
  oppositeFaceColorId: number | null,
): TSerializedFaceColor => {
  return {
    id: faceColor.id,
    colorState: faceColor.colorState.toString() as 'OUTSIDE' | 'INSIDE' | 'UNDECIDED',
    faces: faces.map(serializeFace),
    oppositeFaceColorId: oppositeFaceColorId,
  };
};

export interface TFaceColorData {
  // Initially, we'll have a face color for each face, plus the outside and inside.
  getFaceColors(): TFaceColor[];

  getInsideColor(): TFaceColor;

  getOutsideColor(): TFaceColor;

  getFaceColor(face: TFace): TFaceColor;

  getFacesWithColor(faceColor: TFaceColor): TFace[];

  getFaceColorMap(): Map<TFace, TFaceColor>;

  getOppositeFaceColor(faceColor: TFaceColor): TFaceColor | null;

  hasInvalidFaceColors(): boolean;

  modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null>,
    invalidFaceColor: boolean,
  ): void;

  faceColorsChangedEmitter: TEmitter<
    [
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ]
  >;
}

export type TFaceColorListener = (
  addedFaceColors: MultiIterable<TFaceColor>,
  removedFaceColors: MultiIterable<TFaceColor>,
  oppositeChangedFaceColors: MultiIterable<TFaceColor>,
  changedFaces: MultiIterable<TFace>,
) => void;

export interface TSerializedFaceColorData extends TSerializedState {
  type: 'FaceColorData';
  colors: TSerializedFaceColor[];
  invalidFaceColor: boolean;
}

export const serializeFaceColorData = (faceData: TFaceColorData): TSerializedFaceColorData => ({
  type: 'FaceColorData',
  colors: faceData
    .getFaceColors()
    .map((faceColor) =>
      serializeFaceColor(
        faceColor,
        faceData.getFacesWithColor(faceColor),
        faceData.getOppositeFaceColor(faceColor)?.id ?? null,
      ),
    ),
  invalidFaceColor: faceData.hasInvalidFaceColors(),
});
