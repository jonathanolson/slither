import { TPuzzleStyle } from './TPuzzleStyle.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';
import { Vector2, dotRandom } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { Enumeration, EnumerationValue, arrayDifference } from 'phet-lib/phet-core';
import { Color, Node, Path, TPaint } from 'phet-lib/scenery';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TFace } from '../../model/board/core/TFace.ts';
import { TState } from '../../model/data/core/TState.ts';
import FaceColorState, { TFaceColor, TFaceColorData } from '../../model/data/face-color/TFaceColorData.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';
import _ from '../../workarounds/_.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';


export class FaceColorViewNode extends Node {
  private readonly faceColorNodeMap: Map<TFaceColor, FaceColorNode> = new Map();
  private readonly faceColorIdMap: Map<number, TFaceColor> = new Map();

  private readonly adjacentFacesMap = new Map<TFace, TFace[]>();

  private readonly faceColorNodeContainer: Node;

  private readonly dualColorViews = new Set<DualColorView>();

  public constructor(
    public readonly board: TBoard,
    private readonly stateProperty: TReadOnlyProperty<TState<TFaceColorData>>,
    private readonly style: TPuzzleStyle,
  ) {
    const faceColorNodeContainer = new Node();

    super({
      pickable: false,
      children: [faceColorNodeContainer],
    });

    this.faceColorNodeContainer = faceColorNodeContainer;

    board.faces.forEach((face) => {
      this.adjacentFacesMap.set(
        face,
        face.edges.map((edge) => edge.getOtherFace(face)).filter((face) => face !== null) as TFace[],
      );
    });

    {
      const initialFaceColors = stateProperty.value.getFaceColors();

      for (const faceColor of initialFaceColors) {
        this.addFaceColor(faceColor, stateProperty.value.getFacesWithColor(faceColor));
      }

      this.addDualColorViews(stateProperty.value, initialFaceColors);
    }
    this.updateHues();

    // TODO: see if we're getting performance loss with the clone?
    let previousState = stateProperty.value.clone();

    const stateListener = (state: TState<TFaceColorData>) => {
      // NOTE: We weren't getting the correct old state. Going to be overly-cautious here
      const oldState = previousState;
      // TODO: see if we're getting performance loss with the clone?
      previousState = state.clone();

      const oldFaceColors = oldState.getFaceColors();
      const newFaceColors = state.getFaceColors();

      const onlyOldFaceColors: TFaceColor[] = [];
      const onlyNewFaceColors: TFaceColor[] = [];
      const inBothFaceColors: TFaceColor[] = [];

      arrayDifference(oldFaceColors, newFaceColors, onlyOldFaceColors, onlyNewFaceColors, inBothFaceColors);

      const removals = new Set(onlyOldFaceColors);

      const dualNeededFaceColors = this.removeInvalidDualColorViews(state);
      const initialChangedFaceColors = [...dualNeededFaceColors];

      // Handle additions first, so we can abuse our faceColorIdMap to handle replacements
      for (const faceColor of onlyNewFaceColors) {
        dualNeededFaceColors.add(faceColor);

        if (this.faceColorIdMap.has(faceColor.id)) {
          const oldFaceColor = this.faceColorIdMap.get(faceColor.id)!;
          this.replaceFaceColor(oldFaceColor, faceColor, state.getFacesWithColor(faceColor));
          removals.delete(oldFaceColor); // don't remove it!
        } else {
          this.addFaceColor(faceColor, state.getFacesWithColor(faceColor));
        }
      }

      for (const faceColor of inBothFaceColors) {
        this.updateFaceColor(faceColor, state.getFacesWithColor(faceColor));
      }

      for (const faceColor of removals) {
        dualNeededFaceColors.delete(faceColor);

        this.removeFaceColor(faceColor);
      }

      this.addDualColorViews(state, [...dualNeededFaceColors]);

      if (onlyNewFaceColors.length || onlyOldFaceColors.length || initialChangedFaceColors.length) {
        this.updateHues();
      }
    };
    stateProperty.lazyLink(stateListener);
    this.disposeEmitter.addListener(() => stateProperty.unlink(stateListener));

    this.disposeEmitter.addListener(() => {
      while (this.faceColorNodeMap.size) {
        this.removeFaceColor(this.faceColorNodeMap.keys().next().value);
      }
    });

    const updateHueListener = () => this.updateHues();
    style.theme.faceColorBasicHueLUTProperty.lazyLink(updateHueListener);
    style.theme.faceColorLightHueLUTProperty.lazyLink(updateHueListener);
    style.theme.faceColorDarkHueLUTProperty.lazyLink(updateHueListener);
    style.theme.faceColorInsideColorProperty.lazyLink(updateHueListener);
    style.theme.faceColorOutsideColorProperty.lazyLink(updateHueListener);
    style.theme.faceColorDefaultColorProperty.lazyLink(updateHueListener); // TODO: might not need this link
    style.faceColorThresholdProperty.lazyLink(updateHueListener);
    this.updateHues();
    this.disposeEmitter.addListener(() => {
      style.theme.faceColorBasicHueLUTProperty.unlink(updateHueListener);
      style.theme.faceColorLightHueLUTProperty.unlink(updateHueListener);
      style.theme.faceColorDarkHueLUTProperty.unlink(updateHueListener);
      style.theme.faceColorInsideColorProperty.unlink(updateHueListener);
      style.theme.faceColorOutsideColorProperty.unlink(updateHueListener);
      style.theme.faceColorDefaultColorProperty.unlink(updateHueListener);
      style.faceColorThresholdProperty.unlink(updateHueListener);
    });
  }

  private addFaceColor(faceColor: TFaceColor, faces: TFace[]): void {
    const faceColorNode = new FaceColorNode(faceColor, faces, this.style);
    this.faceColorNodeMap.set(faceColor, faceColorNode);
    this.faceColorIdMap.set(faceColor.id, faceColor);
    this.faceColorNodeContainer.addChild(faceColorNode);
  }

  private replaceFaceColor(oldFaceColor: TFaceColor, newFaceColor: TFaceColor, faces: TFace[]): void {
    assertEnabled() && assert(oldFaceColor.id === newFaceColor.id);

    const faceColorNode = this.faceColorNodeMap.get(oldFaceColor);
    faceColorNode!.updateFaceColor(newFaceColor, faces);
    this.faceColorNodeMap.delete(oldFaceColor);
    this.faceColorNodeMap.set(newFaceColor, faceColorNode!);
    this.faceColorIdMap.delete(oldFaceColor.id); // OR we could just immediately replace it. This seems safer
    this.faceColorIdMap.set(newFaceColor.id, newFaceColor);
  }

  private updateFaceColor(faceColor: TFaceColor, faces: TFace[]): void {
    const faceColorNode = this.faceColorNodeMap.get(faceColor)!;

    let hasChanged = faceColorNode.faces.length !== faces.length;
    if (!hasChanged) {
      for (let i = 0; i < faces.length; i++) {
        const oldFace = faceColorNode.faces[i];
        const newFace = faces[i];

        if (oldFace !== newFace) {
          hasChanged = true;
          break;
        }
      }
    }

    if (hasChanged) {
      faceColorNode.updateFaceColor(faceColor, faces);
    }
  }

  private removeFaceColor(faceColor: TFaceColor): void {
    const faceColorNode = this.faceColorNodeMap.get(faceColor)!;
    this.faceColorNodeContainer.removeChild(faceColorNode);
    this.faceColorNodeMap.delete(faceColor);
    this.faceColorIdMap.delete(faceColor.id);
    faceColorNode.dispose();
  }

  private addDualColorViews(state: TState<TFaceColorData>, faceColors: TFaceColor[]): void {
    const remainingFaceColors = new Set(faceColors);
    while (remainingFaceColors.size) {
      const faceColor: TFaceColor = remainingFaceColors.values().next().value;
      remainingFaceColors.delete(faceColor);

      const mainFaceColorNode = this.faceColorNodeMap.get(faceColor)!;
      assertEnabled() && assert(mainFaceColorNode);

      const oppositeColor = state.getOppositeFaceColor(faceColor);
      if (oppositeColor) {
        assertEnabled() && assert(remainingFaceColors.has(oppositeColor));
        remainingFaceColors.delete(oppositeColor);

        const oppositeFaceColorNode = this.faceColorNodeMap.get(oppositeColor)!;
        assertEnabled() && assert(oppositeFaceColorNode);

        this.dualColorViews.add(new DualColorView([mainFaceColorNode, oppositeFaceColorNode], this.style));
      } else {
        this.dualColorViews.add(new DualColorView([mainFaceColorNode], this.style));
      }
    }
  }

  private removeInvalidDualColorViews(state: TState<TFaceColorData>): Set<TFaceColor> {
    const invalidatedFaceColors = new Set<TFaceColor>();

    const validFaceColors = new Set(state.getFaceColors());

    for (const dualColorView of [...this.dualColorViews]) {
      if (!dualColorView.isStillValidInState(this.stateProperty.value, validFaceColors)) {
        for (const colorNode of dualColorView.colorNodes) {
          invalidatedFaceColors.add(colorNode.faceColor);
        }
        this.dualColorViews.delete(dualColorView);
        dualColorView.dispose();
      }
    }

    return invalidatedFaceColors;
  }

  // Force-directed balancing of hues.
  // TODO: This is super similar to the setup in SimpleRegionViewNode. factor this out!!!
  // TODO: we only changed how to get the faces out of a primitive
  private updateHues(): void {
    // TODO: improve perf?
    const dualColorViews = [...this.dualColorViews].filter((dualColorView) => {
      // Exclude the inside/outside from colors if they won't be used.
      if (
        dualColorView.colorNodes[0].faceColor.colorState !== FaceColorState.UNDECIDED &&
        this.style.theme.faceColorOutsideColorProperty.value.alpha === 1 &&
        this.style.theme.faceColorInsideColorProperty.value.alpha === 1
      ) {
        return false;
      }

      return dualColorView.faceCount >= this.style.faceColorThresholdProperty.value;
    });

    if (dualColorViews.length >= 2) {
      const scratchHue = new Vector2(0, 0);

      const renormalizeHues = () => {
        // Weighted hue normalize (in prep for other actions?)
        for (const dualColorView of dualColorViews) {
          if (dualColorView.hueVector.getMagnitude() > 1e-6) {
            dualColorView.hueVector.normalize();
          } else {
            dualColorView.hueVector.setXY(dotRandom.nextDouble() - 0.5, dotRandom.nextDouble() - 0.5).normalize();
          }
        }
      };

      // TODO: cache this data? (hah, does it really not matter for performance?)
      const faceToDualColorViewMap = new Map<TFace, DualColorView[]>();
      const pairWeights: { a: DualColorView; b: DualColorView; weight: number }[] = [];
      this.board.faces.forEach((face) => {
        faceToDualColorViewMap.set(face, []);
      });
      for (const dualColorView of dualColorViews) {
        const primaryFaceSet = new Set<TFace>();
        for (const face of dualColorView.faces) {
          primaryFaceSet.add(face);
        }
        const finalSet = new Set<TFace>();
        for (const face of primaryFaceSet) {
          finalSet.add(face);
          for (const adjacentFace of this.adjacentFacesMap.get(face)!) {
            finalSet.add(adjacentFace);
          }
        }
        for (const face of finalSet) {
          const otherDualColorViews = faceToDualColorViewMap.get(face)!;

          // NOTE: Is this related to us having the faceFilter?
          if (!otherDualColorViews) {
            continue;
          }

          if (otherDualColorViews.length) {
            for (const otherFaceColorNode of otherDualColorViews) {
              let found = false;
              for (const pairWeight of pairWeights) {
                if (pairWeight.a === otherFaceColorNode && pairWeight.b === dualColorView) {
                  pairWeight.weight++;
                  found = true;
                  break;
                }
              }
              if (!found) {
                pairWeights.push({
                  a: otherFaceColorNode,
                  b: dualColorView,
                  weight: 1,
                });
              }
            }
          }

          otherDualColorViews.push(dualColorView);
        }
      }

      // Initialize forces
      const forces = new Map<DualColorView, Vector2>();
      for (const dualColorView of dualColorViews) {
        forces.set(dualColorView, Vector2.ZERO.copy());
      }

      const repulse = (a: DualColorView, b: DualColorView, multiplier: number) => {
        const forceA = forces.get(a)!;
        const forceB = forces.get(b)!;

        const dot = a.hueVector.dot(b.hueVector);
        // TODO: don't we want to normalize this?
        const diff = scratchHue.set(b.hueVector).subtract(a.hueVector);
        if (diff.magnitudeSquared > 1e-11) {
          diff.normalize();
        }

        const zero = 0.2;
        const absDot = Math.abs(dot);
        const power = multiplier * ((Math.max(zero, absDot) - zero) / (1 - zero)) ** 3;
        diff.multiplyScalar(power);

        forceA.subtract(diff);
        forceB.add(diff);
      };

      let amount = 1;
      for (let i = 0; i < 100; i++) {
        amount *= 0.99;

        // Clear forces
        for (const dualColorView of dualColorViews) {
          forces.get(dualColorView)!.setXY(0, 0);
        }

        // Location-based forces
        for (const pairWeight of pairWeights) {
          const a = pairWeight.a;
          const b = pairWeight.b;
          const weight = pairWeight.weight;
          repulse(a, b, weight);
        }

        // All-region repulsion (if we don't have that many)
        if (dualColorViews.length < 8) {
          for (let i = 0; i < dualColorViews.length; i++) {
            const a = dualColorViews[i];
            for (let j = i + 1; j < dualColorViews.length; j++) {
              repulse(a, dualColorViews[j], 0.2);
            }
          }
        }

        // Apply forces
        for (const dualColorView of dualColorViews) {
          const force = forces.get(dualColorView)!;

          // TODO: maybe avoid this?
          force.multiplyScalar(amount / dualColorView.faceCount);

          dualColorView.hueVector.add(force);
          forces.get(dualColorView)!.setXY(0, 0);
        }

        renormalizeHues();
      }
    }

    // console.log( `hueAngles: ${dualColorViews.map( view => Math.round( view.hueVector.angle * 180 / Math.PI ) ).join( ', ' )}` );

    for (const dualColorView of this.dualColorViews) {
      dualColorView.updateHue();
    }
  }
}

export default class DualColorType extends EnumerationValue {
  public static readonly BASIC = new DualColorType();
  public static readonly PRIMARY = new DualColorType();
  public static readonly SECONDARY = new DualColorType();

  public static readonly enumeration = new Enumeration(DualColorType);
}

class DualColorView {
  public readonly hueVector: Vector2;
  public faceCount: number;

  public constructor(
    public readonly colorNodes: FaceColorNode[],
    public readonly style: TPuzzleStyle,
  ) {
    assertEnabled() && assert(colorNodes.length === 1 || colorNodes.length === 2);

    this.faceCount = _.sum(this.colorNodes.map((colorNode) => colorNode.faceCount));
    colorNodes.forEach((colorNode) => {
      colorNode.dualColorView = this;
    });

    if (colorNodes.length === 1) {
      colorNodes[0].type = DualColorType.BASIC;

      this.hueVector = colorNodes[0].hueVector.copy();
    } else {
      const largerNode = colorNodes[0].faceCount > colorNodes[1].faceCount ? colorNodes[0] : colorNodes[1];
      const smallerNode = largerNode === colorNodes[0] ? colorNodes[1] : colorNodes[0];
      let primaryNode: FaceColorNode;

      if (largerNode.type === DualColorType.PRIMARY) {
        primaryNode = largerNode;
      } else if (smallerNode.type === DualColorType.PRIMARY) {
        primaryNode = smallerNode;
      } else if (largerNode.type === DualColorType.SECONDARY) {
        primaryNode = smallerNode;
      } else if (smallerNode.type === DualColorType.SECONDARY) {
        primaryNode = largerNode;
      } else {
        primaryNode = largerNode;
      }

      const secondaryNode = primaryNode === largerNode ? smallerNode : largerNode;

      this.hueVector = largerNode.hueVector.copy();

      primaryNode.type = DualColorType.PRIMARY;
      secondaryNode.type = DualColorType.SECONDARY;
    }
  }

  public get faces(): TFace[] {
    return this.colorNodes.flatMap((colorNode) => colorNode.faces);
  }

  public isStillValidInState(state: TState<TFaceColorData>, newFaceColors: Set<TFaceColor>): boolean {
    for (const colorNode of this.colorNodes) {
      if (!newFaceColors.has(colorNode.faceColor)) {
        return false;
      }
    }

    if (this.colorNodes.length === 1) {
      return state.getOppositeFaceColor(this.colorNodes[0].faceColor) === null;
    } else {
      return state.getOppositeFaceColor(this.colorNodes[0].faceColor) === this.colorNodes[1].faceColor;
    }
  }

  public updateHue(): void {
    for (const colorNode of this.colorNodes) {
      colorNode.hueVector.set(this.hueVector);

      colorNode.updateHue(this.faceCount >= this.style.faceColorThresholdProperty.value);
    }
  }

  public dispose(): void {
    for (const colorNode of this.colorNodes) {
      colorNode.dualColorView = null;
    }
  }
}

class FaceColorNode extends Path {
  public readonly hueVector: Vector2;
  public faceCount: number;
  public dualColorView: DualColorView | null = null;
  public type: DualColorType = DualColorType.BASIC;

  public constructor(
    public faceColor: TFaceColor,
    public faces: TFace[],
    public readonly style: TPuzzleStyle,
  ) {
    const hueVector = Vector2.createPolar(1, dotRandom.nextDoubleBetween(0, 2 * Math.PI));

    super(FaceColorNode.toShape(faces));

    this.hueVector = hueVector;
    this.faceCount = faces.length;
  }

  public updateHue(passesThreshold: boolean): void {
    if (passesThreshold || this.faceColor.colorState !== FaceColorState.UNDECIDED) {
      // if we have effectively zero magnitude, just use the x-axis
      this.fill = FaceColorNode.hueVectorToPaint(
        this.hueVector.getMagnitude() > 1e-6 ? this.hueVector : Vector2.X_UNIT,
        this.faceColor.colorState,
        this.type,
        this.style,
      );
    } else {
      this.fill = this.style.theme.faceColorDefaultColorProperty; // TODO: should we just use the value, because we are linked?
    }
  }

  public updateFaceColor(faceColor: TFaceColor, faces: TFace[]): void {
    const faceCountChange = faces.length - this.faceCount;

    this.faceColor = faceColor;
    this.faces = faces;
    this.shape = FaceColorNode.toShape(faces);
    this.faceCount = faces.length;

    if (this.dualColorView) {
      this.dualColorView.faceCount += faceCountChange;
    }
  }

  public static hueVectorToPaint(
    hueVector: Vector2,
    faceColorState: FaceColorState,
    type: DualColorType,
    style: TPuzzleStyle,
  ): TPaint {
    const table =
      type === DualColorType.BASIC ? style.theme.faceColorBasicHueLUTProperty.value
      : type === DualColorType.PRIMARY ? style.theme.faceColorLightHueLUTProperty.value
      : style.theme.faceColorDarkHueLUTProperty.value;

    const index = (Math.round((hueVector.getAngle() * 180) / Math.PI) + 360) % 360;
    assertEnabled() && assert(index >= 0 && index < table.length);

    const paint = table[index];

    if (faceColorState === FaceColorState.UNDECIDED) {
      return paint;
    } else {
      const colorProperty =
        faceColorState === FaceColorState.INSIDE ?
          style.theme.faceColorInsideColorProperty
        : style.theme.faceColorOutsideColorProperty;
      const color = colorProperty.value;
      const ratio = color.alpha;
      const paintColor = new Color(paint);
      const blended = new Color(
        (1 - ratio) * paintColor.red + ratio * color.red,
        (1 - ratio) * paintColor.green + ratio * color.green,
        (1 - ratio) * paintColor.blue + ratio * color.blue,
      );

      return blended.toCSS();
    }
  }

  public static toShape(faces: MultiIterable<TFace>): Shape {
    const shape = new Shape();

    // TODO: do we encounter conflation with this?
    for (const face of faces) {
      shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates));
    }

    return shape.makeImmutable();
  }
}
