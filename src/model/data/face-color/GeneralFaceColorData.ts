import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import { GeneralFaceColor } from './GeneralFaceColor.ts';
import { GeneralFaceColorDelta } from './GeneralFaceColorDelta.ts';
import FaceColorState, {
  TFaceColor,
  TFaceColorData,
  TSerializedFaceColorData,
  serializeFaceColorData,
} from './TFaceColorData.ts';

import { TinyEmitter } from 'phet-lib/axon';
import { dotRandom } from 'phet-lib/dot';

import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const getFaceColorGlobalId = (): number => dotRandom.nextInt(Number.MAX_SAFE_INTEGER);

export class GeneralFaceColorData implements TState<TFaceColorData> {
  public readonly faceColorsChangedEmitter = new TinyEmitter<
    [
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ]
  >();

  public readonly faceColors: Set<TFaceColor>;
  public readonly colorMap: Map<TFace, TFaceColor>;
  public readonly colorInverseMap: Map<TFaceColor, Set<TFace>>;
  public readonly oppositeColorMap: Map<TFaceColor, TFaceColor | null>;
  public readonly outsideColor: TFaceColor;
  public readonly insideColor: TFaceColor;
  public invalidFaceColor: boolean;

  public constructor(
    public readonly board: TBoard,
    // If not provided, we'll assume that the face colors are the same as the faces on the board.
    faceColors?: Set<TFaceColor>,
    colorMap?: Map<TFace, TFaceColor>,
    colorInverseMap?: Map<TFaceColor, Set<TFace>>,
    oppositeColorMap?: Map<TFaceColor, TFaceColor | null>,
    outsideColor?: TFaceColor,
    insideColor?: TFaceColor,
    invalidFaceColor?: boolean,
  ) {
    // TODO: use a better pattern here
    assertEnabled() && assert(!faceColors || insideColor, 'Provide all or none of the optional arguments');

    this.outsideColor = outsideColor || new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.OUTSIDE);
    this.insideColor = insideColor || new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.INSIDE);

    this.colorMap = new Map(
      colorMap ? colorMap : (
        [...board.faces].map((face) => [face, new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.UNDECIDED)])
      ),
    );

    this.faceColors = new Set(
      faceColors ? faceColors : (
        [this.outsideColor, this.insideColor, ...board.faces.map((face) => this.colorMap.get(face)!)]
      ),
    );

    assertEnabled() && assert(this.board.faces.every((face) => this.colorMap.has(face)));
    assertEnabled() && assert(this.board.faces.every((face) => this.faceColors.has(this.colorMap.get(face)!)));

    this.colorInverseMap = new Map(
      colorInverseMap ?
        [...colorInverseMap.keys()].map((key) => {
          return [key, new Set([...colorInverseMap.get(key)!])];
        })
      : [...this.faceColors].map((faceColor) => {
          return [
            faceColor,
            // TODO: does this quadratic bit hit perf?
            new Set<TFace>([...this.colorMap.keys()].filter((face) => this.colorMap.get(face)! === faceColor)),
          ];
        }),
    );

    this.oppositeColorMap = new Map(
      oppositeColorMap ? oppositeColorMap : (
        [
          [this.outsideColor, this.insideColor],
          [this.insideColor, this.outsideColor],
        ]
      ),
    );

    this.invalidFaceColor = !!invalidFaceColor;
  }

  public getFaceColors(): TFaceColor[] {
    // TODO: better perf way to handle this?
    return [...this.faceColors];
  }

  public getInsideColor(): TFaceColor {
    return this.insideColor;
  }

  public getOutsideColor(): TFaceColor {
    return this.outsideColor;
  }

  public getFaceColor(face: TFace): TFaceColor {
    const faceColor = this.colorMap.get(face)!;
    assertEnabled() && assert(faceColor);

    return faceColor;
  }

  public getFacesWithColor(faceColor: TFaceColor): TFace[] {
    assertEnabled() && assert(this.faceColors.has(faceColor));

    const faces = this.colorInverseMap.get(faceColor)!;
    assertEnabled() && assert(faces);

    // TODO: better perf way to handle this?
    return [...faces];
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return new Map(this.colorMap);
  }

  public getOppositeFaceColor(faceColor: TFaceColor): TFaceColor | null {
    return this.oppositeColorMap.get(faceColor) ?? null;
  }

  public hasInvalidFaceColors(): boolean {
    return this.invalidFaceColor;
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>,
    invalidFaceColor: boolean,
  ): void {
    for (const addedFaceColor of addedFaceColors) {
      this.faceColors.add(addedFaceColor);
      this.colorInverseMap.set(addedFaceColor, new Set());
    }

    for (const [face, newColor] of faceChangeMap.entries()) {
      const oldColor = this.colorMap.get(face)!;
      assertEnabled() && assert(oldColor);

      this.colorMap.set(face, newColor);
      this.colorInverseMap.get(oldColor)!.delete(face);
      this.colorInverseMap.get(newColor)!.add(face);
    }

    for (const [oldColor, newColor] of oppositeChangeMap.entries()) {
      this.oppositeColorMap.set(oldColor, newColor);
      this.oppositeColorMap.set(newColor, oldColor);
    }

    const toRemoveForOpposites = new Set<TFaceColor>();
    for (const removedFaceColor of removedFaceColors) {
      toRemoveForOpposites.add(removedFaceColor);
      this.faceColors.delete(removedFaceColor);
      this.colorInverseMap.delete(removedFaceColor);
      this.oppositeColorMap.delete(removedFaceColor);
    }

    // Remove opposite colors that are now invalid
    for (const color of this.faceColors) {
      if (this.oppositeColorMap.has(color) && toRemoveForOpposites.has(this.oppositeColorMap.get(color)!)) {
        this.oppositeColorMap.delete(color);
      }
    }

    const oppositeChangedFaceColors = new Set<TFaceColor>(oppositeChangeMap.keys());

    this.invalidFaceColor = invalidFaceColor;

    assertEnabled() && assert(this.board.faces.every((face) => this.colorMap.has(face)));
    assertEnabled() && assert(this.board.faces.every((face) => this.faceColors.has(this.colorMap.get(face)!)));

    // Lots of error checks for cases we're having issues with
    if (assertEnabled()) {
      const colors = new Set(this.getFaceColors());

      for (const color of colors) {
        const opposite = this.getOppositeFaceColor(color);
        if (opposite && !colors.has(opposite)) {
          assert(false, `opposite color ${opposite} of color ${color} is not in the set of colors`);
        }
      }

      // for ( const color of oppositeChangedFaceColors ) {
      //   assert( colors.has( color ) );
      // }
    }

    this.faceColorsChangedEmitter.emit(addedFaceColors, removedFaceColors, oppositeChangedFaceColors, [
      ...faceChangeMap.keys(),
    ]);
  }

  public clone(): GeneralFaceColorData {
    return new GeneralFaceColorData(
      this.board,
      this.faceColors,
      this.colorMap,
      this.colorInverseMap,
      this.oppositeColorMap,
      this.outsideColor,
      this.insideColor,
      this.invalidFaceColor,
    );
  }

  public createDelta(): TDelta<TFaceColorData> {
    return new GeneralFaceColorDelta(this.board, this);
  }

  public serializeState(board: TBoard): TSerializedFaceColorData {
    return serializeFaceColorData(this);
  }

  public static deserializeState(
    board: TBoard,
    serializedFaceColorData: TSerializedFaceColorData,
  ): GeneralFaceColorData {
    const colors = serializedFaceColorData.colors.map((serializedFaceColor) => {
      const id = serializedFaceColor.id;
      const colorState = FaceColorState.enumeration.getValue(serializedFaceColor.colorState)!;
      assertEnabled() && assert(colorState);

      return new GeneralFaceColor(id, colorState);
    });

    const colorMap = new Map<TFace, TFaceColor>();
    const colorInverseMap = new Map<TFaceColor, Set<TFace>>();
    const oppositeColorMap = new Map<TFaceColor, TFaceColor>();

    colors.forEach((color, i) => {
      const faces = serializedFaceColorData.colors[i].faces.map((serializedFace) =>
        deserializeFace(board, serializedFace),
      );
      faces.forEach((face) => colorMap.set(face, color));
      colorInverseMap.set(color, new Set(faces));

      const oppositeColorId = serializedFaceColorData.colors[i].oppositeFaceColorId;

      if (oppositeColorId !== null) {
        const oppositeColor = colors.find((color) => color.id === oppositeColorId)!;
        assertEnabled() && assert(oppositeColor);

        oppositeColorMap.set(color, oppositeColor);
      }
    });

    const outsideColor = colors.find((color) => color.colorState === FaceColorState.OUTSIDE)!;
    assertEnabled() && assert(outsideColor);

    const insideColor = colors.find((color) => color.colorState === FaceColorState.INSIDE)!;
    assertEnabled() && assert(insideColor);

    return new GeneralFaceColorData(
      board,
      new Set(colors),
      colorMap,
      colorInverseMap,
      oppositeColorMap,
      outsideColor,
      insideColor,
      serializedFaceColorData.invalidFaceColor,
    );
  }
}
