import { TEdge } from '../../model/board/core/TEdge.ts';
import { Node } from 'phet-lib/scenery';
import { TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { Shape } from 'phet-lib/kite';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { DotUtils, Vector2 } from 'phet-lib/dot';
import { hookPuzzleListeners } from './hookPuzzleListeners.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

// TODO: better options pattern!
export type EdgeNodeOptions = {
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
  edgeHoverListener?: ( edge: TEdge, isOver: boolean ) => void;
  backgroundOffsetDistance: number;
  noninteractive?: boolean;
};

export class EdgeNode extends Node {

  public constructor(
    public readonly edge: TEdge,
    stateProperty: TReadOnlyProperty<TState<TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    style: TPuzzleStyle,
    options: EdgeNodeOptions
  ) {
    super( {} );

    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;

    // TODO: ALLOW DRAGGING TO SET LINES
    const edgePressListener = options?.edgePressListener;
    if ( !options.noninteractive && edgePressListener ) {
      const pointerArea = new Shape();

      if ( edge.faces.length === 2 ) {
        pointerArea.polygon( [
          startPoint,
          edge.faces[ 0 ].viewCoordinates,
          endPoint,
          edge.faces[ 1 ].viewCoordinates
        ] );
      }
      else {
        assertEnabled() && assert( edge.faces.length === 1, 'EdgeNode only supports edges with 1 or 2 faces' );

        const outsideHalf = edge.forwardHalf.face === null ? edge.forwardHalf : edge.reversedHalf;
        assertEnabled() && assert( outsideHalf.previous.face === null );
        assertEnabled() && assert( outsideHalf.next.face === null );
        const halfStartPoint = outsideHalf.start.viewCoordinates;
        const halfEndPoint = outsideHalf.end.viewCoordinates;
        const beforeStartPoint = outsideHalf.previous.start.viewCoordinates;
        const afterEndPoint = outsideHalf.next.end.viewCoordinates;

        const getThreePointDirection = ( a: Vector2, b: Vector2, c: Vector2 ): Vector2 => {
          const ab = b.minus( a ).normalized();
          const bc = c.minus( b ).normalized();

          let diff = ab.minus( bc );

          if ( diff.getMagnitude() < 1e-6 ) {
            diff = ab.getPerpendicular();
          }
          else {
            diff = diff.normalized();
          }

          if ( DotUtils.triangleAreaSigned( a, b, b.plus( diff ) ) < 0 ) {
            diff = diff.negated();
          }

          return diff;
        };

        const startDirection = getThreePointDirection( beforeStartPoint, halfStartPoint, halfEndPoint );
        const endDirection = getThreePointDirection( halfStartPoint, halfEndPoint, afterEndPoint );

        pointerArea.polygon( [
          halfStartPoint,
          edge.faces[ 0 ].viewCoordinates,
          halfEndPoint,
          halfEndPoint.plus( endDirection.times( options.backgroundOffsetDistance ) ),
          halfStartPoint.plus( startDirection.times( options.backgroundOffsetDistance ) )
        ] );
      }

      this.mouseArea = this.touchArea = pointerArea;

      !options.noninteractive && hookPuzzleListeners( edge, this, edgePressListener, options.edgeHoverListener );
    }
  }
}