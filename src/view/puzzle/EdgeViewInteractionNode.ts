import { isDragModeProperty } from '../PanDragMode.ts';
import { ShapeInteractionNode } from './ShapeInteractionNode.ts';

import { TEmitter } from 'phet-lib/axon';
import { DotUtils, Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TEdge } from '../../model/board/core/TEdge.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

// TODO: better options pattern!
export type EdgeViewInteractionNodeOptions = {
  edgePressListener: (edge: TEdge, button: 0 | 1 | 2) => void;
  backgroundOffsetDistance: number;

  onEdgeDragStart?: (edge: TEdge, button: 0 | 2) => void;
  onEdgeDrag?: (edge: TEdge, point: Vector2) => void;
  onEdgeDragEnd?: () => void;
};

export class EdgeViewInteractionNode extends ShapeInteractionNode<TEdge> {
  public constructor(
    board: TBoard,
    delayEdgeInteractionEmitter: TEmitter<[TEdge]>,
    options: EdgeViewInteractionNodeOptions,
  ) {
    super(
      board.edges,
      (edge) => {
        const startPoint = edge.start.viewCoordinates;
        const endPoint = edge.end.viewCoordinates;

        // TODO: ALLOW DRAGGING TO SET LINES
        const pointerAreaShape = new Shape();

        let vertices: Vector2[];
        if (edge.faces.length === 2) {
          vertices = [startPoint, edge.faces[0].viewCoordinates, endPoint, edge.faces[1].viewCoordinates];
        } else {
          assertEnabled() && assert(edge.faces.length === 1, 'EdgeNode only supports edges with 1 or 2 faces');

          const outsideHalf = edge.forwardHalf.face === null ? edge.forwardHalf : edge.reversedHalf;
          assertEnabled() && assert(outsideHalf.previous.face === null);
          assertEnabled() && assert(outsideHalf.next.face === null);
          const halfStartPoint = outsideHalf.start.viewCoordinates;
          const halfEndPoint = outsideHalf.end.viewCoordinates;
          const beforeStartPoint = outsideHalf.previous.start.viewCoordinates;
          const afterEndPoint = outsideHalf.next.end.viewCoordinates;

          const getThreePointDirection = (a: Vector2, b: Vector2, c: Vector2): Vector2 => {
            const ab = b.minus(a).normalized();
            const bc = c.minus(b).normalized();

            let diff = ab.minus(bc);

            if (diff.getMagnitude() < 1e-6) {
              diff = ab.getPerpendicular();
            } else {
              diff = diff.normalized();
            }

            if (DotUtils.triangleAreaSigned(a, b, b.plus(diff)) < 0) {
              diff = diff.negated();
            }

            return diff;
          };

          const startDirection = getThreePointDirection(beforeStartPoint, halfStartPoint, halfEndPoint);
          const endDirection = getThreePointDirection(halfStartPoint, halfEndPoint, afterEndPoint);

          vertices = [
            halfStartPoint,
            edge.faces[0].viewCoordinates,
            halfEndPoint,
            halfEndPoint.plus(endDirection.times(options.backgroundOffsetDistance)),
            halfStartPoint.plus(startDirection.times(options.backgroundOffsetDistance)),
          ];
        }

        pointerAreaShape.polygon(vertices);
        pointerAreaShape.makeImmutable();

        return pointerAreaShape;
      },
      options.edgePressListener,
      {
        delayInteractionEmitter: delayEdgeInteractionEmitter,
        isDragModeProperty: isDragModeProperty,
        onDragStart: options.onEdgeDragStart,
        onDrag: options.onEdgeDrag,
        onDragEnd: options.onEdgeDragEnd,
      },
    );
  }
}
