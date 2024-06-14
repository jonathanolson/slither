import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';
import { TSerializedEdge } from '../../board/core/TSerializedEdge.ts';
import { getSectorsFromEdge } from '../sector-state/getSectorsFromEdge.ts';
import SectorState from '../sector-state/SectorState.ts';
import { VertexState } from '../vertex-state/VertexState.ts';
import { FaceState } from '../face-state/FaceState.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceColorState, { TFaceColor } from '../face-color/TFaceColorData.ts';
import { GeneralFaceColor } from '../face-color/GeneralFaceColor.ts';
import { getFaceColorGlobalId } from '../face-color/GeneralFaceColorData.ts';
import _ from '../../../workarounds/_.ts';

export class EraseEdgeCompleteAction implements TAction<TCompleteData> {
  public constructor(public readonly edge: TEdge) {
    assertEnabled() && assert(edge);
  }

  public apply(state: TCompleteData): void {
    const oldEdgeState = state.getEdgeState(this.edge);

    if (oldEdgeState !== EdgeState.WHITE) {
      state.setEdgeState(this.edge, EdgeState.WHITE);
    }

    const faceA = this.edge.forwardFace;
    const faceB = this.edge.reversedFace;

    const outsideColor = state.getOutsideColor();
    const insideColor = state.getInsideColor();

    const colorA = faceA ? state.getFaceColor(faceA) : outsideColor;
    const colorB = faceB ? state.getFaceColor(faceB) : outsideColor;

    const colorOppositeA = state.getOppositeFaceColor(colorA);

    // Try to break apart colors if they are the same or opposite
    if (colorA === colorB || colorOppositeA === colorB) {
      const nullableFacesWithColorA: (TFace | null)[] = [
        ...state.getFacesWithColor(colorA),
        ...(colorA === outsideColor ? [null] : []),
      ];
      const nullableFacesWithColorOppositeA: (TFace | null)[] =
        colorOppositeA ?
          [...state.getFacesWithColor(colorOppositeA), ...(colorOppositeA === outsideColor ? [null] : [])]
        : [];
      const nullableFacesWithColorPair = [...nullableFacesWithColorA, ...nullableFacesWithColorOppositeA];

      const getNullableFacesAttached = (face: TFace | null): Set<TFace | null> => {
        const faces = new Set<TFace | null>();

        const unexploredFaces = new Set<TFace | null>([face]);

        while (unexploredFaces.size > 0) {
          const currentFace = unexploredFaces.values().next().value as TFace | null;
          unexploredFaces.delete(currentFace);

          faces.add(currentFace);

          // Add adjacent faces to unexploredFaces
          if (currentFace) {
            // If we have a current face, we can explore its edges
            for (const edge of currentFace.edges) {
              if (state.getEdgeState(edge) !== EdgeState.WHITE) {
                const oppositeFace = edge.getOtherFace(currentFace);

                const oppositeFaceColor = oppositeFace ? state.getFaceColor(oppositeFace) : outsideColor;

                if (
                  (oppositeFaceColor === colorA || oppositeFaceColor === colorOppositeA) &&
                  !faces.has(oppositeFace)
                ) {
                  unexploredFaces.add(oppositeFace);
                }
              }
            }
          } else {
            // If we had the null (outside face), we need to explore all potential faces with exterior edges
            for (const face of nullableFacesWithColorPair) {
              if (face && !faces.has(face)) {
                for (const edge of face.edges) {
                  if (edge.getOtherFace(face) === null && state.getEdgeState(edge) !== EdgeState.WHITE) {
                    unexploredFaces.add(face);
                  }
                }
              }
            }
          }
        }

        return faces;
      };

      const nullableFacesAttachedToA = getNullableFacesAttached(faceA);

      // If we have NO path forward, we'll need to split things!
      if (!nullableFacesAttachedToA.has(faceB)) {
        const nullableFacesAttachedToB = getNullableFacesAttached(faceB);

        assertEnabled() && assert(nullableFacesAttachedToA.size > 0 && nullableFacesAttachedToB.size > 0);
        assertEnabled() &&
          assert([...nullableFacesAttachedToA].every((nullableFace) => !nullableFacesAttachedToB.has(nullableFace)));

        const unchangedFaces = nullableFacesWithColorPair.filter(
          (face) => !nullableFacesAttachedToA.has(face) && !nullableFacesAttachedToB.has(face),
        );

        // Parameters for the state.modifyFaceColors call
        const addedFaceColors: TFaceColor[] = [];
        const removedFaceColors: TFaceColor[] = [];
        const faceChangeMap: Map<TFace, TFaceColor> = new Map();
        const oppositeChangeMap: Map<TFaceColor, TFaceColor | null> = new Map();

        const updateColors = (
          faces: (TFace | null)[],
          primaryColor: TFaceColor | null,
          secondaryColor: TFaceColor | null,
        ) => {
          const oldAFaces = faces.filter((face) => (face ? state.getFaceColor(face) : outsideColor) === colorA);
          const oldOppositeAFaces = faces.filter(
            (face) => (face ? state.getFaceColor(face) : outsideColor) === colorOppositeA,
          );

          if (primaryColor !== null) {
            // We won't be changing colors, but we might REMOVE an unused color
            if (primaryColor !== outsideColor && primaryColor !== insideColor) {
              if (!oldAFaces.length) {
                removedFaceColors.push(primaryColor);
              }
              if (secondaryColor && !oldOppositeAFaces.length) {
                removedFaceColors.push(secondaryColor);
              }
            }
          } else {
            assertEnabled() && assert(faces.every((face) => face));

            primaryColor = new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.UNDECIDED);
            addedFaceColors.push(primaryColor);

            // If we have a color AND its opposite still, we'll need to create a second color
            if (oldAFaces.length && oldOppositeAFaces.length) {
              secondaryColor = new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.UNDECIDED);
              addedFaceColors.push(secondaryColor);
              oppositeChangeMap.set(primaryColor, secondaryColor);
              oppositeChangeMap.set(secondaryColor, primaryColor);

              for (const face of oldAFaces) {
                assertEnabled() && assert(face);

                faceChangeMap.set(face!, primaryColor);
              }
              for (const face of oldOppositeAFaces) {
                assertEnabled() && assert(face);

                faceChangeMap.set(face!, secondaryColor);
              }
            } else {
              const faces = oldAFaces.length ? oldAFaces : oldOppositeAFaces;

              assertEnabled() && assert(faces.length);

              for (const face of faces) {
                assertEnabled() && assert(face);

                faceChangeMap.set(face!, primaryColor);
              }
            }
          }
        };

        const attachedAFaces = [...nullableFacesAttachedToA];
        const attachedBFaces = [...nullableFacesAttachedToB];

        // Sort them so that the list with the "outside" face is first, and then descending by length (so we keep the "most important" one first)
        const faceLists = _.sortBy(
          [...(unchangedFaces.length ? [unchangedFaces] : []), attachedAFaces, attachedBFaces],
          (faces) => -faces.length + (faces.some((face) => !face) ? -1e7 : 0),
        );

        for (let i = 0; i < faceLists.length; i++) {
          // Provide the current colorA/colorOppositeA only for the first (most important) one
          updateColors(faceLists[i], i === 0 ? colorA : null, i === 0 ? colorOppositeA : null);
        }

        state.modifyFaceColors(addedFaceColors, removedFaceColors, faceChangeMap, oppositeChangeMap, false);
      }
    }

    // TODO: is this... overzealous?
    for (const sector of getSectorsFromEdge(this.edge)) {
      state.setSectorState(sector, SectorState.ANY);
    }

    for (const vertex of this.edge.vertices) {
      state.setVertexState(vertex, VertexState.any(vertex));
    }

    for (const face of this.edge.faces) {
      state.setFaceState(face, FaceState.any(face, state.getFaceValue(face)));
    }
  }

  public getUndo(state: TCompleteData): TAction<TCompleteData> {
    throw new Error('getUndo unimplemented in EraseEdgeCompleteAction');
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'EraseEdgeCompleteAction',
      edge: serializeEdge(this.edge),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): EraseEdgeCompleteAction {
    const edge = deserializeEdge(board, serializedAction.edge as TSerializedEdge);

    return new EraseEdgeCompleteAction(edge);
  }
}
