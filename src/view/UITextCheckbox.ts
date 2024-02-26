import { Property } from 'phet-lib/axon';
import { Checkbox, CheckboxOptions } from 'phet-lib/sun';
import { Text } from 'phet-lib/scenery';
import { popupFont, uiBackgroundColorProperty, uiForegroundColorProperty } from './Theme.ts';
import { optionize } from 'phet-lib/phet-core';
import { advancedSettingsVisibleProperty } from './SettingsNode.ts';

type SelfOptions = {
  // If it is advanced, will only be visible when advancedSettingsVisibleProperty is true
  advanced?: boolean;
};

export type UITextCheckboxOptions = SelfOptions & CheckboxOptions;

export class UITextCheckbox extends Checkbox {
  public constructor(
    label: string,
    property: Property<boolean>,
    providedOptions?: UITextCheckboxOptions
  ) {
    const options = optionize<UITextCheckboxOptions, SelfOptions, CheckboxOptions>()( {
      advanced: false,
      accessibleName: label,
      checkboxColor: uiForegroundColorProperty,
      checkboxColorBackground: uiBackgroundColorProperty
    }, providedOptions );

    // TODO: we'll need to dispose of this...
    if ( options.advanced ) {
      options.visibleProperty = advancedSettingsVisibleProperty;
    }

    super( property, new Text( label, {
      font: popupFont,
      fill: uiForegroundColorProperty
    } ), options );
  }
}
