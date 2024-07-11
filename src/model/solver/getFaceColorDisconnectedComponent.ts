import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { THalfEdge } from '../board/core/THalfEdge.ts';
import { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';
import _ from '../../workarounds/_.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

export const getFaceColorDisconnectedComponent = (
  board: TBoard,
  data: TFaceColorData & TFaceValueData,
  dirtyHalfEdges?: MultiIterable<THalfEdge>,
): THalfEdge[] | null => {
  // Try to find a traced boundary that splits the board into two regions:
  // - Exterior - every exterior face touching the boundary HAS THE SAME COLOR
  // - Interior
  // Then see if the interior and exterior regions BOTH require having a component.

  const remainingHalfEdges = new Set(dirtyHalfEdges ?? board.halfEdges);

  // Our "interior" is to our mathematical "left" (that the half edges will circle around by default)
  const getInteriorColor = (halfEdge: THalfEdge): TFaceColor => {
    return halfEdge.face === null ? data.getOutsideColor() : data.getFaceColor(halfEdge.face);
  };
  // Our "exterior" is to our mathematical "right"
  const getExteriorColor = (halfEdge: THalfEdge): TFaceColor => {
    return getInteriorColor(halfEdge.reversed);
  };

  let disconnectedComponents: THalfEdge[][] = [];

  // We'll remove half-edges as we trace
  while (remainingHalfEdges.size) {
    const startHalfEdge: THalfEdge = remainingHalfEdges.values().next().value;

    remainingHalfEdges.delete(startHalfEdge);

    const exteriorColor = getExteriorColor(startHalfEdge);
    const interiorColor = getInteriorColor(startHalfEdge);

    // If we are not on a boundary, we can skip this half edge (nothing to trace)
    if (exteriorColor === interiorColor) {
      continue;
    }

    // Walks forward, maintaining our (first) "exterior" color to our right
    const getNextHalfEdge = (halfEdge: THalfEdge): THalfEdge => {
      assertEnabled() && assert(getExteriorColor(halfEdge) === exteriorColor);

      const initialHalfEdge = halfEdge;
      while (getExteriorColor(halfEdge.next) !== exteriorColor) {
        halfEdge = halfEdge.next.reversed;
      }
      assertEnabled() && assert(initialHalfEdge !== halfEdge.next);
      return halfEdge.next;
    };

    const boundaryHalfEdges: THalfEdge[] = [];
    const interiorFaceSet = new Set<TFace | null>();
    const exteriorFaceSet = new Set<TFace | null>();

    const addHalfEdgeToBoundary = (halfEdge: THalfEdge): void => {
      boundaryHalfEdges.push(halfEdge);
      interiorFaceSet.add(halfEdge.face);
      exteriorFaceSet.add(halfEdge.reversed.face);
      remainingHalfEdges.delete(halfEdge);
    };

    // Trace the boundary.
    let count = 0;
    addHalfEdgeToBoundary(startHalfEdge);
    let currentHalfEdge = getNextHalfEdge(startHalfEdge);
    while (currentHalfEdge !== startHalfEdge) {
      addHalfEdgeToBoundary(currentHalfEdge);
      currentHalfEdge = getNextHalfEdge(currentHalfEdge);

      if (count++ > board.edges.length) {
        throw new Error('Infinite loop');
      }
    }

    // If we circled around one exterior face, we can skip this boundary.
    if (exteriorFaceSet.size === 1) {
      continue;
    }

    const boundaryEdges = new Set(boundaryHalfEdges.map((halfEdge) => halfEdge.edge));

    // Enumerate all faces that are on a particular side of the boundary
    const enumerateContainedFaces = (
      faceSet: Set<TFace | null>,
      callOnInitialFaces: boolean,
      callback: (face: TFace | null) => boolean, // Return true to stop enumeration
    ): void => {
      if (callOnInitialFaces) {
        for (const face of faceSet) {
          if (callback(face)) {
            return;
          }
        }
      }

      const facesToExplore = new Set(faceSet);

      while (facesToExplore.size) {
        const face: TFace = facesToExplore.values().next().value;
        facesToExplore.delete(face);

        // null (outside) face will include all edges with length 1
        // TODO: allow holes!
        const adjacentEdges = face === null ? board.edges.filter((edge) => edge.faces.length === 1) : face.edges;

        for (const edge of adjacentEdges) {
          if (!boundaryEdges.has(edge)) {
            const otherFace = edge.getOtherFace(face);

            if (!faceSet.has(otherFace)) {
              faceSet.add(otherFace);
              facesToExplore.add(otherFace);

              if (callback(otherFace)) {
                return;
              }
            }
          }
        }
      }
    };

    // If a face has:
    // - a face value > 0
    // - an opposite color to the exterior color
    // - an opposite color to another face
    // then the region is a component
    const isComponent = (faceSet: Set<TFace | null>, callOnInitialFaces: boolean): boolean => {
      let hasComponent = false;
      let faceColors = new Set<TFaceColor>([exteriorColor]);

      enumerateContainedFaces(faceSet, callOnInitialFaces, (face) => {
        if (face !== null) {
          const faceValue = data.getFaceValue(face);

          if (faceValue !== null && faceValue > 0) {
            // bail!
            hasComponent = true;
            return true;
          }
        }

        const faceColor = face === null ? data.getOutsideColor() : data.getFaceColor(face);

        if (faceColor !== exteriorColor && !faceColors.has(faceColor)) {
          faceColors.add(faceColor);

          const oppositeColor = data.getOppositeFaceColor(faceColor);

          if (oppositeColor && faceColors.has(oppositeColor)) {
            // bail!
            hasComponent = true;
            return true;
          }
        }

        return false;
      });

      return hasComponent;
    };

    // Exterior faces that are NOT touching the boundary
    const hasExteriorComponent = isComponent(exteriorFaceSet, false);
    if (!hasExteriorComponent) {
      continue;
    }

    // Interior faces (including touching the boundary)
    const hasInteriorComponent = isComponent(interiorFaceSet, true);

    if (hasInteriorComponent) {
      disconnectedComponents.push(boundaryHalfEdges);
    }
  }

  if (disconnectedComponents.length > 0) {
    return _.minBy(disconnectedComponents, (component) => component.length)!;
  }

  return null;
};
