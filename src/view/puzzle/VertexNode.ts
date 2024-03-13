import { Node, Path } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { DerivedProperty, Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { smallVertexProperty, vertexColorProperty, vertexStyleProperty, verticesVisibleProperty } from '../Theme.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { Shape } from 'phet-lib/kite';

export class VertexNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<TEdgeStateData>>,
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

    const path = new Path( null, {
      translation: vertex.viewCoordinates,
      fill: vertexColorProperty,
      visibleProperty: visibleProperty
    } );
    this.addChild( path );

    const multilink = Multilink.multilink( [
      vertexStyleProperty,
      smallVertexProperty
    ], ( style, isSmall ) => {
      const radius = isSmall ? 0.03 : 0.05;

      if ( style === 'round' ) {
        path.shape = Shape.circle( radius );
      }
      else if ( style === 'square' ) {
        path.shape = Shape.rect( -radius, -radius, 2 * radius, 2 * radius );
      }
      else {
        assertEnabled() && assert( false, `unhandled vertex style: ${style}` );
      }
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