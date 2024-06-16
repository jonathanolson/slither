import { currentTheme, uiHeaderFont } from './Theme.ts';
import { UIAquaRadioButtonGroup, UIAquaRadioButtonGroupOptions } from './UIAquaRadioButtonGroup.ts';

import { Property } from 'phet-lib/axon';
import { optionize } from 'phet-lib/phet-core';
import { Text, VBox, VBoxOptions } from 'phet-lib/scenery';
import { AquaRadioButtonGroupItem } from 'phet-lib/sun';

type SelfOptions = {
  radioButtonGroupOptions?: UIAquaRadioButtonGroupOptions;
};

export type UILabeledVerticalAquaRadioButtonGroupOptions = SelfOptions & VBoxOptions;

export class UILabeledVerticalAquaRadioButtonGroup<T> extends VBox {
  public constructor(
    label: string,
    property: Property<T>,
    items: AquaRadioButtonGroupItem<T>[],
    providedOptions?: UILabeledVerticalAquaRadioButtonGroupOptions,
  ) {
    const options = optionize<VBoxOptions, SelfOptions>()(
      {
        // @ts-expect-error
        stretch: true,
        align: 'left',
        spacing: 10,
        radioButtonGroupOptions: {
          orientation: 'vertical',
          align: 'left',
        },
      },
      providedOptions,
    );

    const radioButtonGroup = new UIAquaRadioButtonGroup(property, items, options.radioButtonGroupOptions);

    options.children = [
      new Text(label, {
        font: uiHeaderFont,
        fill: currentTheme.uiForegroundColorProperty,
      }),
      radioButtonGroup,
    ];

    super(options);
  }
}
