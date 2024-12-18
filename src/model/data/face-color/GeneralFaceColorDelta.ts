import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import { GeneralFaceColorAction } from './GeneralFaceColorAction.ts';
import { TFaceColor, TFaceColorData, TSerializedFaceColorData, serializeFaceColorData } from './TFaceColorData.ts';

import { TinyEmitter } from 'phet-lib/axon';

import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class GeneralFaceColorDelta extends GeneralFaceColorAction implements TDelta<TFaceColorData> {
  public readonly faceColorsChangedEmitter = new TinyEmitter<
    [
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ]
  >();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceColorData>,
    addedFaceColors: Set<TFaceColor> = new Set(),
    removedFaceColors: Set<TFaceColor> = new Set(),
    faceChangeMap: Map<TFace, TFaceColor> = new Map(),
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null> = new Map(),
    invalidFaceColor = false,
  ) {
    super(board, addedFaceColors, removedFaceColors, faceChangeMap, oppositeChangeMap, invalidFaceColor);
  }

  public getFaceColors(): TFaceColor[] {
    return [
      ...[...this.parentState.getFaceColors()].filter((faceColor) => !this.removedFaceColors.has(faceColor)),
      ...this.addedFaceColors,
    ];
  }

  public getInsideColor(): TFaceColor {
    return this.parentState.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.parentState.getOutsideColor();
  }

  public getFaceColor(face: TFace): TFaceColor {
    if (this.faceChangeMap.has(face)) {
      return this.faceChangeMap.get(face)!;
    } else {
      return this.parentState.getFaceColor(face);
    }
  }

  public getFacesWithColor(faceColor: TFaceColor): TFace[] {
    let faces: Set<TFace>;
    if (this.addedFaceColors.has(faceColor)) {
      faces = new Set();
    } else {
      faces = new Set(this.parentState.getFacesWithColor(faceColor));
    }

    for (const [face, newColor] of this.faceChangeMap.entries()) {
      if (newColor === faceColor) {
        faces.add(face);
      } else if (faces.has(face)) {
        faces.delete(face);
      }
    }

    return [...faces];
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    const map = new Map(this.parentState.getFaceColorMap()); // TODO: get rid of excessive copy?

    for (const [face, newColor] of this.faceChangeMap.entries()) {
      map.set(face, newColor);
    }

    return map;
  }

  public getOppositeFaceColor(faceColor: TFaceColor): TFaceColor | null {
    const oppositeChange = this.oppositeChangeMap.get(faceColor);
    return oppositeChange !== undefined ? oppositeChange : this.parentState.getOppositeFaceColor(faceColor);
  }

  public hasInvalidFaceColors(): boolean {
    return this.invalidFaceColor || this.parentState.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null>,
    invalidFaceColor: boolean,
  ): void {
    for (const addedFaceColor of addedFaceColors) {
      this.addedFaceColors.add(addedFaceColor);
    }

    const colorsToRemove = new Set<TFaceColor>();
    for (const removedFaceColor of removedFaceColors) {
      colorsToRemove.add(removedFaceColor);

      if (this.addedFaceColors.has(removedFaceColor)) {
        this.addedFaceColors.delete(removedFaceColor);
      } else {
        this.removedFaceColors.add(removedFaceColor);
      }
    }

    // TODO: consider checking the parent state to see if we can just remove bits?
    for (const [face, newColor] of faceChangeMap.entries()) {
      this.faceChangeMap.set(face, newColor);
    }

    for (const [color, oppositeColor] of oppositeChangeMap.entries()) {
      // Don't set something for a color we are removing
      if (!colorsToRemove.has(color)) {
        this.oppositeChangeMap.set(color, oppositeColor);
      }
    }

    const toRemoveForOpposites = new Set<TFaceColor>(removedFaceColors);
    for (const color of this.oppositeChangeMap.keys()) {
      const opposite = this.oppositeChangeMap.get(color);

      // Null-out opposite colors that are now invalid, so we don't propagate them to below
      if (opposite && toRemoveForOpposites.has(opposite)) {
        this.oppositeChangeMap.set(color, null);
      }
    }

    if (assertEnabled()) {
      const values = [...oppositeChangeMap.values()].filter((value) => value !== null);
      const uniqueValues = _.uniq(values);

      assert(values.length === uniqueValues.length);
    }

    const oppositeChangedFaceColors = new Set<TFaceColor>(oppositeChangeMap.keys());

    this.invalidFaceColor = invalidFaceColor;

    this.faceColorsChangedEmitter.emit(addedFaceColors, removedFaceColors, oppositeChangedFaceColors, [
      ...faceChangeMap.keys(),
    ]);
  }

  public clone(): GeneralFaceColorDelta {
    return new GeneralFaceColorDelta(
      this.board,
      this.parentState,
      new Set(this.addedFaceColors),
      new Set(this.removedFaceColors),
      new Map(this.faceChangeMap),
      new Map(this.oppositeChangeMap),
      this.invalidFaceColor || this.parentState.hasInvalidFaceColors(),
    );
  }

  public createDelta(): TDelta<TFaceColorData> {
    return new GeneralFaceColorDelta(this.board, this);
  }

  public serializeState(board: TBoard): TSerializedFaceColorData {
    return serializeFaceColorData(this);
  }
}
