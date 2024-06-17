import EditModeBarNode from './EditModeBarNode.ts';
import { PopupNode } from './PopupNode.ts';
import { currentTheme, uiBigHelpFont, uiHeaderFont } from './Theme.ts';
import { UIRichText } from './UIRichText.ts';
import { ViewContext } from './ViewContext.ts';
import ViewStyleBarNode from './ViewStyleBarNode.ts';
import { showSectorViewModesProperty } from './puzzle/puzzleStyles.ts';

import { HBox, Node, Rectangle, VBox } from 'phet-lib/scenery';

export class HelpNode extends PopupNode {
  public constructor(viewContext: ViewContext) {
    // TODO: fix RichText, omg
    // @ts-expect-error
    window.phet.chipper.isFuzzEnabled = () => false;

    const editModeIcons = EditModeBarNode.getIcons();
    const viewModeIcons = ViewStyleBarNode.getIcons();

    const wrapIcon = (icon: Node) => {
      return new Node({
        children: [
          Rectangle.bounds(icon.bounds.dilated(3), {
            fill: currentTheme.uiButtonBaseColorProperty,
            stroke: currentTheme.uiButtonSelectedStrokeColorProperty,
            cornerRadius: 3,
          }),
          icon,
        ],
      });
    };

    const lineWrap = 650;

    super(
      new VBox({
        spacing: 10,
        align: 'left',
        children: [
          new UIRichText('Slitherlink', { font: uiHeaderFont }),
          new UIRichText(
            'Slitherlink is a logic puzzle where you draw a <strong>single continuous loop</strong> on a grid. The goal is to connect dots without crossing or overlapping, creating a loop that adheres to specific rules based on the numbers in some cells.',
            {
              lineWrap: lineWrap,
            },
          ),
          new VBox({
            spacing: 2,
            align: 'left',
            children: [
              new UIRichText('The loop must satisfy the following rules:'),
              new UIRichText('The loop cannot cross or touch itself.', { layoutOptions: { leftMargin: 20 } }),
              new UIRichText('Each numbered cell must have exactly that number of sides in the loop.', {
                layoutOptions: { leftMargin: 20 },
              }),
            ],
          }),
          new UIRichText('Solving', { font: uiHeaderFont }),
          new UIRichText('<a href="{{solvingGuide}}">See the Solving Guide</a>', {
            font: uiBigHelpFont,
            links: {
              solvingGuide: './',
            },
            layoutOptions: { align: 'center' },
          }),
          new UIRichText('Edit Modes', { font: uiHeaderFont }),
          new VBox({
            spacing: 5,
            align: 'left',
            children: [
              new HBox({
                spacing: 10,
                children: [wrapIcon(editModeIcons.edgeIcon), new UIRichText('Click/tap adds a line')],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(editModeIcons.edgeReversedIcon),
                  new UIRichText('Click/tap adds an X (marking where a line will not go)'),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(editModeIcons.faceColorInsideIcon),
                  new UIRichText('Sets the color of a cell to the inside color'),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(editModeIcons.faceColorOutsideIcon),
                  new UIRichText('Sets the color of a cell to the outside color'),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(editModeIcons.faceColorMatchIcon),
                  new UIRichText('Click/tap on one cell, then click/tap on another to make them the same color'),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(editModeIcons.sectorIcon),
                  new UIRichText('Click/tap to pop up a selector, then select the sector color'),
                ],
                visibleProperty: showSectorViewModesProperty,
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(editModeIcons.eraserIcon),
                  new UIRichText('When activated, the line/cell/sector (from the modes above) will be erased'),
                ],
              }),
            ],
          }),
          new UIRichText(
            'The number keys (1-9) can switch between edit modes. E will activate the eraser when pressed.',
          ),
          new UIRichText(
            'The line/X and inside/outside color controls will cycle through the states (e.g. blank => line => X => blank) by default, but can be changed to toggle (e.g. blank => line, line => blank, X => line) in settings.',
            {
              lineWrap: lineWrap,
            },
          ),
          new UIRichText(
            'Right-click or shift-click will activate the "opposite" mode (e.g. in line mode, shift-click will set an X). This will work for lines <=> X\'s, inside <=> outside colors, and the final click for make same <=> make opposite colors.',
            {
              lineWrap: lineWrap,
            },
          ),
          new UIRichText('View Styles', { font: uiHeaderFont }),
          new VBox({
            spacing: 5,
            align: 'left',
            children: [
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(viewModeIcons.classicIcon),
                  new UIRichText("Classic Slitherlink style, just lines/X's."),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(viewModeIcons.basicLinesIcon),
                  new UIRichText(
                    'Cleaner lines (missing lines are X\'s, thin lines are "blank"), inside/outside colors',
                  ),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(viewModeIcons.basicFaceColoringIcon),
                  new UIRichText(
                    'Cleaner with face coloring (lighter/darker color pairs are inside/outside or outside/inside)',
                  ),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(viewModeIcons.pureFaceColoringIcon),
                  new UIRichText('Similar to above, but without showing lines at all'),
                ],
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(viewModeIcons.basicSectorsIcon),
                  new UIRichText('Cleaner lines, with sectors (see the solving guide)'),
                ],
                visibleProperty: showSectorViewModesProperty,
              }),
              new HBox({
                spacing: 10,
                children: [
                  wrapIcon(viewModeIcons.sectorsWithColorsIcon),
                  new UIRichText('Cleaner lines with colors and sectors (see the solving guide)'),
                ],
                visibleProperty: showSectorViewModesProperty,
              }),
            ],
          }),
          new UIRichText('About / Contact', { font: uiHeaderFont }),
          new UIRichText(
            'My name is Jonathan Olson, and I created this Slitherlink interface to explore the limits of solving techniques and to provide a seamless experience on both desktop and mobile. I value your feedback and would love to hear any questions, comments, or suggestions. Please reach out to me at <a href="{{email}}">jonathan.olson@colorado.edu</a>.',
            {
              lineWrap: lineWrap,
              links: {
                email: 'mailto:jonathan.olson@colorado.edu',
              },
            },
          ),
        ],
      }),
      viewContext,
    );
  }
}
