import { Property } from 'phet-lib/axon';
import { AquaRadioButtonGroupItem, VerticalAquaRadioButtonGroup } from 'phet-lib/sun';
import { Text, VBox, VBoxOptions } from 'phet-lib/scenery';
import { uiHeaderFont, uiForegroundColorProperty } from './Theme.ts';
import { optionize } from 'phet-lib/phet-core';

export const getVerticalRadioButtonGroup = <T>( label: string, property: Property<T>, items: AquaRadioButtonGroupItem<T>[], providedOptions?: VBoxOptions ) => {

  const radioButtonGroup = new VerticalAquaRadioButtonGroup( property, items );

  const options = optionize<VBoxOptions, unknown>()( {
    stretch: true,
    align: 'left',
    spacing: 8,
    children: [
      new Text( label, {
        font: uiHeaderFont,
        fill: uiForegroundColorProperty
      } ),
      radioButtonGroup
    ]
  }, providedOptions );

  return new VBox( options );
};
