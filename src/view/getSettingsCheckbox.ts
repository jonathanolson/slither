import { Property } from 'phet-lib/axon';
import { Checkbox } from 'phet-lib/sun';
import { Text } from 'phet-lib/scenery';
import { popupFont, uiBackgroundColorProperty, uiForegroundColorProperty } from './Theme.ts';

export const getSettingsCheckbox = ( label: string, property: Property<boolean> ) => {
  return new Checkbox( property, new Text( label, {
    font: popupFont,
    fill: uiForegroundColorProperty
  } ), {
    accessibleName: label,
    checkboxColor: uiForegroundColorProperty,
    checkboxColorBackground: uiBackgroundColorProperty
  } );
};
