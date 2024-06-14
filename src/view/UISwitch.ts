import { Property, TReadOnlyProperty } from 'phet-lib/axon';
import { OnOffSwitch, OnOffSwitchOptions } from 'phet-lib/sun';
import { HBox, HBoxOptions, Node } from 'phet-lib/scenery';
import { optionize } from 'phet-lib/phet-core';
import { advancedSettingsVisibleProperty } from './SettingsNode.ts';
import { currentTheme } from './Theme.ts';
import { Dimension2 } from 'phet-lib/dot';

type SelfOptions = {
  // If it is advanced, will only be visible when advancedSettingsVisibleProperty is true
  advanced?: boolean;

  onOffSwitchOptions?: OnOffSwitchOptions;
};

export type UISwitchOptions = SelfOptions & HBoxOptions;

export class UISwitch extends HBox {
  public constructor(
    property: Property<boolean>,
    name: string | TReadOnlyProperty<string>,
    content: Node,
    providedOptions?: UISwitchOptions,
  ) {
    const options = optionize<UISwitchOptions, SelfOptions, HBoxOptions>()(
      {
        advanced: false,
        // checkboxColor: uiForegroundColorProperty,
        // checkboxColorBackground: uiBackgroundColorProperty,
        onOffSwitchOptions: {
          size: new Dimension2(40, 20),
          trackFillLeft: currentTheme.uiButtonDisabledColorProperty,
          trackFillRight: currentTheme.uiButtonBaseColorProperty,
          accessibleName: name,
        },

        spacing: 10,
      },
      providedOptions,
    );

    const onOffSwitch = new OnOffSwitch(property, options.onOffSwitchOptions);

    options.children = [content, onOffSwitch];

    // TODO: we'll need to dispose of this...
    if (options.advanced) {
      options.visibleProperty = advancedSettingsVisibleProperty;
    }

    super(options);
  }
}
