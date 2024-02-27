import { Node, Path } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge/EdgeState.ts';
import { TVertexStyle, vertexColorProperty, vertexStyleProperty, verticesVisibleProperty } from '../Theme.ts';
import { TEdgeData } from '../../model/data/edge/TEdgeData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { Shape } from 'phet-lib/kite';

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

    const path = new Path( null, {
      translation: vertex.viewCoordinates,
      fill: vertexColorProperty,
      visibleProperty: visibleProperty
    } );
    this.addChild( path );

    const vertexStyleListener = ( style: TVertexStyle ) => {
      if ( style === 'round' ) {
        path.shape = Shape.circle( 0.05 );
      }
      else if ( style === 'square' ) {
        path.shape = Shape.rect( -0.05, -0.05, 0.1, 0.1 );
      }
      else {
        assertEnabled() && assert( false, `unhandled vertex style: ${style}` );
      }
    };
    vertexStyleProperty.link( vertexStyleListener );
    this.disposeEmitter.addListener( () => vertexStyleProperty.unlink( vertexStyleListener ) );

    // Apply effects when solved
    const isSolvedListener = ( isSolved: boolean ) => {
      this.visible = !isSolved;
    };
    isSolvedProperty.link( isSolvedListener );
    this.disposeEmitter.addListener( () => isSolvedProperty.unlink( isSolvedListener ) );
  }
}