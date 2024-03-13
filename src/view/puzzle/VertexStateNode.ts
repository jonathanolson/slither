import { Circle, Node, Path } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { allVertexStateVisibleProperty, vertexStateBackgroundProperty, vertexStateLineProperty, vertexStateOutlineProperty, vertexStatePointProperty, vertexStateVisibleProperty } from '../Theme.ts';
import { Shape } from 'phet-lib/kite';
import { TVertexStateData } from '../../model/data/vertex-state/TVertexStateData.ts';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { ConvexHull2, Vector2 } from 'phet-lib/dot';
import { VertexState } from '../../model/data/vertex-state/VertexState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';

export class VertexStateNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<TVertexStateData & TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>
  ) {
    super();

    const mainPointDistance = 0.12;
    const relativeVertexDirections = vertex.edges.map( edge => edge.getOtherVertex( vertex ).viewCoordinates.minus( vertex.viewCoordinates ).normalized() );
    const mainPoints = relativeVertexDirections.map( direction => direction.times( mainPointDistance ) );

    const mainShape = Shape.polygon( ConvexHull2.grahamScan( [
      Vector2.ZERO,
      ...mainPoints
    ], false ) );
    const backgroundShape = mainShape.getOffsetShape( -0.05 );

    const statePath = new Path( null, {
      stroke: vertexStateLineProperty,
      lineWidth: 0.01
    } );

    // TODO: lazily create this?
    const mainPath = new Path( backgroundShape, {
      translation: vertex.viewCoordinates,

      fill: vertexStateBackgroundProperty,
      stroke: vertexStateOutlineProperty,
      lineWidth: 0.01,

      children: [
        statePath,
        ...mainPoints.map( point => new Circle( {
          radius: 0.02,
          translation: point,
          fill: vertexStatePointProperty
        } ) )
      ]
    } );

    let lastVertexState: VertexState | null = null;

    const multilink = Multilink.multilink( [
      stateProperty,
      vertexStateVisibleProperty,
      allVertexStateVisibleProperty
    ], ( state, isVertexStateVisible, showAllState ) => {
      const hide = () => { this.children = []; };

      if ( !isVertexStateVisible ) {
        hide();
        return;
      }
      const vertexState = state.getVertexState( vertex );

      if ( !showAllState ) {
        let hasBlack = false;
        let hasWhite = false;
        const whiteEdges = new Set<TEdge>();
        for ( const edge of vertex.edges ) {
          const edgeState = state.getEdgeState( edge );
          hasBlack = hasBlack || edgeState === EdgeState.BLACK;
          hasWhite = hasWhite || edgeState === EdgeState.WHITE;
          if ( edgeState === EdgeState.WHITE ) {
            whiteEdges.add( edge );
          }
        }

        if ( hasBlack || !hasWhite ) {
          hide();
          return;
        }

        const basicState = VertexState.fromLookup( vertex, ( a, b ) => whiteEdges.has( a ) && whiteEdges.has( b ), true );
        if ( basicState.equals( vertexState ) ) {
          hide();
          return;
        }
      }

      if ( !lastVertexState || !lastVertexState.equals( vertexState ) ) {
        lastVertexState = vertexState;

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
      }

      this.children = [
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