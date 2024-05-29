import { Node, Path } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { Shape } from 'phet-lib/kite';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { TBoard } from '../../model/board/core/TBoard.ts';
import { Vector2 } from 'phet-lib/dot';
import { TRedLineStyle } from '../Theme.ts';

export class EdgeViewNode extends Node {

  public constructor(
    board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    style: TPuzzleStyle,
  ) {

    const whitePath = new Path( null, {
      lineWidth: 0.02,
      stroke: style.theme.whiteLineColorProperty,
    } );

    const redXPath = new Path( null, {
      stroke: style.theme.xColorProperty,
      lineWidth: 0.025,
    } );

    const redLinePath = new Path( null, {
      lineWidth: 0.02,
      fill: style.theme.redLineColorProperty,
    } );

    super( {
      children: [
        whitePath,
        redXPath,
        redLinePath,
      ],
      pickable: false,
    } );

    // NOTE: this is actually a valid start state
    const edgeStates: EdgeState[] = board.edges.map( edge => EdgeState.BLACK ); // Used because we currently don't display BLACK!
    let alignedXs = false;

    let showedWhiteLines = false;
    let showedRedXs = false;
    let showedRedLines = false;
    let showedRedLineStyle: TRedLineStyle | null = null;

    const multilink = Multilink.multilink( [
      stateProperty,
      isSolvedProperty,
      style.whiteLineVisibleProperty,
      style.redXsVisibleProperty,
      style.redXsAlignedProperty,
      style.redLineVisibleProperty,
      style.redLineStyleProperty,
    ], (
      state,
      isSolved,
      whiteLineVisible,
      redXsVisible,
      redXsAligned,
      redLineVisible,
      redLineStyle,
    ) => {
      this.visible = !isSolved;
      whitePath.visible = whiteLineVisible;
      redXPath.visible = redXsVisible;
      redLinePath.visible = redLineVisible;

      if ( this.visible ) {
        let changed = false;
        for ( let i = 0; i < board.edges.length; i++ ) {
          const edgeState = state.getEdgeState( board.edges[ i ] );

          if ( edgeState !== edgeStates[ i ] ) {
            changed = true;
            edgeStates[ i ] = edgeState;
          }
        }

        if ( alignedXs !== redXsAligned ) {
          changed = true;
          alignedXs = redXsAligned;
        }
        if ( showedWhiteLines !== whiteLineVisible ) {
          changed = true;
          showedWhiteLines = whiteLineVisible;
        }
        if ( showedRedXs !== redXsVisible ) {
          changed = true;
          showedRedXs = redXsVisible;
        }
        if ( showedRedLines !== redLineVisible ) {
          changed = true;
          showedRedLines = redLineVisible;
        }
        if ( showedRedLineStyle !== redLineStyle ) {
          changed = true;
          showedRedLineStyle = redLineStyle;
        }

        if ( changed ) {
          const whiteShape = new Shape();
          const redXShape = new Shape();
          const redLineShape = new Shape();

          for ( let i = 0; i < board.edges.length; i++ ) {
            const edgeState = edgeStates[ i ];

            if ( whiteLineVisible && edgeState === EdgeState.WHITE ) {
              const edge = board.edges[ i ];
              whiteShape.moveTo( edge.start.viewCoordinates.x, edge.start.viewCoordinates.y );
              whiteShape.lineTo( edge.end.viewCoordinates.x, edge.end.viewCoordinates.y );
            }

            if ( edgeState === EdgeState.RED ) {
              if ( redXsVisible ) {
                const edge = board.edges[ i ];
                const halfSize = 0.07;

                let center = edge.start.viewCoordinates.blend( edge.end.viewCoordinates, 0.5 );

                if ( redXsAligned ) {
                  const angle = edge.end.viewCoordinates.minus( edge.start.viewCoordinates ).getAngle();

                  const a = new Vector2( -halfSize, -halfSize ).rotate( angle ).add( center );
                  const b = new Vector2( halfSize, halfSize ).rotate( angle ).add( center );
                  const c = new Vector2( -halfSize, halfSize ).rotate( angle ).add( center );
                  const d = new Vector2( halfSize, -halfSize ).rotate( angle ).add( center );

                  redXShape.moveTo( a.x, a.y );
                  redXShape.lineTo( b.x, b.y );
                  redXShape.moveTo( c.x, c.y );
                  redXShape.lineTo( d.x, d.y );
                }
                else {
                  redXShape.moveTo( center.x - halfSize, center.y - halfSize );
                  redXShape.lineTo( center.x + halfSize, center.y + halfSize );
                  redXShape.moveTo( center.x - halfSize, center.y + halfSize );
                  redXShape.lineTo( center.x + halfSize, center.y - halfSize );
                }
              }

              if ( redLineVisible ) {
                // TODO: ditch style property?

                const edge = board.edges[ i ];
                const redLineProportion = 0.40;
                const radius = 0.017;
                const center = edge.start.viewCoordinates.blend( edge.end.viewCoordinates, 0.5 );
                const pointA = center.blend( edge.start.viewCoordinates, redLineProportion );
                const pointB = center.blend( edge.end.viewCoordinates, redLineProportion );

                for ( let j = 0; j < 5; j++ ) {
                  const point = pointA.blend( pointB, j / 4 );

                  redLineShape.moveTo( point.x + radius, point.y );
                  redLineShape.arc( point.x, point.y, radius, 0, 2 * Math.PI, false );
                }
              }
            }
          }

          whiteShape.makeImmutable();
          redXShape.makeImmutable();
          redLineShape.makeImmutable();

          whitePath.shape = whiteShape;
          redXPath.shape = redXShape;
          redLinePath.shape = redLineShape;
        }
      }
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }
}