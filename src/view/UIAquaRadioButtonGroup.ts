import { Property } from 'phet-lib/axon';
import { AquaRadioButtonGroup, AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from 'phet-lib/sun';
import { uiBackgroundColorProperty, uiButtonBaseColorProperty, uiForegroundColorProperty } from './Theme.ts';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';

export type UIAquaRadioButtonGroupOptions = AquaRadioButtonGroupOptions;

export class UIAquaRadioButtonGroup<T> extends AquaRadioButtonGroup<T> {
  public constructor(
    property: Property<T>,
    items: AquaRadioButtonGroupItem<T>[],
    providedOptions?: AquaRadioButtonGroupOptions
  ) {
    const options = optionize<AquaRadioButtonGroupOptions, EmptySelfOptions>()( {
      spacing: 8,
      radioButtonOptions: {
        selectedColor: uiButtonBaseColorProperty,
        deselectedColor: uiBackgroundColorProperty,
        stroke: uiForegroundColorProperty
      }
    }, providedOptions );

    super( property, items, options );
  }
}
