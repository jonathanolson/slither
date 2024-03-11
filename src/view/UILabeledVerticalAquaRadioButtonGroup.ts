import { VBox, VBoxOptions, Text } from 'phet-lib/scenery';
import { UIAquaRadioButtonGroup, UIAquaRadioButtonGroupOptions } from './UIAquaRadioButtonGroup.ts';
import { Property } from 'phet-lib/axon';
import { AquaRadioButtonGroupItem } from 'phet-lib/sun';
import { optionize } from 'phet-lib/phet-core';
import { uiForegroundColorProperty, uiHeaderFont } from './Theme.ts';

type SelfOptions = {
  radioButtonGroupOptions?: UIAquaRadioButtonGroupOptions;
};

export type UILabeledVerticalAquaRadioButtonGroupOptions = SelfOptions & VBoxOptions;

export class UILabeledVerticalAquaRadioButtonGroup<T> extends VBox {
  public constructor(
    label: string,
    property: Property<T>,
    items: AquaRadioButtonGroupItem<T>[],
    providedOptions?: UILabeledVerticalAquaRadioButtonGroupOptions
  ) {
    const options = optionize<VBoxOptions, SelfOptions>()( {
      // @ts-expect-error
      stretch: true,
      align: 'left',
      spacing: 10,
      radioButtonGroupOptions: {
        orientation: 'vertical',
        align: 'left'
      },
    }, providedOptions );

    const radioButtonGroup = new UIAquaRadioButtonGroup( property, items, options.radioButtonGroupOptions );

    options.children = [
      new Text( label, {
        font: uiHeaderFont,
        fill: uiForegroundColorProperty
      } ),
      radioButtonGroup
    ];

    super( options );
  }
}
