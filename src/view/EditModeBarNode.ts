import { TReadOnlyProperty } from 'phet-lib/axon';
import { RectangularRadioButtonGroup } from 'phet-lib/sun';
import { Bounds2 } from 'phet-lib/dot';
import { controlBarFont, controlBarMargin, uiButtonBaseColorProperty, uiButtonDisabledColorProperty, uiButtonForegroundProperty } from './Theme.ts';
import EditMode, { editModeProperty } from '../model/puzzle/EditMode.ts';
import { Text } from 'phet-lib/scenery';

export type EditModeBarNodeOptions = {
  layoutBoundsProperty: TReadOnlyProperty<Bounds2>;
};

// TODO: support a background node with more complexity in the future?
export default class EditModeBarNode extends RectangularRadioButtonGroup<EditMode> {
  public constructor(
    options: EditModeBarNodeOptions
  ) {

    super( editModeProperty, [
      {
        value: EditMode.EDGE_STATE,
        labelContent: 'Edge',
        createNode: () => new Text( 'Edge', { fill: uiButtonForegroundProperty, font: controlBarFont } )
      },
      {
        value: EditMode.EDGE_STATE_REVERSED,
        labelContent: 'Edge Reversed',
        createNode: () => new Text( 'Edge Reversed', { fill: uiButtonForegroundProperty, font: controlBarFont } )
      },
      {
        value: EditMode.FACE_COLOR_MATCH,
        labelContent: 'Face Color Match',
        createNode: () => new Text( 'Face Color Match', { fill: uiButtonForegroundProperty, font: controlBarFont } )
      },
      {
        value: EditMode.FACE_COLOR_OPPOSITE,
        labelContent: 'Face Color Opposite',
        createNode: () => new Text( 'Face Color Opposite', { fill: uiButtonForegroundProperty, font: controlBarFont } )
      }
    ], {
      orientation: 'horizontal',
      touchAreaYDilation: 5,
      radioButtonOptions: {
        // buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
        baseColor: uiButtonBaseColorProperty,
        disabledColor: uiButtonDisabledColorProperty,
        xMargin: 8 * 1.3,
        yMargin: 5 * 1.3,
        buttonAppearanceStrategyOptions: {
          // overButtonOpacity: 0.8,
          // overStroke: null,
          // selectedStroke: Color.BLACK,
          selectedStroke: uiButtonForegroundProperty
          // selectedLineWidth: 1.5,
          // selectedButtonOpacity: 1,
          // deselectedStroke: new Color( 50, 50, 50 ),
          // deselectedLineWidth: 1,
          // deselectedButtonOpacity: 0.6
        }
      }
    } );

    options.layoutBoundsProperty.link( bounds => {
      this.maxWidth = Math.max( 1, bounds.width - 2 * controlBarMargin );
    } );
  }
}