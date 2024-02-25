import { Node, Text, TextOptions } from 'phet-lib/scenery';
import { TFace } from '../../model/board/core/TFace.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { faceValueColorProperty, faceValueCompletedColorProperty, faceValueErrorColorProperty, puzzleFont } from '../Theme.ts';
import EdgeState from '../../model/data/edge/EdgeState.ts';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { TEdgeData } from '../../model/data/edge/TEdgeData.ts';
import { TFaceData } from '../../model/data/face/TFaceData.ts';

export type FaceNodeOptions = {
  textOptions?: TextOptions;
};

export class FaceNode extends Node {

  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<TEdgeData & TFaceData>>,
    providedOptions?: FaceNodeOptions
  ) {

    const options = optionize<FaceNodeOptions>()( {
      textOptions: {
        font: puzzleFont,
        maxWidth: 0.9,
        maxHeight: 0.9
      }
    }, providedOptions );

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
    this.disposeEmitter.addListener( () => faceStringProperty.dispose() );

    const fillProperty = new DerivedProperty( [
      stateProperty,
      faceValueColorProperty,
      faceValueCompletedColorProperty,
      faceValueErrorColorProperty
    ], ( state, color, completedColor, errorColor ) => {
      const faceState = state.getFaceState( face );

      if ( faceState === null ) {
        return null;
      }

      const blackCount = face.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.BLACK ).length;

      if ( blackCount < faceState ) {
        return color;
      }
      // else {
      //   return '#aaa';
      // }
      // TODO: consider the "red" highlight here? Is annoying when we have to double-tap to X
      // TODO: maybe simple auto-solving will obviate this need? YES
      else if ( blackCount === faceState ) {
        return completedColor;
      }
      else {
        return errorColor;
      }
    } );
    this.disposeEmitter.addListener( () => fillProperty.dispose() );

    const text = new Text( faceStringProperty, combineOptions<TextOptions>( {
      fill: fillProperty
    }, options?.textOptions ) );

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