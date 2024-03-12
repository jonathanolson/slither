import { Circle, Node, Path } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { vertexStateVisibleProperty } from '../Theme.ts';
import { Shape } from 'phet-lib/kite';
import { TVertexData } from '../../model/data/vertex/TVertexData.ts';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { ConvexHull2, Vector2 } from 'phet-lib/dot';

export class VertexStateNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<TVertexData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>
  ) {
    super();

    const container = new Node();
    this.addChild( container );

    const mainPointDistance = 0.1;
    const relativeVertexDirections = vertex.edges.map( edge => edge.getOtherVertex( vertex ).viewCoordinates.minus( vertex.viewCoordinates ).normalized() );
    const mainPoints = relativeVertexDirections.map( direction => direction.times( mainPointDistance ) );

    const mainShape = Shape.polygon( ConvexHull2.grahamScan( [
      Vector2.ZERO,
      ...mainPoints
    ], false ) );
    const backgroundShape = mainShape.getOffsetShape( -0.05 );

    const statePath = new Path( null, {
      stroke: 'red',
      lineWidth: 0.01
    } );

    // TODO: lazily create this?
    const mainPath = new Path( backgroundShape, {
      translation: vertex.viewCoordinates,

      // TODO: themify
      fill: 'white',
      stroke: 'black',
      lineWidth: 0.01,
      opacity: 0.4, // TODO?

      children: [
        statePath,
        ...mainPoints.map( point => new Circle( {
          radius: 0.02,
          translation: point,

          fill: 'black'
        } ) )
      ],

      visibleProperty: vertexStateVisibleProperty
    } );
    this.addChild( mainPath );

    const multilink = Multilink.multilink( [
      stateProperty,
      vertexStateVisibleProperty
    ], ( state, isVertexStateVisible ) => {
      if ( !isVertexStateVisible ) {
        container.children = [];
        return;
      }

      const vertexState = state.getVertexState( vertex );

      // TODO: better performance for changing
      const shape = new Shape();
      for ( const pair of vertexState.getAllowedPairs() ) {
        const getPoint = ( edge: TEdge ) => edge.getOtherVertex( vertex ).viewCoordinates.minus( vertex.viewCoordinates ).normalized().times( mainPointDistance );
        shape.moveToPoint( getPoint( pair[ 0 ] ) );
        shape.lineToPoint( getPoint( pair[ 1 ] ) );
      }
      if ( vertexState.allowsEmpty() ) {
        const emptyRadius = 0.03;
        shape.moveTo( emptyRadius, 0 );
        shape.circle( Vector2.ZERO, emptyRadius );
        shape.close();
      }
      shape.makeImmutable();
      statePath.shape = shape;

      container.children = [
        mainPath
      ];
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );

    // Apply effects when solved
    const isSolvedListener = ( isSolved: boolean ) => {
      this.visible = !isSolved;
    };
    isSolvedProperty.link( isSolvedListener );
    this.disposeEmitter.addListener( () => isSolvedProperty.unlink( isSolvedListener ) );
  }
}