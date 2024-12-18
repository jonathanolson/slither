import { fontAwesomeArrowsAltShape, fontAwesomePencilShape } from './FontAwesomeShape.ts';
import PanDragMode, { panDragModeProperty } from './PanDragMode.ts';
import { controlBarMargin, currentTheme, rectangularButtonAppearanceStrategy } from './Theme.ts';
import { TooltipListener } from './TooltipListener.ts';
import { UIRectangularPushButton } from './UIRectangularPushButton.ts';
import UIRectangularRadioButtonGroup from './UIRectangularRadioButtonGroup.ts';
import { UIStickyToggleButtonAppearanceStrategy } from './UIStickyToggleButtonAppearanceStrategy.ts';
import { UIStickyToggleContentAppearanceStrategy } from './UIStickyToggleContentAppearanceStrategy.ts';
import { ViewContext } from './ViewContext.ts';

import { Matrix3 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { combineOptions } from 'phet-lib/phet-core';
import { AlignGroup, HBox, Line, Node, Path, Rectangle, VSeparator } from 'phet-lib/scenery';
import { BooleanRectangularStickyToggleButton, BooleanRectangularStickyToggleButtonOptions } from 'phet-lib/sun';

import EditMode, { editModeProperty, eraserEnabledProperty } from '../model/puzzle/EditMode.ts';

const HIDE_ERASE = false;

// TODO: support a background node with more complexity in the future?
export default class EditModeBarNode extends HBox {
  public constructor(viewContext: ViewContext) {
    const tooltipListener = new TooltipListener(viewContext);

    const wrapIcon = (icon: Node) => {
      return new Node({
        scale: 1.3,
        children: [icon],
      });
    };

    const {
      edgeIcon,
      edgeReversedIcon,
      faceColorInsideIcon,
      faceColorOutsideIcon,
      faceColorMatchIcon,
      faceColorOppositeIcon,
      sectorIcon,
      eraserIcon,
      panIcon,
      dragIcon,
    } = EditModeBarNode.getIcons();

    const editModeRadioButtonGroup = new UIRectangularRadioButtonGroup<EditMode>(
      editModeProperty,
      [
        {
          value: EditMode.EDGE_STATE,
          labelContent: 'Edge Edit Mode',
          createNode: () => wrapIcon(edgeIcon),
          options: {
            visibleProperty: EditMode.EDGE_STATE.isEnabledProperty,
          },
        },
        {
          value: EditMode.EDGE_STATE_REVERSED,
          labelContent: 'Edge Reversed Edit Mode',
          createNode: () => wrapIcon(edgeReversedIcon),
          options: {
            visibleProperty: EditMode.EDGE_STATE_REVERSED.isEnabledProperty,
          },
        },
        {
          value: EditMode.FACE_COLOR_INSIDE,
          labelContent: 'Face Color Inside Edit Mode',
          createNode: () => wrapIcon(faceColorInsideIcon),
          options: {
            visibleProperty: EditMode.FACE_COLOR_INSIDE.isEnabledProperty,
          },
        },
        {
          value: EditMode.FACE_COLOR_OUTSIDE,
          labelContent: 'Face Color Outside Edit Mode',
          createNode: () => wrapIcon(faceColorOutsideIcon),
          options: {
            visibleProperty: EditMode.FACE_COLOR_OUTSIDE.isEnabledProperty,
          },
        },
        {
          value: EditMode.FACE_COLOR_MATCH,
          labelContent: 'Face Color Match Edit Mode',
          createNode: () => wrapIcon(faceColorMatchIcon),
          options: {
            visibleProperty: EditMode.FACE_COLOR_MATCH.isEnabledProperty,
          },
        },
        {
          value: EditMode.FACE_COLOR_OPPOSITE,
          labelContent: 'Face Color Opposite Edit Mode',
          createNode: () => wrapIcon(faceColorOppositeIcon),
          options: {
            visibleProperty: EditMode.FACE_COLOR_OPPOSITE.isEnabledProperty,
          },
        },
        {
          value: EditMode.SECTOR_STATE,
          labelContent: 'Sector Edit Mode',
          createNode: () => wrapIcon(sectorIcon),
          options: {
            visibleProperty: EditMode.SECTOR_STATE.isEnabledProperty,
          },
        },
      ],
      {
        spacing: 15,
        layoutOptions: {
          grow: 1,
        },
      },
    );

    editModeRadioButtonGroup.children.forEach((child) => child.addInputListener(tooltipListener));

    const commonButtonOptions = {
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      baseColor: currentTheme.uiButtonBaseColorProperty,
      disabledColor: currentTheme.uiButtonDisabledColorProperty,

      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
    } as const;

    const eraserButton = new BooleanRectangularStickyToggleButton(
      eraserEnabledProperty,
      combineOptions<BooleanRectangularStickyToggleButtonOptions>({}, commonButtonOptions, {
        accessibleName: 'Eraser Mode (Toggle)',
        content: wrapIcon(eraserIcon),
        buttonAppearanceStrategy: UIStickyToggleButtonAppearanceStrategy,
        contentAppearanceStrategy: UIStickyToggleContentAppearanceStrategy,
      }),
    );
    eraserButton.addInputListener(tooltipListener);

    const wrappedPanIcon = wrapIcon(panIcon);
    const wrappedDragIcon = wrapIcon(dragIcon);
    const panDragIcon = new Node();
    panDragModeProperty.link((mode) => {
      panDragIcon.children = [mode === PanDragMode.PAN_ONLY ? wrappedPanIcon : wrappedDragIcon];
    });

    const panDragButton = new UIRectangularPushButton({
      content: panDragIcon,
      listener: () => {
        panDragModeProperty.value =
          panDragModeProperty.value === PanDragMode.PAN_ONLY ? PanDragMode.DRAG_ONLY : PanDragMode.PAN_ONLY;
      },
    });
    panDragModeProperty.link((mode) => {
      panDragButton.accessibleName = mode === PanDragMode.PAN_ONLY ? 'Pan Mode (toggle)' : 'Drag Input Mode (toggle)';
    });
    panDragButton.addInputListener(tooltipListener);

    super({
      spacing: 13,
      stretch: true,
      children: [editModeRadioButtonGroup, ...(HIDE_ERASE ? [] : [new VSeparator(), eraserButton, panDragButton])],
    });

    // TODO: target buttons more directly?

    viewContext.layoutBoundsProperty.link((bounds) => {
      this.maxWidth = Math.max(1, bounds.width - 2 * controlBarMargin);
    });
  }

  public static getIcons() {
    const edgeIcon = new Line(0, 0, 15, 0, {
      stroke: currentTheme.uiButtonForegroundProperty,
      lineWidth: 4,
      lineCap: 'round',
    });

    const halfSize = 6;
    const xShape = new Shape()
      .moveTo(-halfSize, -halfSize)
      .lineTo(halfSize, halfSize)
      .moveTo(-halfSize, halfSize)
      .lineTo(halfSize, -halfSize);

    const edgeReversedIcon = new Path(xShape, {
      stroke: currentTheme.uiButtonForegroundProperty,
      lineWidth: 2,
    });

    const faceColorOutsideIcon = new Node({
      children: [
        new Rectangle(0, 0, 14, 14, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiButtonFaceOutsideColorProperty,
        }),
      ],
    });

    const faceColorInsideIcon = new Node({
      children: [
        new Rectangle(0, 0, 14, 14, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiButtonFaceInsideColorProperty,
        }),
      ],
    });

    const faceColorMatchIcon = new Node({
      children: [
        new Rectangle(0, 0, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiForegroundColorProperty,
        }),
        new Rectangle(7, 7, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiForegroundColorProperty,
        }),
      ],
    });

    const faceColorOppositeIcon = new Node({
      children: [
        new Rectangle(0, 0, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiForegroundColorProperty,
        }),
        new Rectangle(7, 7, 7, 7, {
          stroke: currentTheme.uiButtonForegroundProperty,
          fill: currentTheme.uiBackgroundColorProperty,
        }),
      ],
    });

    const sectorIcon = new Node({
      children: [
        new Path(new Shape().moveTo(0, 14).lineTo(0, 0).lineTo(14, 0), {
          stroke: currentTheme.uiButtonForegroundProperty,
        }),
        new Path(new Shape().arc(0, 0, 7, 0, Math.PI / 2, false), {
          stroke: currentTheme.uiButtonForegroundProperty,
        }),
      ],
    });

    const eraserWidth = 17;
    const eraserTipWidth = 6;
    const eraserHeight = 7;
    const eraserCornerRadius = 2;
    const eraserDiagonal = eraserHeight / Math.sqrt(2);
    const eraserIcon = new Node({
      children: [
        new Node({
          rotation: -Math.PI / 4,
          children: [
            new Rectangle(0, 0, eraserWidth, eraserHeight, {
              stroke: currentTheme.uiButtonForegroundProperty,
              fill: currentTheme.uiButtonInvertedForegroundProperty,
              cornerRadius: eraserCornerRadius,
            }),
            new Rectangle(eraserTipWidth, 0, eraserWidth - eraserTipWidth, eraserHeight, {
              fill: currentTheme.uiButtonForegroundProperty,
              cornerRadius: eraserCornerRadius,
            }),
          ],
        }),
        new Line(eraserDiagonal, eraserDiagonal - 0.5, eraserDiagonal + 12, eraserDiagonal - 0.5, {
          stroke: currentTheme.uiButtonForegroundProperty,
          lineDash: [5, 1, 3, 1, 2],
        }),
      ],
    });

    const panIcon = new Path(fontAwesomeArrowsAltShape.transformed(Matrix3.rotationZ(Math.PI / 4)), {
      fill: currentTheme.uiButtonForegroundProperty,
      maxWidth: 14,
      maxHeight: 14,
    });

    const dragIcon = new Node({
      children: [
        new Path(fontAwesomePencilShape, {
          fill: currentTheme.uiButtonForegroundProperty,
          matrix: Matrix3.Y_REFLECTION,
          maxWidth: 14,
          maxHeight: 14,
        }),
        new Path(new Shape().moveTo(0, 1.5).lineTo(12, 1.5), {
          stroke: currentTheme.uiButtonForegroundProperty,
          lineDash: [9, 1, 2],
        }),
      ],
    });

    const alignGroup = new AlignGroup();

    return {
      edgeIcon: alignGroup.createBox(edgeIcon),
      edgeReversedIcon: alignGroup.createBox(edgeReversedIcon),
      faceColorInsideIcon: alignGroup.createBox(faceColorInsideIcon),
      faceColorOutsideIcon: alignGroup.createBox(faceColorOutsideIcon),
      faceColorMatchIcon: alignGroup.createBox(faceColorMatchIcon),
      faceColorOppositeIcon: alignGroup.createBox(faceColorOppositeIcon),
      sectorIcon: alignGroup.createBox(sectorIcon),
      eraserIcon: alignGroup.createBox(eraserIcon),
      panIcon: alignGroup.createBox(panIcon),
      dragIcon: alignGroup.createBox(dragIcon),
    };
  }
}
