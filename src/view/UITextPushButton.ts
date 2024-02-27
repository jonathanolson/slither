import { TextPushButton, TextPushButtonOptions } from 'phet-lib/sun';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';
import { uiFont, rectangularButtonAppearanceStrategy, uiButtonBaseColorProperty, uiButtonForegroundProperty } from './Theme.ts';

type SelfOptions = EmptySelfOptions;

export type UITextPushButtonOptions = SelfOptions & TextPushButtonOptions;

export class UITextPushButton extends TextPushButton {
  public constructor(
    text: string,
    providedOptions?: TextPushButtonOptions
  ) {

    const options = optionize<UITextPushButtonOptions, SelfOptions, TextPushButtonOptions>()( {
      textFill: uiButtonForegroundProperty,
      baseColor: uiButtonBaseColorProperty,
      xMargin: 5,
      yMargin: 5,
      font: uiFont,
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
    }, providedOptions );

    super( text, options );
  }
}