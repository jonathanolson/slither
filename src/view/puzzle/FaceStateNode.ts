import { Circle, GridBox, Line, Node } from 'phet-lib/scenery';
import { TFace } from '../../model/board/core/TFace.ts';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { faceStateVisibleProperty, puzzleFont, uiBackgroundColorProperty, uiForegroundColorProperty } from '../Theme.ts';
import { Vector2 } from 'phet-lib/dot';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { TFaceStateData } from '../../model/data/face-state/TFaceStateData.ts';
import { Panel } from 'phet-lib/sun';
import { UIText } from '../UIText.ts';

export class FaceStateNode extends Node {
  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<TFaceStateData & TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>
  ) {
    super( {
      translation: face.viewCoordinates
    } );

    const multilink = Multilink.multilink( [
      stateProperty,
      faceStateVisibleProperty
    ], ( state, isFaceStateVisible ) => {
      this.children = [];

      if ( isFaceStateVisible ) {
        const faceState = state.getFaceState( face );

        const onlyShowCount = faceState.possibilityCount === 0 || faceState.possibilityCount > 9;

        let content: Node;

        if ( onlyShowCount ) {
          content = new UIText( faceState.possibilityCount, {
            font: puzzleFont,
            maxWidth: 0.3,
            maxHeight: 0.3
          } );
        }
        else {
          content = new GridBox( {
            spacing: 1.5,
            autoColumns: Math.ceil( Math.sqrt( faceState.possibilityCount ) ),
            children: faceState.getAllowedCombinations().map( blackEdges => {
              const node = new Node();

              const mvt = ( v: Vector2 ) => v.minus( face.viewCoordinates );

              for ( const edge of blackEdges ) {
                node.addChild( new Line( mvt( edge.start.viewCoordinates ), mvt( edge.end.viewCoordinates ), {
                  lineWidth: 0.1,
                  stroke: uiForegroundColorProperty
                } ) );
              }

              for ( const vertex of face.vertices ) {
                node.addChild( new Circle( 0.1, {
                  fill: uiForegroundColorProperty,
                  translation: mvt( vertex.viewCoordinates )
                } ) );
              }

              return node;
            } ),
            maxWidth: 0.5,
            maxHeight: 0.5
          } );
        }

        this.addChild( new Panel( content, {
          fill: uiBackgroundColorProperty,
          stroke: uiForegroundColorProperty,
          xMargin: 0.1,
          yMargin: 0.1,
          lineWidth: 0.02,
          cornerRadius: 0.1,
          center: Vector2.ZERO
        } ) );
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