import { TextPushButton, TextPushButtonOptions } from 'phet-lib/sun';
import { optionize } from 'phet-lib/phet-core';
import { currentTheme, rectangularButtonAppearanceStrategy, uiFont } from './Theme.ts';
import { advancedSettingsVisibleProperty } from './SettingsNode.ts';

type SelfOptions = {
  // If it is advanced, will only be visible when advancedSettingsVisibleProperty is true
  advanced?: boolean;
};

export type UITextPushButtonOptions = SelfOptions & TextPushButtonOptions;

export class UITextPushButton extends TextPushButton {
  public constructor(text: string, providedOptions?: UITextPushButtonOptions) {
    const options = optionize<UITextPushButtonOptions, SelfOptions, TextPushButtonOptions>()(
      {
        advanced: false,
        textFill: currentTheme.uiButtonForegroundProperty,
        baseColor: currentTheme.uiButtonBaseColorProperty,
        xMargin: 5,
        yMargin: 5,
        font: uiFont,
        buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      },
      providedOptions,
    );

    if (options.advanced) {
      options.visibleProperty = advancedSettingsVisibleProperty;
    }

    super(text, options);
  }
}
