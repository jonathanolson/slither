import { RectangularRadioButtonGroup, RectangularRadioButtonGroupOptions } from 'phet-lib/sun';
import { currentTheme } from './Theme.ts';
import { combineOptions } from 'phet-lib/phet-core';

export default class UIRectangularRadioButtonGroup<T> extends RectangularRadioButtonGroup<T> {
  public constructor(
    property: ConstructorParameters<typeof RectangularRadioButtonGroup<T>>[ 0 ],
    items: ConstructorParameters<typeof RectangularRadioButtonGroup<T>>[ 1 ],
    providedOptions?: RectangularRadioButtonGroupOptions
  ) {

    super( property, items, combineOptions<RectangularRadioButtonGroupOptions>( {
      orientation: 'horizontal',
      touchAreaYDilation: 5,
      radioButtonOptions: {
        // buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
        baseColor: currentTheme.uiButtonBaseColorProperty,
        disabledColor: currentTheme.uiButtonDisabledColorProperty,
        xMargin: 8 * 1.3,
        yMargin: 5 * 1.3,
        buttonAppearanceStrategyOptions: {
          selectedStroke: currentTheme.uiButtonSelectedStrokeColorProperty, // TODO: create an option JUST for this type of thing
          deselectedStroke: currentTheme.uiButtonDeselectedStrokeColorProperty
          // overButtonOpacity: 0.8,
          // overStroke: null,
          // selectedLineWidth: 1.5,
          // selectedButtonOpacity: 1,
          // deselectedLineWidth: 1,
          // deselectedButtonOpacity: 0.6
        }
      }
    }, providedOptions ) );
  }
}