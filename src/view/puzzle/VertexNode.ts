import { Node, Rectangle } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge/EdgeState.ts';
import { vertexColorProperty, verticesVisibleProperty } from '../Theme.ts';
import { TEdgeData } from '../../model/data/edge/TEdgeData.ts';

export class VertexNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<TEdgeData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>
  ) {
    super();

    const visibleProperty = new DerivedProperty( [
      stateProperty,
      verticesVisibleProperty
    ], ( state, visible ) => {
      return visible && vertex.edges.every( edge => state.getEdgeState( edge ) !== EdgeState.BLACK );
    } );
    this.disposeEmitter.addListener( () => visibleProperty.dispose() );

    this.addChild( new Rectangle( {
      rectWidth: 0.1,
      rectHeight: 0.1,
      center: vertex.viewCoordinates,
      fill: vertexColorProperty,
      visibleProperty: visibleProperty
    } ) );

    // Apply effects when solved
    const isSolvedListener = ( isSolved: boolean ) => {
      this.visible = !isSolved;
    };
    isSolvedProperty.link( isSolvedListener );
    this.disposeEmitter.addListener( () => isSolvedProperty.unlink( isSolvedListener ) );
  }
}