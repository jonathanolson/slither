import { CorrectnessState } from '../../CorrectnessState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TDelta } from '../core/TDelta.ts';
import { TSerializedState } from '../core/TSerializedState.ts';
import { TState } from '../core/TState.ts';
import FaceColorState, { TFaceColor, TFaceColorData } from './TFaceColorData.ts';

import { TinyEmitter } from 'phet-lib/axon';

import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class FaceColorValidator implements TState<TFaceColorData> {
  public readonly faceColorsChangedEmitter = new TinyEmitter<
    [
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ]
  >();

  public constructor(
    // @ts-expect-error
    private readonly board: TBoard,
    private readonly currentState: TState<TFaceColorData>,
    private readonly solvedState: TState<TFaceColorData>,
  ) {}

  public getFaceColors(): TFaceColor[] {
    return this.currentState.getFaceColors();
  }

  public getInsideColor(): TFaceColor {
    return this.currentState.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.currentState.getOutsideColor();
  }

  public getFaceColor(face: TFace): TFaceColor {
    return this.currentState.getFaceColor(face);
  }

  public getFacesWithColor(faceColor: TFaceColor): TFace[] {
    return this.currentState.getFacesWithColor(faceColor);
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.currentState.getFaceColorMap();
  }

  public getOppositeFaceColor(faceColor: TFaceColor): TFaceColor | null {
    return this.currentState.getOppositeFaceColor(faceColor);
  }

  public hasInvalidFaceColors(): boolean {
    return this.currentState.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null>,
    invalidFaceColor: boolean,
  ): void {
    if (invalidFaceColor) {
      throw new InvalidStateError('invalid face color?');
    }

    const affectedColors = new Set<TFaceColor>([
      ...faceChangeMap.values(),
      ...oppositeChangeMap.keys(),
      ...faceChangeMap.values(),
    ]);

    const faceColorMap = new Map(this.currentState.getFaceColorMap()); // overly-protective copy
    for (const face of faceChangeMap.keys()) {
      faceColorMap.set(face, faceChangeMap.get(face)!);
    }

    const getOppositeFaceColor = (color: TFaceColor): TFaceColor | null => {
      if (oppositeChangeMap.has(color)) {
        return oppositeChangeMap.get(color)!;
      } else if ([...addedFaceColors].includes(color)) {
        return this.currentState.getOppositeFaceColor(color);
      } else {
        return null;
      }
    };

    const faceColorInverseMap = new Map<TFaceColor, Set<TFace>>();
    for (const face of faceColorMap.keys()) {
      const color = faceColorMap.get(face)!;

      // Pull from all colors, so we can handle opposite color checks properly (boo, performance?)
      if (!faceColorInverseMap.has(color)) {
        faceColorInverseMap.set(color, new Set([face]));
      }
      faceColorInverseMap.get(color)!.add(face);
    }

    for (const color of affectedColors) {
      const potentialFaces = faceColorInverseMap.get(color);
      if (!potentialFaces) {
        continue;
      }

      const faces = [...potentialFaces];
      assertEnabled() && assert(faces.length > 0);

      const solvedColor = this.solvedState.getFaceColor(faces[0]);

      for (const face of faces) {
        if (this.solvedState.getFaceColor(face) !== solvedColor) {
          throw new InvalidStateError('invalid face color');
        }
      }

      const oppositeColor = getOppositeFaceColor(color);
      if (oppositeColor) {
        let solvedOppositeColor: TFaceColor;
        if (oppositeColor.colorState === FaceColorState.INSIDE) {
          solvedOppositeColor = this.solvedState.getInsideColor();
        } else if (oppositeColor.colorState === FaceColorState.OUTSIDE) {
          solvedOppositeColor = this.solvedState.getOutsideColor();
        } else {
          solvedOppositeColor = this.solvedState.getFaceColor([...faceColorInverseMap.get(oppositeColor)!][0]);
        }

        if (solvedColor === solvedOppositeColor) {
          throw new InvalidStateError('opposite colors are the same');
        }
      }
    }
  }

  public clone(): FaceColorValidator {
    return this;
  }

  public createDelta(): TDelta<TFaceColorData> {
    return this as unknown as TDelta<TFaceColorData>;
  }

  public serializeState(board: TBoard): TSerializedState {
    throw new Error('unimplemented');
  }

  public static getCorrectnessState(
    board: TBoard,
    state: TState<TFaceColorData>,
    solvedState: TState<TFaceColorData>,
  ): CorrectnessState {
    const incorrectFaces: Set<TFace> = new Set();

    const checkedColors: Set<TFaceColor> = new Set();

    const outsideColor = state.getOutsideColor();
    const insideColor = state.getInsideColor();
    const solvedOutsideColor = solvedState.getOutsideColor();
    const solvedInsideColor = solvedState.getInsideColor();

    for (const color of state.getFaceColors()) {
      if (checkedColors.has(color)) {
        continue;
      }

      const oppositeColor = state.getOppositeFaceColor(color);

      checkedColors.add(color);
      oppositeColor && checkedColors.add(oppositeColor);

      const faces = state.getFacesWithColor(color);
      const oppositeFaces = oppositeColor ? state.getFacesWithColor(oppositeColor) : [];

      const expectSolvedColor = (face: TFace, color: TFaceColor) => {
        if (solvedState.getFaceColor(face) !== color) {
          incorrectFaces.add(face);
        }
      };

      if (color === outsideColor) {
        faces.forEach((face) => expectSolvedColor(face, solvedOutsideColor));
        oppositeFaces.forEach((face) => expectSolvedColor(face, solvedInsideColor));
      } else if (color === insideColor) {
        faces.forEach((face) => expectSolvedColor(face, solvedInsideColor));
        oppositeFaces.forEach((face) => expectSolvedColor(face, solvedOutsideColor));
      } else {
        if (faces.length) {
          let outsidePrimaryCount =
            faces.filter((face) => solvedState.getFaceColor(face) === solvedOutsideColor).length +
            oppositeFaces.filter((face) => solvedState.getFaceColor(face) === solvedInsideColor).length;
          let totalCount = faces.length + oppositeFaces.length;

          if (outsidePrimaryCount > 0 && outsidePrimaryCount < totalCount) {
            const isPrimaryOutside = outsidePrimaryCount > totalCount / 2;

            const primaryColor = isPrimaryOutside ? solvedOutsideColor : solvedInsideColor;
            const secondaryColor = isPrimaryOutside ? solvedInsideColor : solvedOutsideColor;

            faces.forEach((face) => expectSolvedColor(face, primaryColor));
            oppositeFaces.forEach((face) => expectSolvedColor(face, secondaryColor));
          }
        }
      }
    }

    return new CorrectnessState(new Set(), incorrectFaces);
  }
}
