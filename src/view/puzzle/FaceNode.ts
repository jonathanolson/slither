import { Node, TColor, Text, TextOptions } from 'phet-lib/scenery';
import { TFace } from '../../model/board/core/TFace.ts';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { faceValueColorProperty, faceValueCompletedColorProperty, faceValueErrorColorProperty, faceValueStyleProperty, puzzleFont } from '../Theme.ts';
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

    const text = new Text( '', combineOptions<TextOptions>( {

    }, options?.textOptions ) );

    const multilink = Multilink.multilink( [
      stateProperty,
      faceValueStyleProperty,
      faceValueColorProperty,
      faceValueCompletedColorProperty,
      faceValueErrorColorProperty
    ], (
      state,
      faceValueStyle,
      color,
      completedColor,
      errorColor
    ) => {
      const faceState = state.getFaceState( face );

      let string: string;
      let fill: TColor;

      let usingRemaining = false;
      let usingRatio = false;

      if ( faceState === null ) {
        string = '';
        fill = null;
      }
      else {
        let blackCount = 0;
        let whiteCount = 0;
        for ( const edge of face.edges ) {
          const edgeState = state.getEdgeState( edge );
          if ( edgeState === EdgeState.BLACK ) {
            blackCount++;
          }
          else if ( edgeState === EdgeState.WHITE ) {
            whiteCount++;
          }
        }


        if ( faceValueStyle === 'static' || faceState === 0 ) {
          string = `${faceState}`;
        }
        else if ( faceValueStyle === 'remaining' ) {
          string = `${faceState - blackCount}`;
          usingRemaining = blackCount > 0;
        }
        else if ( faceValueStyle === 'ratio' ) {
          // TODO: optimize?
          const numerator = faceState - blackCount;
          if ( numerator === 0 ) {
            string = '0';
          }
          else {
            // TODO: rich text broken, testing this instead
            string = `${faceState - blackCount}/${whiteCount}`;
            usingRatio = true;
          }
          usingRemaining = blackCount > 0;
        }
        else {
          throw new Error( `unhandled faceValueStyle: ${faceValueStyle}` );
        }

        if ( blackCount < faceState ) {
          fill = usingRemaining ? color : color; // TODO figure out a better color... for this? Try a color difference?
        }
        else if ( blackCount === faceState ) {
          fill = completedColor;
        }
        else {
          fill = errorColor;
        }
      }

      text.string = string;

      text.fill = fill;

      text.maxWidth = usingRatio ? 0.8 : 0.9;
      text.maxHeight = usingRatio ? 0.8 : 0.9;
      text.center = face.viewCoordinates;
      this.children = [ text ];
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }
}