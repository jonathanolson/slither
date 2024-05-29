import { Path } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { Shape } from 'phet-lib/kite';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { TBoard } from '../../model/board/core/TBoard.ts';

const smallRadius = 0.03;
const largeRadius = 0.05;

export class VertexViewNode extends Path {
  public constructor(
    board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    style: TPuzzleStyle
  ) {

    super( null, {
      pickable: false,
      fill: style.theme.vertexColorProperty,
    } );

    const edgeStates: EdgeState[] = board.edges.map( edge => EdgeState.BLACK ); // Used because this can trigger sector display or not
    let lastVertexStyle = style.vertexStyleProperty.value;
    let lastIsSmall = style.smallVertexProperty.value;

    const multilink = Multilink.multilink( [
      stateProperty,
      isSolvedProperty,
      style.verticesVisibleProperty,
      style.vertexStyleProperty,
      style.smallVertexProperty
    ], (
      state,
      isSolved,
      verticesVisible,
      vertexStyle,
      isSmall,
    ) => {
      this.visible = !isSolved && verticesVisible;

      if ( this.visible ) {
        let changed = false;
        for ( let i = 0; i < board.edges.length; i++ ) {
          const edgeState = state.getEdgeState( board.edges[ i ] );

          if ( edgeState !== edgeStates[ i ] ) {
            changed = true;
            edgeStates[ i ] = edgeState;
          }
        }

        if ( lastVertexStyle !== vertexStyle ) {
          lastVertexStyle = vertexStyle;
          changed = true;
        }
        if ( lastIsSmall !== isSmall ) {
          lastIsSmall = isSmall;
          changed = true;
        }

        if ( changed ) {
          const shape = new Shape();

          for ( let i = 0; i < board.vertices.length; i++ ) {
            const vertex = board.vertices[ i ];
            if ( vertex.edges.every( edge => state.getEdgeState( edge ) !== EdgeState.BLACK ) ) {
              const point = vertex.viewCoordinates;
              const radius = isSmall ? smallRadius : largeRadius;

              if ( vertexStyle === 'round' ) {
                shape.moveTo( point.x + radius, point.y );
                shape.arc( point.x, point.y, radius, 0, 2 * Math.PI, false );
              }
              else if ( vertexStyle === 'square' ) {
                shape.rect( point.x - radius, point.y - radius, 2 * radius, 2 * radius );
              }
              else {
                assertEnabled() && assert( false, `unhandled vertex style: ${vertexStyle}` );
              }
            }
          }

          this.shape = shape;
        }
      }
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }
}