import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData, TEdgeStateListener } from '../data/edge-state/TEdgeStateData.ts';
import FaceColorState, { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { GeneralFaceColor } from '../data/face-color/GeneralFaceColor.ts';
import { getFaceColorGlobalId } from '../data/face-color/GeneralFaceColorData.ts';
import { GeneralFaceColorAction } from '../data/face-color/GeneralFaceColorAction.ts';
import { FaceColorInvalidAction } from '../data/face-color/FaceColorInvalidAction.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';

import { getFaceColorPointer } from '../data/face-color/getFaceColorPointer.ts';

type Data = TEdgeStateData & TFaceColorData;

export class SafeEdgeToFaceColorSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  // Track whether a red/black edge changed to something else (we'll need to recompute the face colors)
  private hadEdgeAdjusted: boolean = false;

  private readonly dirtyEdges = new Set<TEdge>();

  private readonly edgeListener: TEdgeStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
  ) {
    board.edges.forEach((edge) => this.dirtyEdges.add(edge));

    this.edgeListener = (edge: TEdge, state: EdgeState, oldState: EdgeState) => {
      this.dirtyEdges.add(edge);

      this.hadEdgeAdjusted = this.hadEdgeAdjusted || oldState !== EdgeState.WHITE;
    };

    this.state.edgeStateChangedEmitter.addListener(this.edgeListener);
  }

  public get dirty(): boolean {
    return this.dirtyEdges.size > 0 || this.hadEdgeAdjusted;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    const requiresFullRecompute = this.hadEdgeAdjusted || this.state.hasInvalidFaceColors();

    if (requiresFullRecompute) {
      // Clear our dirty state, so we don't infinite-loop
      this.hadEdgeAdjusted = false;
      this.dirtyEdges.clear();

      const faceProtoColorMap = new Map<TFace, ProtoFaceColor>();
      const protoOutside = new ProtoFaceColor(FaceColorState.OUTSIDE, new Set<TFace>());
      const protoInside = new ProtoFaceColor(FaceColorState.INSIDE, new Set<TFace>());
      protoOutside.opposite = protoInside;
      protoInside.opposite = protoOutside;
      const protoColors = new Set([
        protoOutside,
        protoInside,
        ...this.board.faces.map((face) => {
          const protoColor = new ProtoFaceColor(FaceColorState.UNDECIDED, new Set<TFace>([face]));
          faceProtoColorMap.set(face, protoColor);
          return protoColor;
        }),
      ]);

      // If this is set, we can effectively abort and set the invalidFaceColor flag
      let encounteredError = false;
      const getColor = (face: TFace | null): ProtoFaceColor => {
        if (face === null) {
          return protoOutside;
        }
        const color = faceProtoColorMap.get(face)!;
        assertEnabled() && assert(color);
        return color;
      };
      const getCombinedColor = (a: ProtoFaceColor, b: ProtoFaceColor): ProtoFaceColor => {
        // Don't get rid of our inside/outside colors
        if (b === protoOutside || b === protoInside) {
          return getCombinedColor(b, a);
        }

        assertEnabled() && assert(a !== b);

        for (const face of b.faces) {
          a.faces.add(face);
          faceProtoColorMap.set(face, a);
        }
        b.faces.clear();
        protoColors.delete(b);
        return a;
      };
      const makeSame = (a: ProtoFaceColor, b: ProtoFaceColor) => {
        assertEnabled() && assert(protoColors.has(a) && protoColors.has(b));

        if (a === b) {
          return;
        }

        const aOpposite = a.opposite;
        const bOpposite = b.opposite;

        // TODO: based on opposite structure, we probably don't need both of these checks?
        if (aOpposite && aOpposite === b) {
          encounteredError = true;
          return;
        }
        if (bOpposite && bOpposite === a) {
          encounteredError = true;
          return;
        }

        const result = getCombinedColor(a, b);
        const opposite = aOpposite && bOpposite ? getCombinedColor(aOpposite, bOpposite) : aOpposite || bOpposite;
        result.opposite = opposite;
        if (opposite) {
          opposite.opposite = result;
        }
      };
      const makeOpposite = (a: ProtoFaceColor, b: ProtoFaceColor) => {
        assertEnabled() && assert(protoColors.has(a) && protoColors.has(b));

        if (a === b) {
          encounteredError = true;
          return;
        }

        // No-op if they are already opposites
        if (a.opposite && a.opposite === b) {
          return;
        }

        const aOpposite = a.opposite;
        const bOpposite = b.opposite;

        if (aOpposite && aOpposite === bOpposite) {
          encounteredError = true;
          return;
        }

        const newA = bOpposite ? getCombinedColor(a, bOpposite) : a;
        const newB = aOpposite ? getCombinedColor(b, aOpposite) : b;
        newA.opposite = newB;
        newB.opposite = newA;
      };

      for (const edge of this.board.edges) {
        if (encounteredError) {
          break;
        }

        const state = this.state.getEdgeState(edge);
        if (state !== EdgeState.WHITE) {
          const faceColorA = getColor(edge.forwardFace);
          const faceColorB = getColor(edge.reversedFace);

          if (state === EdgeState.BLACK) {
            makeOpposite(faceColorA, faceColorB);
          } else if (state === EdgeState.RED) {
            makeSame(faceColorA, faceColorB);
          }
        }
      }

      // Double check that we cover all faces
      if (assertEnabled()) {
        const faceSet = new Set(this.board.faces);

        for (const protoColor of protoColors) {
          for (const face of protoColor.faces) {
            faceSet.delete(face);
          }
        }

        assert(faceSet.size === 0);
      }

      if (encounteredError) {
        return new AnnotatedAction(
          new FaceColorInvalidAction(),
          {
            type: 'InvalidFaceColoring',
          },
          this.board,
        );
      }

      // Match up with old colors

      const oldFaceColors = new Set(this.state.getFaceColors());

      // A few things for our action
      const addedFaceColors: Set<TFaceColor> = new Set();
      const faceChangeMap: Map<TFace, TFaceColor> = new Map();

      const assignOldColor = (oldFaceColor: TFaceColor, protoColor: ProtoFaceColor) => {
        assertEnabled() && assert(oldFaceColors.has(oldFaceColor));
        assertEnabled() && assert(protoColor.faceColor === null);

        oldFaceColors.delete(oldFaceColor);
        protoColor.faceColor = oldFaceColor;
      };

      assignOldColor(this.state.getOutsideColor(), protoOutside);
      assignOldColor(this.state.getInsideColor(), protoInside);

      for (const protoColor of protoColors) {
        if (!protoColor.faceColor) {
          const possibleOldColors = new Set([...protoColor.faces].map((face) => this.state.getFaceColor(face)));
          let bestOldColor: TFaceColor | null = null;
          let bestCount = 0;

          for (const oldColor of possibleOldColors) {
            // Ignore already used
            if (!oldFaceColors.has(oldColor)) {
              continue;
            }

            // Ignore if we didn't completely capture it
            const oldFaces = this.state.getFacesWithColor(oldColor);
            if (oldFaces.some((oldFace) => !protoColor.faces.has(oldFace))) {
              continue;
            }

            if (oldFaces.length > bestCount) {
              bestOldColor = oldColor;
              bestCount = oldFaces.length;
            }
          }

          if (bestOldColor) {
            assignOldColor(bestOldColor, protoColor);
          } else {
            const addedFaceColor = new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.UNDECIDED);
            addedFaceColors.add(addedFaceColor);
            protoColor.faceColor = addedFaceColor;
          }
        }

        const newFaceColor = protoColor.faceColor!;
        assertEnabled() && assert(newFaceColor);

        protoColor.faces.forEach((face) => {
          const oldColor = this.state.getFaceColor(face);

          if (oldColor !== newFaceColor) {
            faceChangeMap.set(face, newFaceColor);
          }
        });
      }

      const removedFaceColors: Set<TFaceColor> = new Set(oldFaceColors);
      const oppositeChangeMap: Map<TFaceColor, TFaceColor | null> = new Map();

      // Connect up the oppositeChangeMap
      for (const protoColor of protoColors) {
        const newColor = protoColor.faceColor!;
        const newOpposite = protoColor.opposite?.faceColor ?? null;

        let needsOppositeChange = addedFaceColors.has(newColor);
        if (!needsOppositeChange) {
          const oldOpposite = this.state.getOppositeFaceColor(newColor);

          needsOppositeChange = oldOpposite !== newOpposite;
        }

        if (needsOppositeChange) {
          oppositeChangeMap.set(newColor, newOpposite);
        }
      }

      const hasChange =
        addedFaceColors.size > 0 ||
        removedFaceColors.size > 0 ||
        faceChangeMap.size > 0 ||
        oppositeChangeMap.size > 0 ||
        this.state.hasInvalidFaceColors();

      if (hasChange) {
        return new AnnotatedAction(
          new GeneralFaceColorAction(
            this.board,
            addedFaceColors,
            removedFaceColors,
            faceChangeMap,
            oppositeChangeMap,
            false,
          ),
          {
            type: 'GeneralFaceColoring',
          },
          this.board,
        );
      } else {
        return null;
      }
    } else {
      while (this.dirtyEdges.size) {
        const edge: TEdge = this.dirtyEdges.values().next().value;
        this.dirtyEdges.delete(edge);

        const state = this.state.getEdgeState(edge);
        if (state !== EdgeState.WHITE) {
          const faceColorA =
            edge.forwardFace ? this.state.getFaceColor(edge.forwardFace) : this.state.getOutsideColor();
          const faceColorB =
            edge.reversedFace ? this.state.getFaceColor(edge.reversedFace) : this.state.getOutsideColor();

          if (state === EdgeState.BLACK) {
            if (this.state.getOppositeFaceColor(faceColorA) !== faceColorB) {
              return new AnnotatedAction(
                new FaceColorMakeOppositeAction(
                  getFaceColorPointer(this.state, faceColorA),
                  getFaceColorPointer(this.state, faceColorB),
                ),
                {
                  type: 'FaceColoringBlackEdge',
                  edge: edge,
                },
                this.board,
              );
            }
          } else if (state === EdgeState.RED) {
            if (faceColorA !== faceColorB) {
              return new AnnotatedAction(
                new FaceColorMakeSameAction(
                  getFaceColorPointer(this.state, faceColorA),
                  getFaceColorPointer(this.state, faceColorB),
                ),
                {
                  type: 'FaceColoringRedEdge',
                  edge: edge,
                },
                this.board,
              );
            }
          }
        }
      }
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): SafeEdgeToFaceColorSolver {
    return new SafeEdgeToFaceColorSolver(this.board, equivalentState);
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener(this.edgeListener);
  }
}

class ProtoFaceColor {
  public opposite: ProtoFaceColor | null = null;
  public faceColor: TFaceColor | null = null;

  public constructor(
    public readonly colorState: FaceColorState,
    public readonly faces: Set<TFace>,
  ) {}
}
