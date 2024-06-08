import { controlBarMargin, currentTheme } from './Theme.ts';
import EditMode, { editModeProperty } from '../model/puzzle/EditMode.ts';
import { Line, Node, Path, Rectangle } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import UIRectangularRadioButtonGroup from './UIRectangularRadioButtonGroup.ts';
import { TooltipListener } from './TooltipListener.ts';
import { ViewContext } from './ViewContext.ts';

// TODO: support a background node with more complexity in the future?
export default class EditModeBarNode extends UIRectangularRadioButtonGroup<EditMode> {
  public constructor(
    viewContext: ViewContext,
  ) {

    const edgeIcon = new Line( 0, 0, 15, 0, {
      stroke: currentTheme.uiButtonForegroundProperty,
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
      stroke: currentTheme.uiButtonForegroundProperty,
      lineWidth: 2
    } );

    const faceColorMatchIcon = new Node( {
      children: [
        new Rectangle( 0, 0, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiForegroundColorProperty
        } ),
        new Rectangle( 7, 7, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiForegroundColorProperty
        } ),
      ]
    } );

    const faceColorOppositeIcon = new Node( {
      children: [
        new Rectangle( 0, 0, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiForegroundColorProperty
        } ),
        new Rectangle( 7, 7, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiBackgroundColorProperty
        } ),
      ]
    } );

    const sectorIcon = new Node( {
      children: [
        new Path( new Shape().moveTo( 0, 14 ).lineTo( 0, 0 ).lineTo( 14, 0 ), {
          stroke: currentTheme.uiButtonForegroundProperty
        }  ),
        new Path( new Shape().arc( 0, 0, 7, 0, Math.PI / 2, false ), {
          stroke: currentTheme.uiButtonForegroundProperty
        } )
      ]
    } );

    const tooltipListener = new TooltipListener( viewContext );

    super( editModeProperty, [
      {
        value: EditMode.EDGE_STATE,
        labelContent: 'Edge Edit Mode',
        createNode: () => edgeIcon,
        options: {
          visibleProperty: EditMode.EDGE_STATE.isEnabledProperty,
        }
      },
      {
        value: EditMode.EDGE_STATE_REVERSED,
        labelContent: 'Edge Reversed Edit Mode',
        createNode: () => edgeReversedIcon,
        options: {
          visibleProperty: EditMode.EDGE_STATE_REVERSED.isEnabledProperty,
        }
      },
      {
        value: EditMode.FACE_COLOR_MATCH,
        labelContent: 'Face Color Match Edit Mode',
        createNode: () => faceColorMatchIcon,
        options: {
          visibleProperty: EditMode.FACE_COLOR_MATCH.isEnabledProperty,
        }
      },
      {
        value: EditMode.FACE_COLOR_OPPOSITE,
        labelContent: 'Face Color Opposite Edit Mode',
        createNode: () => faceColorOppositeIcon,
        options: {
          visibleProperty: EditMode.FACE_COLOR_OPPOSITE.isEnabledProperty,
        }
      },
      {
        value: EditMode.SECTOR_STATE,
        labelContent: 'Sector Edit Mode',
        createNode: () => sectorIcon,
        options: {
          visibleProperty: EditMode.SECTOR_STATE.isEnabledProperty,
        }
      }
    ] );

    // TODO: target buttons more directly?
    this.children.forEach( child => child.addInputListener( tooltipListener ) );

    viewContext.layoutBoundsProperty.link( bounds => {
      this.maxWidth = Math.max( 1, bounds.width - 2 * controlBarMargin );
    } );
  }
}