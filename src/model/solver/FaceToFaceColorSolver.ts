import { TSolver } from './TSolver.ts';
import { TFace } from '../board/core/TFace.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { TFaceStateData, TFaceStateListener } from '../data/face-state/TFaceStateData.ts';
import { TEdge } from '../board/core/TEdge.ts';
import _ from '../../workarounds/_.ts';
import { getFaceColorPointer } from '../data/face-color/getFaceColorPointer.ts';

type Data = TFaceColorData & TFaceStateData;

export class FaceToFaceColorSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtyFaces: TFace[] = [];

  private readonly faceListener: TFaceStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: TFace[],
  ) {
    if (dirtyFaces) {
      this.dirtyFaces.push(...dirtyFaces);
    } else {
      this.dirtyFaces.push(...board.faces);
    }

    this.faceListener = (face: TFace) => {
      this.dirtyFaces.push(face);
    };
    this.state.faceStateChangedEmitter.addListener(this.faceListener);
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    while (this.dirtyFaces.length) {
      const face: TFace = this.dirtyFaces[this.dirtyFaces.length - 1];

      const faceState = this.state.getFaceState(face);

      if (faceState.possibilityCount === 0) {
        throw new InvalidStateError('Face has no possibilities');
      }

      const faceColorMap = new Map<TEdge, TFaceColor>(
        face.edges.map((edge) => {
          const otherFace = edge.getOtherFace(face);
          return [edge, otherFace ? this.state.getFaceColor(otherFace) : this.state.getOutsideColor()];
        }),
      );
      const allFaces = [face, ...(face.edges.map((edge) => edge.getOtherFace(face)).filter(_.identity) as TFace[])];

      const selfFaceColor = this.state.getFaceColor(face);
      const uniqueFaceColors = new Set([...faceColorMap.values(), selfFaceColor]);

      // Can't get better than that...
      if (uniqueFaceColors.size !== 1) {
        // TODO: this could be cleaned up a ton
        const wasSameDoubleMap = new Map<TFaceColor, Map<TFaceColor, boolean>>(
          [...uniqueFaceColors].map((aColor) => [
            aColor,
            new Map([...uniqueFaceColors].map((bColor) => [bColor, false])),
          ]),
        );
        const wasOppositeDoubleMap = new Map<TFaceColor, Map<TFaceColor, boolean>>(
          [...uniqueFaceColors].map((aColor) => [
            aColor,
            new Map([...uniqueFaceColors].map((bColor) => [bColor, false])),
          ]),
        );

        for (const blackEdges of faceState.getAllowedCombinations()) {
          const interiorColors = new Set<TFaceColor>([selfFaceColor]);
          const exteriorColors = new Set<TFaceColor>();

          for (const edge of face.edges) {
            if (blackEdges.includes(edge)) {
              exteriorColors.add(faceColorMap.get(edge)!);
            } else {
              interiorColors.add(faceColorMap.get(edge)!);
            }
          }

          const processSame = (colors: TFaceColor[]) => {
            for (let i = 0; i < colors.length; i++) {
              for (let j = i + 1; j < colors.length; j++) {
                wasSameDoubleMap.get(colors[i])!.set(colors[j], true);
                wasSameDoubleMap.get(colors[j])!.set(colors[i], true);
              }
            }
          };
          processSame([...interiorColors]);
          processSame([...exteriorColors]);

          for (const aColor of interiorColors) {
            for (const bColor of exteriorColors) {
              if (aColor !== bColor) {
                wasOppositeDoubleMap.get(aColor)!.set(bColor, true);
                wasOppositeDoubleMap.get(bColor)!.set(aColor, true);
              }
            }
          }
        }

        for (const aColor of uniqueFaceColors) {
          for (const bColor of uniqueFaceColors) {
            if (aColor === bColor) {
              continue;
            }

            const wasSame = wasSameDoubleMap.get(aColor)!.get(bColor)!;
            const wasOpposite = wasOppositeDoubleMap.get(aColor)!.get(bColor)!;

            // TODO: NOTE: Only returning one face operation AT A TIME

            if (wasSame && !wasOpposite) {
              return new AnnotatedAction(
                new FaceColorMakeSameAction(
                  getFaceColorPointer(this.state, aColor),
                  getFaceColorPointer(this.state, bColor),
                ),
                {
                  type: 'FaceStateToSameFaceColor',
                  face: face,
                  facesA: allFaces.filter((face) => this.state.getFaceColor(face) === aColor),
                  facesB: allFaces.filter((face) => this.state.getFaceColor(face) === bColor),
                },
                this.board,
              );
            }
            if (wasOpposite && !wasSame && this.state.getOppositeFaceColor(aColor) !== bColor) {
              return new AnnotatedAction(
                new FaceColorMakeOppositeAction(
                  getFaceColorPointer(this.state, aColor),
                  getFaceColorPointer(this.state, bColor),
                ),
                {
                  type: 'FaceStateToOppositeFaceColor',
                  face: face,
                  facesA: allFaces.filter((face) => this.state.getFaceColor(face) === aColor),
                  facesB: allFaces.filter((face) => this.state.getFaceColor(face) === bColor),
                },
                this.board,
              );
            }
          }
        }
      }

      const removedFace = this.dirtyFaces.pop();
      assertEnabled() && assert(removedFace === face);
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): FaceToFaceColorSolver {
    return new FaceToFaceColorSolver(this.board, equivalentState, this.dirtyFaces);
  }

  public dispose(): void {
    this.state.faceStateChangedEmitter.removeListener(this.faceListener);
  }
}
