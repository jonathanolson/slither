import { controlBarMargin, currentTheme, rectangularButtonAppearanceStrategy } from './Theme.ts';
import EditMode, { editModeProperty, eraserEnabledProperty } from '../model/puzzle/EditMode.ts';
import { HBox, Line, Node, Path, Rectangle, VSeparator } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import UIRectangularRadioButtonGroup from './UIRectangularRadioButtonGroup.ts';
import { TooltipListener } from './TooltipListener.ts';
import { ViewContext } from './ViewContext.ts';
import { BooleanRectangularStickyToggleButton, BooleanRectangularStickyToggleButtonOptions } from 'phet-lib/sun';
import { combineOptions } from 'phet-lib/phet-core';

const HIDE_ERASE = true;

// TODO: support a background node with more complexity in the future?
export default class EditModeBarNode extends HBox {
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

    const eraserWidth = 17;
    const eraserTipWidth = 6;
    const eraserHeight = 7;
    const eraserCornerRadius = 2;
    const eraserDiagonal = eraserHeight / Math.sqrt( 2 );
    const eraserIcon = new Node( {
      children: [
        new Node( {
          rotation: -Math.PI / 4,
          children: [
            new Rectangle( 0, 0, eraserWidth, eraserHeight, {
              stroke: currentTheme.uiButtonForegroundProperty,
              fill: currentTheme.uiButtonInvertedForegroundProperty,
              cornerRadius: eraserCornerRadius,
            } ),
            new Rectangle( eraserTipWidth, 0, eraserWidth - eraserTipWidth, eraserHeight, {
              fill: currentTheme.uiButtonForegroundProperty,
              cornerRadius: eraserCornerRadius,
            } ),
          ]
        } ),
        new Line( eraserDiagonal, eraserDiagonal - 0.5, eraserDiagonal + 12, eraserDiagonal - 0.5, {
          stroke: currentTheme.uiButtonForegroundProperty,
          lineDash: [ 5, 1, 3, 1, 2 ],
        } )
      ]
    } );

    const tooltipListener = new TooltipListener( viewContext );

    const editModeRadioButtonGroup = new UIRectangularRadioButtonGroup<EditMode>( editModeProperty, [
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
    ], {
      layoutOptions: {
        grow: 1,
      }
    } );

    editModeRadioButtonGroup.children.forEach( child => child.addInputListener( tooltipListener ) );

    const commonButtonOptions = {
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      baseColor: currentTheme.uiButtonBaseColorProperty,
      disabledColor: currentTheme.uiButtonDisabledColorProperty,

      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    } as const;

    const eraserButton = new BooleanRectangularStickyToggleButton( eraserEnabledProperty, combineOptions<BooleanRectangularStickyToggleButtonOptions>( {}, commonButtonOptions, {
      accessibleName: 'Eraser Mode (Toggle)',
      content: eraserIcon,
    } ) );
    eraserButton.addInputListener( tooltipListener );

    super( {
      // TODO: better layout
      spacing: 10,
      stretch: true,
      children: [
        editModeRadioButtonGroup,
        ...( HIDE_ERASE ? [] : [
          new VSeparator(),
          eraserButton,
        ] ),
      ],
    } );

    // TODO: target buttons more directly?

    viewContext.layoutBoundsProperty.link( bounds => {
      this.maxWidth = Math.max( 1, bounds.width - 2 * controlBarMargin );
    } );
  }
}