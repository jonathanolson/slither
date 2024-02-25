import { TEdge } from '../../model/board/core/TEdge.ts';
import { FireListener, Line, Node, Path } from 'phet-lib/scenery';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { lineColorProperty, xColorProperty } from '../Theme.ts';
import { Shape } from 'phet-lib/kite';
import EdgeState from '../../model/data/edge/EdgeState.ts';
import { BasicPuzzleNodeData } from './PuzzleNode.ts';

// TODO: better options pattern!
export type EdgeNodeOptions = {
  useSimpleRegionForBlack?: boolean;
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
};

export class EdgeNode extends Node {

  public constructor(
    public readonly edge: TEdge,
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    options?: EdgeNodeOptions
  ) {
    super( {} );

    const edgeStateProperty = new DerivedProperty( [ stateProperty ], state => state.getEdgeState( edge ) );

    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const centerPoint = startPoint.average( endPoint );

    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: lineColorProperty,
      lineCap: 'square' // TODO: still not ideal, the overlap shows up and is unpleasant. We'll either need to use Alpenglow, or use a different approach to drawing the lines.
    } );

    // TODO: We will want to display the actual CHAIN instead of just the link?

    const halfSize = 0.07;
    const xShape = new Shape()
      .moveTo( -halfSize, -halfSize )
      .lineTo( halfSize, halfSize )
      .moveTo( -halfSize, halfSize )
      .lineTo( halfSize, -halfSize );
    const x = new Path( xShape, {
      stroke: xColorProperty,
      lineWidth: 0.02,
      center: centerPoint
    } );

    // Apply effects when solved
    isSolvedProperty.link( isSolved => {
      x.visible = !isSolved;
    } );

    // TODO: ALLOW DRAGGING TO SET LINES
    const edgePressListener = options?.edgePressListener;
    if ( edgePressListener ) {
      const pointerArea = new Shape()
        .moveTo( centerPoint.x - 0.5, centerPoint.y )
        .lineTo( centerPoint.x, centerPoint.y - 0.5 )
        .lineTo( centerPoint.x + 0.5, centerPoint.y )
        .lineTo( centerPoint.x, centerPoint.y + 0.5 )
        .close();
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
        this.children = [];
      }
      else if ( edgeState === EdgeState.BLACK ) {
        this.children = options?.useSimpleRegionForBlack ? [] : [ line ];
      }
      else {
        this.children = [ x ];
      }
    } );
  }
}