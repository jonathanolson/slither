import { Node } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { TFaceStateData } from '../../model/data/face-state/TFaceStateData.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { TBoard } from '../../model/board/core/TBoard.ts';
import { FaceStateNode } from './FaceStateNode.ts';

export class FaceStateViewNode extends Node {
  public constructor(
    board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TFaceStateData & TEdgeStateData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    style: TPuzzleStyle
  ) {
    super( {
      pickable: false,
    } );

    // TODO: translate by face.viewCoordinates

    const multilink = Multilink.multilink( [
      stateProperty,
      style.faceStateVisibleProperty
    ], ( state, isFaceStateVisible ) => {
      this.children = [];

      if ( isFaceStateVisible ) {
        board.faces.forEach( face => {
          this.addChild( new FaceStateNode( face, stateProperty, style ) );
        } );
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