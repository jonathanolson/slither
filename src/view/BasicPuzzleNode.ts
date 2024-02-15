import { Node, NodeOptions, Text, TextOptions } from 'phet-lib/scenery';
import { TFace, TFaceEdgeData, TReadOnlyPuzzle, TState, TStructure } from '../model/structure.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions } from 'phet-lib/phet-core';

export type BasicPuzzleNodeOptions = {
  textOptions?: TextOptions;
} & NodeOptions;

export default class BasicPuzzleNode<Structure extends TStructure = TStructure, State extends TState<TFaceEdgeData> = TState<TFaceEdgeData>> extends Node {
  public constructor(
    public readonly puzzle: TReadOnlyPuzzle<Structure, State>,
    options?: BasicPuzzleNodeOptions
  ) {
    const faceContainer = new Node();
    const edgeContainer = new Node();

    puzzle.board.faces.forEach( face => {
      faceContainer.addChild( new FaceNode( face, puzzle.stateProperty, options ) );
    } );

    super( combineOptions<BasicPuzzleNodeOptions>( {
      children: [ faceContainer, edgeContainer ]
    }, options ) );
  }
}

class FaceNode extends Node {

  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<TFaceEdgeData>>,
    options?: BasicPuzzleNodeOptions
  ) {
    super( {} );

    // TODO: disposal>!>
    const faceStringProperty = new DerivedProperty( [ stateProperty ], state => {
      const faceState = state.getFaceState( face );

      if ( faceState === null ) {
        return '';
      }
      else {
        return `${faceState}`;
      }
    } );

    const text = new Text( faceStringProperty, options?.textOptions );

    text.localBoundsProperty.link( localBounds => {
      if ( localBounds.isValid() ) {
        this.children = [ text ];
        text.center = face.viewCoordinates;
      }
      else {
        this.children = [];
      }
    } );
  }
}
