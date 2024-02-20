import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { Node, VBox } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { TextPushButton, TextPushButtonOptions } from 'phet-lib/sun';
import { popupFont, rectangularButtonAppearanceStrategy, uiButtonBaseColorProperty, uiButtonForegroundProperty } from './Theme.ts';
import { BasicSquarePuzzle, TCompleteData, TPuzzle, TState, TStructure } from '../model/structure.ts';
import scanURL from '../scan/scanURL.ts';
import { combineOptions } from 'phet-lib/phet-core';

export type NewNodeOptions = {
  loadPuzzle: ( puzzle: TPuzzle<TStructure, TState<TCompleteData>> ) => void;
};

export class NewNode extends PopupNode {
  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>,
    options: NewNodeOptions
  ) {

    const commonButtonOptions = {
      textFill: uiButtonForegroundProperty,
      baseColor: uiButtonBaseColorProperty,
      xMargin: 5,
      yMargin: 5,
      font: popupFont,
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
    };

    super( new VBox( {
      spacing: 20,
      align: 'left',
      stretch: true,
      children: [
        new TextPushButton( 'Load String', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
          listener: () => {
            this.hide();

            // TODO: try/catch
            const string = prompt( 'Enter puzzle string' );

            if ( string ) {
              options.loadPuzzle( BasicSquarePuzzle.loadDeprecatedScalaString( string ) );
            }
          }
        } ) ),
        new TextPushButton( 'Load Image', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
          listener: () => {
            this.hide();

            const input = document.createElement( 'input' );
            input.type = 'file';
            input.onchange = event => {
              // @ts-ignore
              const file = event.target!.files[ 0 ];

              var reader = new FileReader();
              reader.readAsDataURL( file );

              reader.onloadend = async () => {
                const url = reader.result as string;

                // TODO: UI change while working?
                const puzzle = await scanURL( url );

                options.loadPuzzle( puzzle );
              }
            }
            input.click();
          }
        } ) )
      ]
    } ), glassPane, layoutBoundsProperty );
  }
}
