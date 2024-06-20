import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TVertex } from '../board/core/TVertex.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import LineDragState from './LineDragState.ts';

import { TinyProperty } from 'phet-lib/axon';
import { Vector2 } from 'phet-lib/dot';

export class LineDrag {
  public firstEdge!: TEdge;
  public readonly edgeStack: TEdge[] = [];
  public readonly vertexStack: TVertex[] = [];

  public readonly paintEdgeSet: Set<TEdge> = new Set();
  public paintEdgeState: EdgeState = EdgeState.WHITE;

  public readonly lineDragStateProperty = new TinyProperty(LineDragState.NONE);

  public dragIndex = 0;

  public constructor(public readonly board: TBoard) {}

  public onLineDragStart(edge: TEdge): void {
    this.firstEdge = edge;

    this.lineDragStateProperty.value = LineDragState.LINE_DRAG;

    this.edgeStack.length = 0;
    this.edgeStack.push(edge);

    this.vertexStack.length = 0;

    // TODO: better setup here
    this.dragIndex = Math.ceil(Math.random() * 1e10);
  }

  public onPaintDragStart(edge: TEdge, edgeState: EdgeState): void {
    this.firstEdge = edge;

    this.lineDragStateProperty.value = LineDragState.EDGE_PAINT;

    this.paintEdgeSet.clear();
    this.paintEdgeSet.add(edge);

    this.paintEdgeState = edgeState;

    this.dragIndex = Math.ceil(Math.random() * 1e10);
  }

  // Returns whether it changed
  public onDrag(edge: TEdge, point: Vector2): boolean {
    if (this.lineDragStateProperty.value === LineDragState.LINE_DRAG) {
      const lastEdge = this.edgeStack[this.edgeStack.length - 1];
      const nextToLastEdge = this.edgeStack.length > 1 ? this.edgeStack[this.edgeStack.length - 2] : null;

      if (edge === lastEdge) {
        // no-op, since we're already on the last edge
        return false;
      } else if (edge === nextToLastEdge) {
        // we are "walking back" to the previous edge
        this.edgeStack.pop();
        this.vertexStack.pop();
        return true;
      } else if (this.edgeStack.includes(edge)) {
        // we will ignore attempts to walk over an edge we've already visited
        return false;
      } else {
        if (this.vertexStack.length === 0) {
          // Our initial first drag away, we need to determine the vertex
          const sharedVertex = lastEdge.vertices.find((vertex) => edge.vertices.includes(vertex)) ?? null;

          if (sharedVertex) {
            // Normal start!
            this.edgeStack.push(edge);
            this.vertexStack.push(sharedVertex);
            return true;
          } else {
            // We must have... skipped somewhere. Ignore (unfortunately)
            return false;
          }
        } else {
          const lastVertex = this.vertexStack[this.vertexStack.length - 1];

          if (edge.vertices.includes(lastVertex)) {
            // NOTE: Here we are explicitly allowing the user to make a loop (in case they solve the puzzle fully with this)
            this.edgeStack.pop();
            this.edgeStack.push(edge);
            return true;
          } else {
            const nextVertex = lastEdge.getOtherVertex(lastVertex);
            if (edge.vertices.includes(nextVertex)) {
              this.edgeStack.push(edge);
              this.vertexStack.push(nextVertex);
              return true;
            } else {
              // We must have... skipped somewhere. Ignore (unfortunately)
              return false;
            }
          }
        }
      }
    } else if (this.lineDragStateProperty.value === LineDragState.EDGE_PAINT) {
      const mainDistance = edge.start.viewCoordinates.distance(edge.end.viewCoordinates);
      const vertexDistance = Math.min(...edge.vertices.map((vertex) => vertex.viewCoordinates.distance(point)));
      const faceDistance = Math.min(...edge.faces.map((face) => face.viewCoordinates.distance(point)));

      if (Math.min(vertexDistance, faceDistance) / mainDistance < 0.3) {
        return false;
      }

      if (!this.paintEdgeSet.has(edge)) {
        this.paintEdgeSet.add(edge);
        return true;
      }
    }

    return false;
  }

  public onDragEnd(): void {
    this.lineDragStateProperty.value = LineDragState.NONE;
  }
}
