import { currentTheme, uiHeaderFont } from './Theme.ts';

import { Property } from 'phet-lib/axon';
import { optionize } from 'phet-lib/phet-core';
import { Text, VBox, VBoxOptions } from 'phet-lib/scenery';
import { AquaRadioButtonGroupItem, VerticalAquaRadioButtonGroup } from 'phet-lib/sun';

export const getVerticalRadioButtonGroup = <T>(
  label: string,
  property: Property<T>,
  items: AquaRadioButtonGroupItem<T>[],
  providedOptions?: VBoxOptions,
) => {
  const radioButtonGroup = new VerticalAquaRadioButtonGroup(property, items, {
    spacing: 8,
    radioButtonOptions: {
      selectedColor: currentTheme.uiButtonBaseColorProperty,
      deselectedColor: currentTheme.uiBackgroundColorProperty,
      stroke: currentTheme.uiForegroundColorProperty,
    },
  });

  const options = optionize<VBoxOptions, unknown>()(
    {
      stretch: true,
      align: 'left',
      spacing: 10,
      children: [
        new Text(label, {
          font: uiHeaderFont,
          fill: currentTheme.uiForegroundColorProperty,
        }),
        radioButtonGroup,
      ],
    },
    providedOptions,
  );

  return new VBox(options);
};
