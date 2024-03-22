import { Property } from 'phet-lib/axon';
import { AquaRadioButtonGroup, AquaRadioButtonGroupItem, AquaRadioButtonGroupOptions } from 'phet-lib/sun';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';
import { currentTheme } from './Theme.ts';

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
        selectedColor: currentTheme.uiButtonBaseColorProperty,
        deselectedColor: currentTheme.uiBackgroundColorProperty,
        stroke: currentTheme.uiForegroundColorProperty
      }
    }, providedOptions );

    super( property, items, options );
  }
}
