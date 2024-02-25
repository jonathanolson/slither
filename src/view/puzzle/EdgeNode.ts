import { TEdge } from '../../model/board/core/TEdge.ts';
import { FireListener, Line, Node, Path } from 'phet-lib/scenery';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { blackLineColorProperty, whiteLineColorProperty, xColorProperty } from '../Theme.ts';
import { Shape } from 'phet-lib/kite';
import EdgeState from '../../model/data/edge/EdgeState.ts';
import { TEdgeData } from '../../model/data/edge/TEdgeData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { DotUtils, Vector2 } from 'phet-lib/dot';

// TODO: better options pattern!
export type EdgeNodeOptions = {
  useSimpleRegionForBlack?: boolean;
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
  backgroundOffsetDistance: number;
  redXsVisibleProperty: TReadOnlyProperty<boolean>;
  whiteDottedVisibleProperty: TReadOnlyProperty<boolean>;
};

export class EdgeNode extends Node {

  public constructor(
    public readonly edge: TEdge,
    stateProperty: TReadOnlyProperty<TState<TEdgeData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    options: EdgeNodeOptions
  ) {
    super( {} );

    const edgeStateProperty = new DerivedProperty( [ stateProperty ], state => state.getEdgeState( edge ) );
    this.disposeEmitter.addListener( () => edgeStateProperty.dispose() );

    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const centerPoint = startPoint.average( endPoint );

    const blackLine = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: blackLineColorProperty,
      lineCap: 'square' // TODO: still not ideal, the overlap shows up and is unpleasant. We'll either need to use Alpenglow, or use a different approach to drawing the lines.
    } );

    // TODO: We will want to display the actual CHAIN instead of just the link?

    const halfSize = 0.07;
    const xShape = new Shape()
      .moveTo( -halfSize, -halfSize )
      .lineTo( halfSize, halfSize )
      .moveTo( -halfSize, halfSize )
      .lineTo( halfSize, -halfSize );

    const xVisibleProperty = new DerivedProperty( [
      isSolvedProperty,
      options.redXsVisibleProperty
    ], ( isSolved, visible ) => {
      return !isSolved && visible;
    } );
    this.disposeEmitter.addListener( () => xVisibleProperty.dispose() );

    const x = new Path( xShape, {
      stroke: xColorProperty,
      lineWidth: 0.02,
      center: centerPoint,
      visibleProperty: xVisibleProperty
    } );

    const whiteLineVisibleProperty = new DerivedProperty( [
      isSolvedProperty,
      options.whiteDottedVisibleProperty
    ], ( isSolved, visible ) => {
      return !isSolved && visible;
    } );
    this.disposeEmitter.addListener( () => whiteLineVisibleProperty.dispose() );

    const whiteLine = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.03,
      stroke: whiteLineColorProperty,
      // lineDash: [ 0.05, 0.05 ],
      visibleProperty: whiteLineVisibleProperty
    } );

    // TODO: ALLOW DRAGGING TO SET LINES
    const edgePressListener = options?.edgePressListener;
    if ( edgePressListener ) {
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
          // edge.faces[ 1 ].viewCoordinates
        ] );
      }

      //
      // const pointerArea = new Shape()
      //   .moveTo( centerPoint.x - 0.5, centerPoint.y )
      //   .lineTo( centerPoint.x, centerPoint.y - 0.5 )
      //   .lineTo( centerPoint.x + 0.5, centerPoint.y )
      //   .lineTo( centerPoint.x, centerPoint.y + 0.5 )
      //   .close();
      this.mouseArea = this.touchArea = pointerArea;

      // TODO: config setting for shift-click reversal?
      this.addInputListener( new FireListener( {
        mouseButton: 0,
        // @ts-expect-error
        fire: event => edgePressListener( edge, event.domEvent?.shiftKey ? 2 : 0 )
      } ) );
      this.addInputListener( new FireListener( {
        mouseButton: 1,
        fire: event => edgePressListener( edge, 1 )
      } ) );
      this.addInputListener( new FireListener( {
        mouseButton: 2,
        // @ts-expect-error
        fire: event => edgePressListener( edge, event.domEvent?.shiftKey ? 0 : 2 )
      } ) );
      this.cursor = 'pointer';
    }

    edgeStateProperty.link( edgeState => {
      if ( edgeState === EdgeState.WHITE ) {
        this.children = [ whiteLine ];
      }
      else if ( edgeState === EdgeState.BLACK ) {
        this.children = options?.useSimpleRegionForBlack ? [] : [ blackLine ];
      }
      else {
        this.children = [ x ];
      }
    } );
  }
}