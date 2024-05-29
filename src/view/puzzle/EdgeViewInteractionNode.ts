import { TEdge } from '../../model/board/core/TEdge.ts';
import { FireListener, Node, SceneryEvent } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { DotUtils, Vector2 } from 'phet-lib/dot';
import { TBoard } from '../../model/board/core/TBoard.ts';

// TODO: better options pattern!
export type EdgeViewInteractionNodeOptions = {
  edgePressListener: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
  backgroundOffsetDistance: number;
};

export class EdgeViewInteractionNode extends Node {

  public constructor(
    board: TBoard,
    options: EdgeViewInteractionNodeOptions
  ) {
    super();

    // TODO: CAG this, or get the "background" shape from the outside boundary of the board and expand it (for cheap)
    const mainShape = new Shape();

    const edgeShapes = board.edges.map( edge => {
      const startPoint = edge.start.viewCoordinates;
      const endPoint = edge.end.viewCoordinates;

      // TODO: ALLOW DRAGGING TO SET LINES
      const pointerAreaShape = new Shape();

      let vertices: Vector2[];
      if ( edge.faces.length === 2 ) {
        vertices = [
          startPoint,
          edge.faces[ 0 ].viewCoordinates,
          endPoint,
          edge.faces[ 1 ].viewCoordinates
        ];
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

        vertices = [
          halfStartPoint,
          edge.faces[ 0 ].viewCoordinates,
          halfEndPoint,
          halfEndPoint.plus( endDirection.times( options.backgroundOffsetDistance ) ),
          halfStartPoint.plus( startDirection.times( options.backgroundOffsetDistance ) )
        ];
      }

      pointerAreaShape.polygon( vertices );
      mainShape.polygon( vertices );

      pointerAreaShape.makeImmutable();

      return pointerAreaShape;
    } );


    this.mouseArea = this.touchArea = mainShape;

    // TODO: set up listeners in a better way?

    const getEdgeFromEvent = ( event: SceneryEvent ): TEdge | null => {
      const point = event.trail.globalToLocalPoint( event.pointer.point );

      for ( let i = 0; i < edgeShapes.length; i++ ) {
        const shape = edgeShapes[ i ];

        if ( shape.bounds.containsPoint( point ) && shape.containsPoint( point ) ) {
          return board.edges[ i ];
        }
      }

      return null;
    };

    const onPress = ( event: SceneryEvent, button: 0 | 1 | 2 ) => {
      const edge = getEdgeFromEvent( event );
      if ( edge ) {
        options.edgePressListener( edge, button );
      }
    };

    // TODO: config setting for shift-click reversal?
    const primaryFireListener = new FireListener( {
      mouseButton: 0,
      // @ts-expect-error
      fire: event => onPress( event, event.domEvent?.shiftKey ? 2 : 0 )
    } );

    const secondaryFireListener = new FireListener( {
      mouseButton: 2,
      // @ts-expect-error
      fire: event => onPress( event, event.domEvent?.shiftKey ? 0 : 2 )
    } );

    const tertiaryFireListener = new FireListener( {
      mouseButton: 1,
      fire: event => onPress( event, 1 )
    } );

    this.addInputListener( primaryFireListener );
    this.addInputListener( secondaryFireListener );
    this.addInputListener( tertiaryFireListener );
    this.cursor = 'pointer';

    this.disposeEmitter.addListener( () => {
      primaryFireListener.dispose();
      secondaryFireListener.dispose();
      tertiaryFireListener.dispose();
    } );
  }
}