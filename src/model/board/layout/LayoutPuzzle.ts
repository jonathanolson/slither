import { CompleteData } from '../../data/combined/CompleteData.ts';
import { TCompleteData } from '../../data/combined/TCompleteData.ts';
import { TState } from '../../data/core/TState.ts';
import EdgeState from '../../data/edge-state/EdgeState.ts';
import { TEdgeStateData } from '../../data/edge-state/TEdgeStateData.ts';
import FaceValue from '../../data/face-value/FaceValue.ts';
import { TFaceValueData } from '../../data/face-value/TFaceValueData.ts';
import { TPuzzle } from '../../puzzle/TPuzzle.ts';
import { safeSolve } from '../../solver/safeSolve.ts';
import { BaseBoard } from '../core/BaseBoard.ts';
import { TBoard } from '../core/TBoard.ts';
import { TEdge } from '../core/TEdge.ts';
import { TFace } from '../core/TFace.ts';
import { THalfEdge } from '../core/THalfEdge.ts';
import { TVertex } from '../core/TVertex.ts';
import { getCentroid, getSignedArea } from '../core/createBoardDescriptor.ts';
import { validateBoard } from '../core/validateBoard.ts';
import { LayoutDerivative } from './LayoutDerivative.ts';
import {
  LayoutEdge,
  LayoutExternalZone,
  LayoutFace,
  LayoutHalfEdge,
  LayoutInternalZone,
  LayoutStructure,
  LayoutVertex,
} from './layout.ts';

import { Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { arrayRemove } from 'phet-lib/phet-core';
import { Circle, Color, Line, Node, Path, TColor, Text } from 'phet-lib/scenery';

import { okhslToRGBString } from '../../../util/color.ts';

import { currentTheme } from '../../../view/Theme.ts';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';


export class LayoutPuzzle extends BaseBoard<LayoutStructure> {
  public edgeStateMap: Map<LayoutEdge, EdgeState> = new Map();
  public faceValueMap: Map<LayoutFace, FaceValue> = new Map();

  public constructor(
    public readonly originalBoard: TBoard,
    public readonly originalState: TState<TFaceValueData & TEdgeStateData>,
  ) {
    const vertexMap = new Map<TVertex, LayoutVertex>();
    const faceMap = new Map<TFace, LayoutFace>();
    const edgeMap = new Map<TEdge, LayoutEdge>();
    const halfEdgeMap = new Map<THalfEdge, LayoutHalfEdge>();

    const vertexReverseMap = new Map<LayoutVertex, TVertex>();
    const faceReverseMap = new Map<LayoutFace, TFace>();
    const edgeReverseMap = new Map<LayoutEdge, TEdge>();
    const halfEdgeReverseMap = new Map<LayoutHalfEdge, THalfEdge>();

    const getLayoutVertex = (vertex: TVertex) => {
      const layoutVertex = vertexMap.get(vertex);
      assertEnabled() && assert(layoutVertex);
      return layoutVertex!;
    };
    const getLayoutFace = (face: TFace) => {
      const layoutFace = faceMap.get(face);
      assertEnabled() && assert(layoutFace);
      return layoutFace!;
    };
    const getLayoutEdge = (edge: TEdge) => {
      const layoutEdge = edgeMap.get(edge);
      assertEnabled() && assert(layoutEdge);
      return layoutEdge!;
    };
    const getLayoutHalfEdge = (halfEdge: THalfEdge) => {
      const layoutHalfEdge = halfEdgeMap.get(halfEdge);
      assertEnabled() && assert(layoutHalfEdge);
      return layoutHalfEdge!;
    };

    const getOriginalVertex = (layoutVertex: LayoutVertex) => {
      const vertex = vertexReverseMap.get(layoutVertex);
      assertEnabled() && assert(vertex);
      return vertex!;
    };
    const getOriginalFace = (layoutFace: LayoutFace) => {
      const face = faceReverseMap.get(layoutFace);
      assertEnabled() && assert(face);
      return face!;
    };
    const getOriginalEdge = (layoutEdge: LayoutEdge) => {
      const edge = edgeReverseMap.get(layoutEdge);
      assertEnabled() && assert(edge);
      return edge!;
    };
    const getOriginalHalfEdge = (layoutHalfEdge: LayoutHalfEdge) => {
      const halfEdge = halfEdgeReverseMap.get(layoutHalfEdge);
      assertEnabled() && assert(halfEdge);
      return halfEdge!;
    };

    const vertices = originalBoard.vertices.map((vertex) => {
      const layoutVertex = new LayoutVertex(vertex.logicalCoordinates, vertex.viewCoordinates);
      vertexMap.set(vertex, layoutVertex);
      vertexReverseMap.set(layoutVertex, vertex);
      return layoutVertex;
    });
    const faces = originalBoard.faces.map((face) => {
      const layoutFace = new LayoutFace(face.logicalCoordinates, face.viewCoordinates);
      faceMap.set(face, layoutFace);
      faceReverseMap.set(layoutFace, face);
      layoutFace.originalFace = face;
      return layoutFace;
    });
    const halfEdges: LayoutHalfEdge[] = [];
    const edges = originalBoard.edges.map((edge) => {
      const start = vertexMap.get(edge.start)!;
      const end = vertexMap.get(edge.end)!;
      assertEnabled() && assert(start);
      assertEnabled() && assert(end);

      const layoutEdge = new LayoutEdge(start, end);
      layoutEdge.originalEdges.add(edge);
      edgeMap.set(edge, layoutEdge);
      edgeReverseMap.set(layoutEdge, edge);

      const forwardHalf = new LayoutHalfEdge(start, end, false);
      halfEdgeMap.set(edge.forwardHalf, forwardHalf);
      halfEdgeReverseMap.set(forwardHalf, edge.forwardHalf);
      halfEdges.push(forwardHalf);

      const reversedHalf = new LayoutHalfEdge(end, start, true);
      halfEdgeMap.set(edge.reversedHalf, reversedHalf);
      halfEdgeReverseMap.set(reversedHalf, edge.reversedHalf);
      halfEdges.push(reversedHalf);

      return layoutEdge;
    });

    vertices.forEach((layoutVertex) => {
      const vertex = getOriginalVertex(layoutVertex);
      layoutVertex.incomingHalfEdges = vertex.incomingHalfEdges.map(getLayoutHalfEdge);
      layoutVertex.outgoingHalfEdges = vertex.outgoingHalfEdges.map(getLayoutHalfEdge);
      layoutVertex.edges = vertex.edges.map(getLayoutEdge);
      layoutVertex.faces = vertex.faces.map(getLayoutFace);
    });

    faces.forEach((layoutFace) => {
      const face = getOriginalFace(layoutFace);
      layoutFace.halfEdges = face.halfEdges.map(getLayoutHalfEdge);
      layoutFace.edges = face.edges.map(getLayoutEdge);
      layoutFace.vertices = face.vertices.map(getLayoutVertex);
    });

    edges.forEach((layoutEdge) => {
      const edge = getOriginalEdge(layoutEdge);
      layoutEdge.forwardHalf = getLayoutHalfEdge(edge.forwardHalf);
      layoutEdge.reversedHalf = getLayoutHalfEdge(edge.reversedHalf);
      layoutEdge.forwardFace = edge.forwardFace ? getLayoutFace(edge.forwardFace) : null;
      layoutEdge.reversedFace = edge.reversedFace ? getLayoutFace(edge.reversedFace) : null;
      layoutEdge.vertices = edge.vertices.map(getLayoutVertex);
      layoutEdge.faces = edge.faces.map(getLayoutFace);
    });

    halfEdges.forEach((layoutHalfEdge) => {
      const halfEdge = getOriginalHalfEdge(layoutHalfEdge);
      layoutHalfEdge.edge = getLayoutEdge(halfEdge.edge);
      layoutHalfEdge.reversed = getLayoutHalfEdge(halfEdge.reversed);
      layoutHalfEdge.next = getLayoutHalfEdge(halfEdge.next);
      layoutHalfEdge.previous = getLayoutHalfEdge(halfEdge.previous);
      layoutHalfEdge.face = halfEdge.face ? getLayoutFace(halfEdge.face) : null;
    });

    super({
      edges: edges,
      vertices: vertices,
      faces: faces,
      halfEdges: halfEdges,

      // TODO: how to handle? We can just recompute after everything?
      outerBoundary: originalBoard.outerBoundary.map(getLayoutHalfEdge),
      innerBoundaries: originalBoard.innerBoundaries.map((innerBoundary) => innerBoundary.map(getLayoutHalfEdge)),
    });

    edges.forEach((layoutEdge) => {
      this.edgeStateMap.set(layoutEdge, originalState.getEdgeState(getOriginalEdge(layoutEdge)));
    });

    faces.forEach((layoutFace) => {
      this.faceValueMap.set(layoutFace, originalState.getFaceValue(getOriginalFace(layoutFace)));
    });

    assertEnabled() && validateBoard(this);
  }

  public getFaceValue(face: LayoutFace): FaceValue {
    const state = this.faceValueMap.get(face);
    assertEnabled() && assert(state !== undefined);
    return state!;
  }

  public getEdgeState(edge: LayoutEdge): EdgeState {
    const state = this.edgeStateMap.get(edge);
    assertEnabled() && assert(state !== undefined);
    return state!;
  }

  private clearSatisfiedFaces(): void {
    this.faces.forEach((face) => {
      const faceValue = this.getFaceValue(face);
      if (faceValue === null) {
        return;
      }

      let whiteCount = 0;
      let blackCount = 0;

      face.edges.forEach((edge) => {
        const edgeState = this.getEdgeState(edge);
        if (edgeState === EdgeState.WHITE) {
          whiteCount++;
        } else if (edgeState === EdgeState.BLACK) {
          blackCount++;
        }
      });

      if (whiteCount === 0 && blackCount === faceValue) {
        this.faceValueMap.set(face, null);
      }
    });
  }

  private removeDeadRedEdges(): void {
    const deadEdges = new Set(
      this.edges.filter((edge) => {
        return (
          this.getEdgeState(edge) === EdgeState.RED &&
          edge.faces.every((face) => {
            return face === null || this.getFaceValue(face) === null;
          })
        );
      }),
    );
    const deadVertices = new Set(
      this.vertices.filter((vertex) => {
        return vertex.edges.every((edge) => deadEdges.has(edge));
      }),
    );
    const deadFaces = new Set(
      this.faces.filter((face) => {
        return face.edges.some((edge) => deadEdges.has(edge));
      }),
    );

    const deadZones: (LayoutInternalZone | LayoutExternalZone)[] = [];

    // Handle adjacently-grouped faces in groups
    const deadFacesRemaining = new Set(deadFaces);
    while (deadFacesRemaining.size) {
      const initialFace: LayoutFace = deadFacesRemaining.values().next().value;
      deadFacesRemaining.delete(initialFace);

      const faces = [initialFace];
      let isExterior = false;
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        face.edges.forEach((edge) => {
          if (deadEdges.has(edge)) {
            [edge.forwardFace, edge.reversedFace].forEach((adjacentFace) => {
              if (adjacentFace === face) {
                return;
              }
              if (adjacentFace === null) {
                isExterior = true;
                return;
              }
              if (deadFacesRemaining.has(adjacentFace)) {
                deadFacesRemaining.delete(adjacentFace);
                faces.push(adjacentFace);
              }
            });
          }
        });
      }

      const allHalfEdges = new Set(faces.flatMap((face) => face.halfEdges));
      const allReversedHalfEdges = new Set(
        faces.flatMap((face) => face.halfEdges.map((halfEdge) => halfEdge.reversed)),
      );
      const boundaryHalfEdgesSet = new Set([...allHalfEdges].filter((halfEdge) => !allReversedHalfEdges.has(halfEdge)));

      const getNextHalfEdge = (halfEdge: LayoutHalfEdge) => {
        let nextHalfEdge = halfEdge.next;
        while (nextHalfEdge !== halfEdge && !boundaryHalfEdgesSet.has(nextHalfEdge)) {
          nextHalfEdge = nextHalfEdge.reversed.next;
        }
        assertEnabled() && assert(nextHalfEdge !== halfEdge);
        return nextHalfEdge;
      };

      const initialHalfEdge: LayoutHalfEdge = boundaryHalfEdgesSet.values().next().value;
      const boundaryHalfEdges: LayoutHalfEdge[] = [initialHalfEdge];
      let currentHalfEdge = getNextHalfEdge(initialHalfEdge);
      while (currentHalfEdge !== initialHalfEdge) {
        boundaryHalfEdges.push(currentHalfEdge);
        currentHalfEdge = getNextHalfEdge(currentHalfEdge);
      }
      assertEnabled() && assert(boundaryHalfEdges.length === boundaryHalfEdgesSet.size);

      // TODO: do we actually FIX up the boundaries? maybe recompute them later

      // console.log( 'group', `faces: ${faces.length}`, isExterior ? 'exterior' : 'interior', `boundary length: ${boundaryHalfEdges.length}` );

      if (isExterior) {
        // Find half edges that "start" the boundary (previous edge is removed)
        const boundarySegments: LayoutHalfEdge[][] = [];
        for (let i = 0; i < boundaryHalfEdges.length; i++) {
          const halfEdge = boundaryHalfEdges[i];
          const previousHalfEdge = boundaryHalfEdges[(i + boundaryHalfEdges.length - 1) % boundaryHalfEdges.length];

          assertEnabled() && assert(previousHalfEdge.end === halfEdge.start);

          if (!deadEdges.has(halfEdge.edge) && deadEdges.has(previousHalfEdge.edge)) {
            const boundarySegment = [halfEdge];
            for (let j = i + 1; ; j++) {
              const nextHalfEdge = boundaryHalfEdges[j % boundaryHalfEdges.length];

              if (deadEdges.has(nextHalfEdge.edge)) {
                break;
              } else {
                boundarySegment.push(nextHalfEdge);
              }
            }
            boundarySegments.push(boundarySegment);

            // console.log( 'segment', boundarySegment.length );
          }
        }
        deadZones.push(new LayoutExternalZone(faces, boundaryHalfEdges, boundarySegments));
      } else {
        deadZones.push(new LayoutInternalZone(faces, boundaryHalfEdges));
      }
    }

    deadZones.forEach((zone) => {
      if (zone instanceof LayoutInternalZone) {
        const vertices = zone.boundaryHalfEdges.map((halfEdge) => halfEdge.start);
        const edges = zone.boundaryHalfEdges.map((halfEdge) => halfEdge.edge);

        // TODO: can we do a better job with logical coordinates here? incremental?
        const newFace = new LayoutFace(
          getCentroid(vertices.map((vertex) => vertex.viewCoordinates)),
          getCentroid(vertices.map((vertex) => vertex.logicalCoordinates)),
        );
        this.faces.push(newFace);
        this.faceValueMap.set(newFace, null);

        newFace.halfEdges = zone.boundaryHalfEdges;
        newFace.edges = edges;
        newFace.vertices = vertices;

        // Rewrite the boundary half-edges
        for (let i = 0; i < zone.boundaryHalfEdges.length; i++) {
          const halfEdge = zone.boundaryHalfEdges[i];
          const oldFace = halfEdge.face;

          halfEdge.face = newFace;

          const edge = halfEdge.edge;
          if (halfEdge.isReversed) {
            edge.reversedFace = newFace;
          } else {
            edge.forwardFace = newFace;
          }

          assertEnabled() && assert(oldFace);
          if (oldFace) {
            arrayRemove(edge.faces, oldFace);
          }
          edge.faces.push(newFace);
        }
      } else {
        zone.boundarySegments.forEach((boundarySegment) => {
          boundarySegment.forEach((halfEdge) => {
            const edge = halfEdge.edge;
            const oldFace = halfEdge.face;
            if (oldFace) {
              halfEdge.face = null;
              arrayRemove(edge.faces, oldFace);
            }
            if (halfEdge.isReversed) {
              edge.reversedFace = null;
            } else {
              edge.forwardFace = null;
            }
          });
        });
      }
    });

    deadEdges.forEach((deadEdge) => {
      // TODO: have a better way of doing this?
      arrayRemove(this.edges, deadEdge);
      arrayRemove(this.halfEdges, deadEdge.forwardHalf);
      arrayRemove(this.halfEdges, deadEdge.reversedHalf);
    });

    deadVertices.forEach((deadVertex) => {
      arrayRemove(this.vertices, deadVertex);
    });

    deadFaces.forEach((deadFace) => {
      arrayRemove(this.faces, deadFace);
    });

    this.vertices.forEach((vertex) => {
      vertex.edges = vertex.edges.filter((edge) => !deadEdges.has(edge));
      vertex.incomingHalfEdges = vertex.incomingHalfEdges.filter((halfEdge) => !deadEdges.has(halfEdge.edge));
      vertex.outgoingHalfEdges = vertex.outgoingHalfEdges.filter((halfEdge) => !deadEdges.has(halfEdge.edge));
      vertex.faces = vertex.incomingHalfEdges
        .map((halfEdge) => halfEdge.face)
        .filter((face) => face !== null) as LayoutFace[];

      // fix up next/previous (easier to wait for here)
      for (let i = 0; i < vertex.incomingHalfEdges.length; i++) {
        // const firstIncomingHalfEdge = vertex.incomingHalfEdges[ i ];
        const firstOutgoingHalfEdge = vertex.outgoingHalfEdges[i];

        const secondIncomingHalfEdge = vertex.incomingHalfEdges[(i + 1) % vertex.incomingHalfEdges.length];
        // const secondOutgoingHalfEdge = vertex.outgoingHalfEdges[ ( i + 1 ) % vertex.incomingHalfEdges.length ];

        secondIncomingHalfEdge.next = firstOutgoingHalfEdge;
        firstOutgoingHalfEdge.previous = secondIncomingHalfEdge;
      }
    });

    assertEnabled() && validateBoard(this);

    // TODO: validate, but give it an option to ignore the boundary bits
    // TODO: validate existence in our arrays too
  }

  public removeSimpleForced(): void {
    // changing during iteration
    this.vertices.slice().forEach((vertex) => {
      // Only 2 edges
      if (vertex.edges.length !== 2) {
        return;
      }

      // Only null-ish faces
      const faces = _.uniq(vertex.edges.flatMap((edge) => edge.faces));
      if (faces.some((face) => this.getFaceValue(face) !== null)) {
        return;
      }

      const firstEdge = vertex.edges[0];
      const secondEdge = vertex.edges[1];

      const edgeStateA = this.getEdgeState(firstEdge);
      const edgeStateB = this.getEdgeState(secondEdge);

      // Same edge state
      if (edgeStateA !== edgeStateB) {
        return;
      }

      const startVertex = firstEdge.getOtherVertex(vertex);
      const endVertex = secondEdge.getOtherVertex(vertex);

      // Different vertices (not a triangle)
      if (startVertex === endVertex) {
        return;
      }

      // "forward" and "reversed" in our new ordering (from startVertex to vertex to endVertex)
      const firstForwardHalf = firstEdge.forwardHalf.end === vertex ? firstEdge.forwardHalf : firstEdge.reversedHalf;
      const firstReversedHalf = firstEdge.forwardHalf.end === vertex ? firstEdge.reversedHalf : firstEdge.forwardHalf;
      const secondForwardHalf =
        secondEdge.forwardHalf.start === vertex ? secondEdge.forwardHalf : secondEdge.reversedHalf;
      const secondReversedHalf =
        secondEdge.forwardHalf.start === vertex ? secondEdge.reversedHalf : secondEdge.forwardHalf;

      const forwardFace = firstForwardHalf.face;
      const reversedFace = firstReversedHalf.face;

      // TODO: preserve originalEdges(!)

      const newEdge = new LayoutEdge(startVertex, endVertex);
      firstEdge.originalEdges.forEach((edge) => newEdge.originalEdges.add(edge));
      secondEdge.originalEdges.forEach((edge) => newEdge.originalEdges.add(edge));
      this.edgeStateMap.set(newEdge, edgeStateA);
      this.edges.push(newEdge);

      const newForwardHalfEdge = new LayoutHalfEdge(startVertex, endVertex, false);
      this.halfEdges.push(newForwardHalfEdge);

      const newReversedHalfEdge = new LayoutHalfEdge(endVertex, startVertex, true);
      this.halfEdges.push(newReversedHalfEdge);

      // TODO: factor out the code to replace this two-edge vertex with a single edge (we'll use it elsewhere)
      // TODO: e.g. when we replace simple cases with faces(!)

      newEdge.forwardHalf = newForwardHalfEdge;
      newEdge.reversedHalf = newReversedHalfEdge;
      newEdge.forwardFace = forwardFace;
      newEdge.reversedFace = reversedFace;
      newEdge.vertices = [startVertex, endVertex];
      newEdge.faces = [forwardFace, reversedFace].filter((face) => face !== null) as LayoutFace[];

      newForwardHalfEdge.edge = newEdge;
      newForwardHalfEdge.reversed = newReversedHalfEdge;
      newForwardHalfEdge.next = secondForwardHalf.next;
      newForwardHalfEdge.previous = firstForwardHalf.previous;
      newForwardHalfEdge.face = forwardFace;

      newReversedHalfEdge.edge = newEdge;
      newReversedHalfEdge.reversed = newForwardHalfEdge;
      newReversedHalfEdge.next = firstReversedHalf.next;
      newReversedHalfEdge.previous = secondReversedHalf.previous;
      newReversedHalfEdge.face = reversedFace;

      if (forwardFace) {
        const halfIndex = forwardFace.halfEdges.indexOf(firstForwardHalf);
        const index = forwardFace.edges.indexOf(firstEdge);

        assertEnabled() && assert(halfIndex !== -1);
        assertEnabled() && assert(index !== -1);

        forwardFace.halfEdges[halfIndex] = newForwardHalfEdge;
        arrayRemove(forwardFace.halfEdges, secondForwardHalf);

        forwardFace.edges[index] = newEdge;
        arrayRemove(forwardFace.edges, secondEdge);

        arrayRemove(forwardFace.vertices, vertex);
      }

      if (reversedFace) {
        const halfIndex = reversedFace.halfEdges.indexOf(secondReversedHalf);
        const index = reversedFace.edges.indexOf(secondEdge);

        assertEnabled() && assert(halfIndex !== -1);
        assertEnabled() && assert(index !== -1);

        reversedFace.halfEdges[halfIndex] = newReversedHalfEdge;
        arrayRemove(reversedFace.halfEdges, firstReversedHalf);

        reversedFace.edges[index] = newEdge;
        arrayRemove(reversedFace.edges, firstEdge);

        arrayRemove(reversedFace.vertices, vertex);
      }

      // startVertex
      {
        const incomingIndex = startVertex.incomingHalfEdges.indexOf(firstReversedHalf);
        const outgoingIndex = startVertex.outgoingHalfEdges.indexOf(firstForwardHalf);
        const edgeIndex = startVertex.edges.indexOf(firstEdge);

        assertEnabled() && assert(incomingIndex !== -1);
        assertEnabled() && assert(outgoingIndex !== -1);
        assertEnabled() && assert(edgeIndex !== -1);

        startVertex.incomingHalfEdges[incomingIndex] = newReversedHalfEdge;
        startVertex.outgoingHalfEdges[outgoingIndex] = newForwardHalfEdge;
        startVertex.edges[edgeIndex] = newEdge;
      }

      // endVertex
      {
        const incomingIndex = endVertex.incomingHalfEdges.indexOf(secondForwardHalf);
        const outgoingIndex = endVertex.outgoingHalfEdges.indexOf(secondReversedHalf);
        const edgeIndex = endVertex.edges.indexOf(secondEdge);

        assertEnabled() && assert(incomingIndex !== -1);
        assertEnabled() && assert(outgoingIndex !== -1);
        assertEnabled() && assert(edgeIndex !== -1);

        endVertex.incomingHalfEdges[incomingIndex] = newForwardHalfEdge;
        endVertex.outgoingHalfEdges[outgoingIndex] = newReversedHalfEdge;
        endVertex.edges[edgeIndex] = newEdge;
      }

      newForwardHalfEdge.previous.next = newForwardHalfEdge;
      newForwardHalfEdge.next.previous = newForwardHalfEdge;
      newReversedHalfEdge.previous.next = newReversedHalfEdge;
      newReversedHalfEdge.next.previous = newReversedHalfEdge;

      arrayRemove(this.edges, firstEdge);
      arrayRemove(this.edges, secondEdge);
      arrayRemove(this.halfEdges, firstEdge.forwardHalf);
      arrayRemove(this.halfEdges, firstEdge.reversedHalf);
      arrayRemove(this.halfEdges, secondEdge.forwardHalf);
      arrayRemove(this.halfEdges, secondEdge.reversedHalf);
      arrayRemove(this.vertices, vertex);
    });

    assertEnabled() && validateBoard(this);
  }

  public simplify(): void {
    // TODO: show how things progress(!)
    // console.log( 'simplify' );
    this.clearSatisfiedFaces();
    this.removeDeadRedEdges();
    this.removeSimpleForced();
  }

  public fixOuterBoundary(): void {
    const boundaryHalfEdges = new Set(this.halfEdges.filter((halfEdge) => halfEdge.face === null));
    const outerBoundaries: LayoutHalfEdge[][] = [];
    const innerBoundaries: LayoutHalfEdge[][] = [];

    while (boundaryHalfEdges.size) {
      const firstHalfEdge = boundaryHalfEdges.values().next().value;
      boundaryHalfEdges.delete(firstHalfEdge);

      const boundary: LayoutHalfEdge[] = [firstHalfEdge];
      let next = firstHalfEdge.next;

      while (next !== firstHalfEdge) {
        boundary.push(next);
        boundaryHalfEdges.delete(next);
        next = next.next;
      }

      if (getSignedArea(boundary.map((halfEdge) => halfEdge.start.viewCoordinates)) < 0) {
        outerBoundaries.push(boundary);
      } else {
        innerBoundaries.push(boundary);
      }
    }

    assertEnabled() && assert(outerBoundaries.length === 1);

    this.outerBoundary.length = 0;
    this.outerBoundary.push(...outerBoundaries[0]);

    this.innerBoundaries.length = 0;
    this.innerBoundaries.push(...innerBoundaries);
  }

  public getCompleteState(): TState<TCompleteData> {
    this.fixOuterBoundary();

    const state = CompleteData.fromFacesEdges(
      this,
      (face) => this.getFaceValue(face as LayoutFace),
      (edge) => this.getEdgeState(edge as LayoutEdge),
    );

    // Clean up state for viewing
    safeSolve(this, state);

    return state;
  }

  public getCompletePuzzle(): TPuzzle<LayoutStructure, TCompleteData> {
    return {
      board: this,
      state: this.getCompleteState(),
    };
  }

  // TODO: getCompleteState / getPuzzle / etc.

  public getSignedArea(): number {
    let area = 0;
    this.faces.forEach((face) => {
      area += getSignedArea(face.vertices.map((vertex) => vertex.viewCoordinates));
    });
    return area;
  }

  public getCentroid(): Vector2 {
    // Optimized here, since we can find the external half edges

    let area = 0;
    let centroidX = 0;
    let centroidY = 0;

    this.halfEdges.forEach((halfEdge) => {
      if (halfEdge.face === null) {
        // Reversal for correct sign
        const p0 = halfEdge.end.viewCoordinates;
        const p1 = halfEdge.start.viewCoordinates;

        // Shoelace formula for the area
        area += (p1.x + p0.x) * (p1.y - p0.y);

        // Partial centroid evaluation. NOTE: using the compound version here, for performance/stability tradeoffs
        const base = p0.x * (2 * p0.y + p1.y) + p1.x * (p0.y + 2 * p1.y);
        centroidX += (p0.x - p1.x) * base;
        centroidY += (p1.y - p0.y) * base;
      }
    });

    area *= 0.5;

    return new Vector2(centroidX, centroidY).timesScalar(1 / (6 * area));
  }

  public applyDerivative(derivative: LayoutDerivative): void {
    this.vertices.forEach((vertex) => {
      const delta = derivative.derivatives.get(vertex)!;

      // TODO: consider "partials" in the future?
      assertEnabled() && assert(delta);

      assertEnabled() && assert(delta.isFinite());

      vertex.viewCoordinates.add(delta);
    });

    this.fixFaceCoordinates();
  }

  public fixFaceCoordinates(): void {
    this.faces.forEach((face) => {
      face.viewCoordinates.set(getCentroid(face.halfEdges.map((halfEdge) => halfEdge.start.viewCoordinates)));
    });
  }

  public getDebugNode(): Node {
    // TODO: if we are still a planar-embedding, use a PuzzleNode?
    const debugNode = new Node();

    const showBackgrounds = false;
    const showRedEdges = false; // TODO: useful for debugging
    const showVertices = false; // TODO: useful for debugging

    this.edges.forEach((edge) => {
      const start = edge.start.viewCoordinates;
      const end = edge.end.viewCoordinates;

      let stroke: TColor;
      let lineWidth: number;
      const edgeState = this.edgeStateMap.get(edge);
      if (edgeState === EdgeState.WHITE) {
        stroke = currentTheme.blackLineColorProperty;
        lineWidth = 0.02;
      } else if (edgeState === EdgeState.BLACK) {
        stroke = okhslToRGBString(Math.random() * 360, 0.7, 0.55);
        lineWidth = 0.1;
      } else {
        stroke = showRedEdges ? 'red' : null;
        lineWidth = 0.02;
      }

      debugNode.addChild(
        new Line(start, end, {
          stroke: stroke,
          lineWidth: lineWidth,
          lineCap: 'round',
        }),
      );
    });

    if (showBackgrounds) {
      this.faces.forEach((face) => {
        const backgroundColor = new Color(okhslToRGBString(Math.random() * 360, 0.7, 0.6)).withAlpha(0.5);
        debugNode.addChild(
          new Path(Shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates)), {
            fill: backgroundColor,
          }),
        );
      });
    }

    if (showVertices) {
      this.vertices.forEach((vertex) => {
        debugNode.addChild(
          new Circle(0.1, {
            x: vertex.viewCoordinates.x,
            y: vertex.viewCoordinates.y,
            fill: currentTheme.blackLineColorProperty,
          }),
        );
      });
    }

    this.faces.forEach((face) => {
      const faceValue = this.faceValueMap.get(face) ?? null;

      if (faceValue !== null) {
        debugNode.addChild(
          new Text(faceValue, {
            maxWidth: 0.9,
            maxHeight: 0.9,
            center: face.viewCoordinates,
            fill: currentTheme.faceValueColorProperty,
          }),
        );
      }
    });

    return debugNode;
  }
}
