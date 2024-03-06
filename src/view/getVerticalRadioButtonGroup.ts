import { Property } from 'phet-lib/axon';
import { AquaRadioButtonGroupItem, VerticalAquaRadioButtonGroup } from 'phet-lib/sun';
import { Text, VBox, VBoxOptions } from 'phet-lib/scenery';
import { uiBackgroundColorProperty, uiButtonBaseColorProperty, uiForegroundColorProperty, uiHeaderFont } from './Theme.ts';
import { optionize } from 'phet-lib/phet-core';

export const getVerticalRadioButtonGroup = <T>( label: string, property: Property<T>, items: AquaRadioButtonGroupItem<T>[], providedOptions?: VBoxOptions ) => {

  const radioButtonGroup = new VerticalAquaRadioButtonGroup( property, items, {
    spacing: 8,
    radioButtonOptions: {
      selectedColor: uiButtonBaseColorProperty,
      deselectedColor: uiBackgroundColorProperty,
      stroke: uiForegroundColorProperty
    }
  } );

  const options = optionize<VBoxOptions, unknown>()( {
    stretch: true,
    align: 'left',
    spacing: 10,
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
