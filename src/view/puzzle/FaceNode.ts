import { Node, TColor, Text, TextOptions } from 'phet-lib/scenery';
import { TFace } from '../../model/board/core/TFace.ts';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { puzzleFont } from '../Theme.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { TFaceValueData } from '../../model/data/face-value/TFaceValueData.ts';
import { Shape } from 'phet-lib/kite';
import { hookPuzzleListeners } from './hookPuzzleListeners.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

export type FaceNodeOptions = {
  textOptions?: TextOptions;
  facePressListener?: ( face: TFace | null, button: 0 | 1 | 2 ) => void; // null is the "outside" face
  faceHoverListener?: ( face: TFace | null, isOver: boolean ) => void; // null is the "outside" face
};

export class FaceNode extends Node {

  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<TEdgeStateData & TFaceValueData>>,
    style: TPuzzleStyle,
    providedOptions?: FaceNodeOptions
  ) {

    const options = optionize<FaceNodeOptions>()( {
      textOptions: {
        font: puzzleFont,
        maxWidth: 0.9,
        maxHeight: 0.9,
      },
      facePressListener: () => {},
      faceHoverListener: () => {}
    }, providedOptions );

    super( {} );

    const pointerArea = Shape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) );
    this.mouseArea = pointerArea;
    this.touchArea = pointerArea;

    hookPuzzleListeners( face, this, options.facePressListener, options.faceHoverListener );

    const text = new Text( '', combineOptions<TextOptions>( {

    }, options?.textOptions ) );

    const multilink = Multilink.multilink( [
      stateProperty,
      style.faceValueStyleProperty,
      style.theme.faceValueColorProperty,
      style.theme.faceValueCompletedColorProperty,
      style.theme.faceValueErrorColorProperty,
      style.faceStateVisibleProperty
    ], (
      state,
      faceValueStyle,
      color,
      completedColor,
      errorColor,
      faceStateVisible
    ) => {
      const faceValue = state.getFaceValue( face );

      this.visible = !faceStateVisible;

      let string: string;
      let fill: TColor;

      let usingRemaining = false;
      let usingRatio = false;

      if ( faceValue === null ) {
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


        if ( faceValueStyle === 'static' || faceValue === 0 ) {
          string = `${faceValue}`;
        }
        else if ( faceValueStyle === 'remaining' ) {
          string = `${faceValue - blackCount}`;
          usingRemaining = blackCount > 0;
        }
        else if ( faceValueStyle === 'ratio' ) {
          // TODO: optimize?
          const numerator = faceValue - blackCount;
          if ( numerator === 0 ) {
            string = '0';
          }
          else {
            // TODO: rich text broken, testing this instead
            string = `${faceValue - blackCount}/${whiteCount}`;
            usingRatio = true;
          }
          usingRemaining = blackCount > 0;
        }
        else {
          throw new Error( `unhandled faceValueStyle: ${faceValueStyle}` );
        }

        if ( blackCount < faceValue ) {
          fill = usingRemaining ? color : color; // TODO figure out a better color... for this? Try a color difference?
        }
        else if ( blackCount === faceValue ) {
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