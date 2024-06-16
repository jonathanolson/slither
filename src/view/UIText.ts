import { currentTheme, uiFont } from './Theme.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';
import { Text, TextOptions } from 'phet-lib/scenery';

export type UITextOptions = TextOptions;

// TODO: use UIText elsewhere
export class UIText extends Text {
  public constructor(string: string | number | TReadOnlyProperty<string>, providedOptions?: UITextOptions) {
    const options = optionize<UITextOptions, EmptySelfOptions, TextOptions>()(
      {
        font: uiFont,
        fill: currentTheme.uiForegroundColorProperty,
      },
      providedOptions,
    );

    super(string, options);
  }
}
