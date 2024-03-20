import { TReadOnlyProperty } from 'phet-lib/axon';
import { RectangularRadioButtonGroup } from 'phet-lib/sun';
import { Bounds2 } from 'phet-lib/dot';
import { controlBarMargin, uiBackgroundColorProperty, uiButtonBaseColorProperty, uiButtonDeselectedStrokeColorProperty, uiButtonDisabledColorProperty, uiButtonForegroundProperty, uiButtonSelectedStrokeColorProperty, uiForegroundColorProperty } from './Theme.ts';
import EditMode, { editModeProperty } from '../model/puzzle/EditMode.ts';
import { Line, Node, Path, Rectangle } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';

export type EditModeBarNodeOptions = {
  layoutBoundsProperty: TReadOnlyProperty<Bounds2>;
};

// TODO: support a background node with more complexity in the future?
export default class EditModeBarNode extends RectangularRadioButtonGroup<EditMode> {
  public constructor(
    options: EditModeBarNodeOptions
  ) {

    const edgeIcon = new Line( 0, 0, 15, 0, {
      stroke: uiButtonForegroundProperty,
      lineWidth: 4,
      lineCap: 'round'
    } );

    const halfSize = 6;
    const xShape = new Shape()
      .moveTo( -halfSize, -halfSize )
      .lineTo( halfSize, halfSize )
      .moveTo( -halfSize, halfSize )
      .lineTo( halfSize, -halfSize );

    const edgeReversedIcon = new Path( xShape, {
      stroke: uiButtonForegroundProperty,
      lineWidth: 2
    } );

    const faceColorMatchIcon = new Node( {
      children: [
        new Rectangle( 0, 0, 7, 7, {
          stroke: uiButtonForegroundProperty,
          fill: uiForegroundColorProperty
        } ),
        new Rectangle( 7, 7, 7, 7, {
          stroke: uiButtonForegroundProperty,
          fill: uiForegroundColorProperty
        } ),
      ]
    } );

    const faceColorOppositeIcon = new Node( {
      children: [
        new Rectangle( 0, 0, 7, 7, {
          stroke: uiButtonForegroundProperty,
          fill: uiForegroundColorProperty
        } ),
        new Rectangle( 7, 7, 7, 7, {
          stroke: uiButtonForegroundProperty,
          fill: uiBackgroundColorProperty
        } ),
      ]
    } );

    const sectorIcon = new Node( {
      children: [
        new Path( new Shape().moveTo( 0, 14 ).lineTo( 0, 0 ).lineTo( 14, 0 ), {
          stroke: uiButtonForegroundProperty
        }  ),
        new Path( new Shape().arc( 0, 0, 7, 0, Math.PI / 2, false ), {
          stroke: uiButtonForegroundProperty
        } )
      ]
    } );

    super( editModeProperty, [
      {
        value: EditMode.EDGE_STATE,
        labelContent: 'Edge',
        createNode: () => edgeIcon,
        options: {
          visibleProperty: EditMode.EDGE_STATE.isEnabledProperty
        }
      },
      {
        value: EditMode.EDGE_STATE_REVERSED,
        labelContent: 'Edge Reversed',
        createNode: () => edgeReversedIcon,
        options: {
          visibleProperty: EditMode.EDGE_STATE_REVERSED.isEnabledProperty
        }
      },
      {
        value: EditMode.FACE_COLOR_MATCH,
        labelContent: 'Face Color Match',
        createNode: () => faceColorMatchIcon,
        options: {
          visibleProperty: EditMode.FACE_COLOR_MATCH.isEnabledProperty
        }
      },
      {
        value: EditMode.FACE_COLOR_OPPOSITE,
        labelContent: 'Face Color Opposite',
        createNode: () => faceColorOppositeIcon,
        options: {
          visibleProperty: EditMode.FACE_COLOR_OPPOSITE.isEnabledProperty
        }
      },
      {
        value: EditMode.SECTOR_STATE,
        labelContent: 'Sector',
        createNode: () => sectorIcon,
        options: {
          visibleProperty: EditMode.SECTOR_STATE.isEnabledProperty
        }
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
          selectedStroke: uiButtonSelectedStrokeColorProperty, // TODO: create an option JUST for this type of thing
          deselectedStroke: uiButtonDeselectedStrokeColorProperty
          // overButtonOpacity: 0.8,
          // overStroke: null,
          // selectedLineWidth: 1.5,
          // selectedButtonOpacity: 1,
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