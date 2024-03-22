import { TReadOnlyProperty } from 'phet-lib/axon';
import { Text, TextOptions } from 'phet-lib/scenery';
import { currentTheme, uiFont } from './Theme.ts';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';

export type UITextOptions = TextOptions;

// TODO: use UIText elsewhere
export class UIText extends Text {
  public constructor(
    string: string | number | TReadOnlyProperty<string>,
    providedOptions?: UITextOptions
  ) {

    const options = optionize<UITextOptions, EmptySelfOptions, TextOptions>()( {
      font: uiFont,
      fill: currentTheme.uiForegroundColorProperty
    }, providedOptions );

    super( string, options );
  }
}
