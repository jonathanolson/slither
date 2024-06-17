import { advancedSettingsVisibleProperty } from './SettingsNode.ts';
import { currentTheme, rectangularButtonAppearanceStrategy } from './Theme.ts';

import { optionize } from 'phet-lib/phet-core';
import { RectangularPushButton, RectangularPushButtonOptions } from 'phet-lib/sun';

type SelfOptions = {
  // If it is advanced, will only be visible when advancedSettingsVisibleProperty is true
  advanced?: boolean;
};

export type UIRectangularPushButtonOptions = SelfOptions & RectangularPushButtonOptions;

export class UIRectangularPushButton extends RectangularPushButton {
  public constructor(providedOptions?: UIRectangularPushButtonOptions) {
    const options = optionize<UIRectangularPushButtonOptions, SelfOptions, RectangularPushButtonOptions>()(
      {
        advanced: false,
        baseColor: currentTheme.uiButtonBaseColorProperty,
        xMargin: 5,
        yMargin: 5,
        buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      },
      providedOptions,
    );

    if (options.advanced) {
      options.visibleProperty = advancedSettingsVisibleProperty;
    }

    super(options);
  }
}
