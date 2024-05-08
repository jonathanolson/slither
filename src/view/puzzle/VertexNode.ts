import { Node, Path } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { DerivedProperty, Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { Shape } from 'phet-lib/kite';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

const smallRadius = 0.03;
const largeRadius = 0.05;
const smallCircle = Shape.circle( smallRadius ).makeImmutable();
const largeCircle = Shape.circle( largeRadius ).makeImmutable();
const smallSquare = Shape.rect( -smallRadius, -smallRadius, 2 * smallRadius, 2 * smallRadius ).makeImmutable();
const largeSquare = Shape.rect( -largeRadius, -largeRadius, 2 * largeRadius, 2 * largeRadius ).makeImmutable();

export class VertexNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    style: TPuzzleStyle
  ) {
    super();

    const visibleProperty = new DerivedProperty( [
      stateProperty,
      style.verticesVisibleProperty
    ], ( state, visible ) => {
      return visible && vertex.edges.every( edge => state.getEdgeState( edge ) !== EdgeState.BLACK );
    } );
    this.disposeEmitter.addListener( () => visibleProperty.dispose() );

    // TODO: potentially just have our VertexNode be the path?
    const path = new Path( null, {
      translation: vertex.viewCoordinates,
      fill: style.theme.vertexColorProperty,
      visibleProperty: visibleProperty
    } );
    this.addChild( path );

    const multilink = Multilink.multilink( [
      style.vertexStyleProperty,
      style.smallVertexProperty
    ], ( style, isSmall ) => {
      if ( style === 'round' ) {
        path.shape = isSmall ? smallCircle : largeCircle;
      }
      else if ( style === 'square' ) {
        path.shape = isSmall ? smallSquare : largeSquare;
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