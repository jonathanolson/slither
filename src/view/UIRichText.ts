import { currentTheme, uiFont } from './Theme.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';
import { RichText, RichTextOptions } from 'phet-lib/scenery';

export type UITextOptions = RichTextOptions;

export class UIRichText extends RichText {
  public constructor(string: string | number | TReadOnlyProperty<string>, providedOptions?: UITextOptions) {
    const options = optionize<UITextOptions, EmptySelfOptions, RichTextOptions>()(
      {
        font: uiFont,
        fill: currentTheme.uiForegroundColorProperty,
      },
      providedOptions,
    );

    super(string, options);
  }
}
