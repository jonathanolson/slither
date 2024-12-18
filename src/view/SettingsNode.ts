import { PopupNode } from './PopupNode.ts';
import {
  allVertexStateVisibleProperty,
  availableThemes,
  currentTheme,
  edgesHaveColorsProperty,
  edgesVisibleProperty,
  faceColorThresholdProperty,
  faceColorsVisibleProperty,
  faceStateVisibleProperty,
  faceValueStyleProperty,
  faceValueStyles,
  joinedLinesCapProperty,
  joinedLinesJoinProperty,
  lineCaps,
  lineJoins,
  popupColorEditor,
  redLineStyleProperty,
  redLineStyles,
  redLineVisibleProperty,
  redXsAlignedProperty,
  redXsVisibleProperty,
  sectorsNextToEdgesVisibleProperty,
  sectorsTrivialVisibleProperty,
  sectorsVisibleProperty,
  smallVertexProperty,
  themeProperty,
  uiFont,
  uiHeaderFont,
  vertexStateVisibleProperty,
  vertexStyleProperty,
  vertexStyles,
  verticesVisibleProperty,
  whiteLineVisibleProperty,
} from './Theme.ts';
import { TooltipListener } from './TooltipListener.ts';
import { UIText } from './UIText.ts';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { UITextPushButton } from './UITextPushButton.ts';
import { UITextSwitch } from './UITextSwitch.ts';
import { ViewContext } from './ViewContext.ts';
import ViewStyleBarNode from './ViewStyleBarNode.ts';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';
import {
  basicFaceColoringPuzzleStyle,
  basicLinesPuzzleStyle,
  basicSectorsPuzzleStyle,
  classicPuzzleStyle,
  customPuzzleStyle,
  faceStatePuzzleStyle,
  pureFaceColorPuzzleStyle,
  puzzleStyleProperty,
  sectorsWithColorsPuzzleStyle,
  showPuzzleStyleProperty,
  showPuzzleTimerProperty,
  showSectorViewModesProperty,
  vertexStatePuzzleStyle,
} from './puzzle/puzzleStyles.ts';

import { BooleanProperty, DerivedProperty, MappedProperty, Property } from 'phet-lib/axon';
import { GridBox, HBox, Node, Rectangle, Text, VBox } from 'phet-lib/scenery';

import SlitherQueryParameters from '../SlitherQueryParameters.ts';

import { showLayoutTestProperty } from '../model/board/layout/layout.ts';
import {
  dimCompletedNumbersProperty,
  highlightIncorrectMovesProperty,
  highlightIncorrectNumbersProperty,
  highlightIntersectionsProperty,
  showUndoRedoAllProperty,
  uiHintUsesBuiltInSolveProperty,
} from '../model/puzzle/PuzzleModel.ts';
import StateTransitionMode, { stateTransitionModeProperty } from '../model/puzzle/StateTransitionMode.ts';
import {
  autoSolveDoubleMinusOneFacesProperty,
  autoSolveEnabledProperty,
  autoSolveFaceColorParityColorsProperty,
  autoSolveFaceColorParityPartialReductionProperty,
  autoSolveFaceColorParityToBlackProperty,
  autoSolveFaceColorParityToRedProperty,
  autoSolveFaceColorToBlackProperty,
  autoSolveFaceColorToRedProperty,
  autoSolveFaceToBlackProperty,
  autoSolveFaceToFaceColorsProperty,
  autoSolveFaceToRedProperty,
  autoSolveFaceToSectorsProperty,
  autoSolveSimpleFaceToBlackProperty,
  autoSolveSimpleFaceToRedProperty,
  autoSolveSimpleLoopToBlackProperty,
  autoSolveSimpleLoopToRedProperty,
  autoSolveSimpleLoopsProperty,
  autoSolveSimpleSectorProperty,
  autoSolveSimpleVertexAlmostEmptyToRedProperty,
  autoSolveSimpleVertexForcedLineToBlackProperty,
  autoSolveSimpleVertexJointToRedProperty,
  autoSolveStaticFaceSectorProperty,
  autoSolveToBlackProperty,
  autoSolveVertexColorToFaceProperty,
  autoSolveVertexToBlackEdgeProperty,
  autoSolveVertexToFaceColorProperty,
  autoSolveVertexToRedEdgeProperty,
  autoSolveVertexToSectorsProperty,
} from '../model/solver/autoSolver';

import { LocalStorageBooleanProperty } from '../util/localStorage.ts';

import _ from '../workarounds/_.ts';

const DEBUG_COLORS = false;

export const advancedSettingsVisibleProperty = new LocalStorageBooleanProperty(
  'advancedSettingsVisibleProperty',
  false,
);

export class SettingsNode extends PopupNode {
  public constructor(viewContext: ViewContext) {
    const tooltipListener = new TooltipListener(viewContext);

    const autoSolveNode = new VBox({
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text('Solve After Every Move', {
          font: uiHeaderFont,
          fill: currentTheme.uiForegroundColorProperty,
        }),
        new GridBox({
          xAlign: 'left',
          yAlign: 'top',
          xSpacing: 20,
          ySpacing: 8,
          columns: [
            [
              new UITextCheckbox('Vertex Joint X', autoSolveSimpleVertexJointToRedProperty),
              new UITextCheckbox('Vertex Forced Line', autoSolveSimpleVertexForcedLineToBlackProperty),
              new UITextCheckbox('Vertex Forced X', autoSolveSimpleVertexAlmostEmptyToRedProperty),
              new UITextCheckbox('Completed Face X', autoSolveSimpleFaceToRedProperty),
              new UITextCheckbox('Completed Face Lines', autoSolveSimpleFaceToBlackProperty),
              new UITextCheckbox('Simple Loop X', autoSolveSimpleLoopToRedProperty),
              new UITextCheckbox('Simple Loop Lines', autoSolveSimpleLoopToBlackProperty),
              new UITextCheckbox('Double Minus One Faces', autoSolveDoubleMinusOneFacesProperty),
              new UITextCheckbox('1/N-1 Sectors', autoSolveStaticFaceSectorProperty),
              new UITextCheckbox('Simple Sectors', autoSolveSimpleSectorProperty),
              new UITextCheckbox('Vertex X', autoSolveVertexToRedEdgeProperty),
              new UITextCheckbox('Vertex Lines', autoSolveVertexToBlackEdgeProperty),
              new UITextCheckbox('Vertex Sectors', autoSolveVertexToSectorsProperty),
              new UITextCheckbox('Vertex Faces', autoSolveVertexToFaceColorProperty),
            ],
            [
              new UITextCheckbox('Color X', autoSolveFaceColorToRedProperty),
              new UITextCheckbox('Color Lines', autoSolveFaceColorToBlackProperty),
              new UITextCheckbox('Color Parity X', autoSolveFaceColorParityToRedProperty),
              new UITextCheckbox('Color Parity Lines', autoSolveFaceColorParityToBlackProperty),
              new UITextCheckbox('Color Parity Colors', autoSolveFaceColorParityColorsProperty),
              new UITextCheckbox('Color Parity Partial', autoSolveFaceColorParityPartialReductionProperty),
              new UITextCheckbox('Vertex/Color To Face', autoSolveVertexColorToFaceProperty),
              new UITextCheckbox('Face X', autoSolveFaceToRedProperty),
              new UITextCheckbox('Face Lines', autoSolveFaceToBlackProperty),
              new UITextCheckbox('Face Sectors', autoSolveFaceToSectorsProperty),
              new UITextCheckbox('Face Color', autoSolveFaceToFaceColorsProperty),
            ],
          ],
        }),
      ],
    });

    // // TODO: remove this hack, ComboBox and other files...
    // window.phet.chipper = window.phet.chipper || {};
    // window.phet.chipper.queryParameters = window.phet.chipper.queryParameters || {};
    // window.phet.chipper.queryParameters.stringTest = null;
    // window.phet.chipper.isFuzzEnabled = () => false;
    //
    // const themeSelector = new ComboBox( themeProperty, availableThemes.map( theme => {
    //   return {
    //     value: theme,
    //     createNode: () => new Text( theme.name, { font: popupFont } ),
    //     a11yName: theme.name
    //   };
    // } ), topNode, {
    //
    // } );

    const themeNode = getVerticalRadioButtonGroup(
      'Theme',
      themeProperty,
      availableThemes.map((theme) => {
        return {
          value: theme,
          createNode: () =>
            new Text(theme.name, {
              font: uiFont,
              fill: currentTheme.uiForegroundColorProperty,
            }),
          a11yName: theme.name,
        };
      }),
    );

    const themeEditButtons = new VBox({
      spacing: 15,
      stretch: true,
      visible: SlitherQueryParameters.debugColors,
      children: availableThemes
        .filter((theme) => theme.isEditable)
        .map(
          (theme) =>
            new UITextPushButton(`Edit ${theme.name} Theme`, {
              listener: () => {
                popupColorEditor(theme);
              },
            }),
        ),
    });

    const displayNode = new VBox({
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text('Puzzle Display', {
          font: uiHeaderFont,
          fill: currentTheme.uiForegroundColorProperty,
        }),
        new GridBox({
          xAlign: 'left',
          yAlign: 'top',
          xSpacing: 20,
          ySpacing: 8,
          columns: [
            [
              new UITextCheckbox('Lines Visible', edgesVisibleProperty),
              new UITextCheckbox('Color Lines', edgesHaveColorsProperty, {
                enabledProperty: edgesVisibleProperty,
                layoutOptions: {
                  leftMargin: 20,
                },
              }),
              new UITextCheckbox('Face Colors Visible', faceColorsVisibleProperty),
              new UITextCheckbox('Sectors Visible', sectorsVisibleProperty),
              new UITextCheckbox('Sectors Next to Edges', sectorsNextToEdgesVisibleProperty, {
                advanced: true,
                enabledProperty: sectorsVisibleProperty,
                layoutOptions: {
                  leftMargin: 20,
                },
              }),
              new UITextCheckbox('Trivial Sectors', sectorsTrivialVisibleProperty, {
                advanced: true,
                enabledProperty: sectorsVisibleProperty,
                layoutOptions: {
                  leftMargin: 20,
                },
              }),
              new UITextCheckbox('Vertex State', vertexStateVisibleProperty),
              new UITextCheckbox('All Vertex State', allVertexStateVisibleProperty, {
                advanced: true,
                enabledProperty: vertexStateVisibleProperty,
                layoutOptions: {
                  leftMargin: 20,
                },
              }),
              new UITextCheckbox('Face State', faceStateVisibleProperty, {
                advanced: true,
              }),
            ],
            [
              new UITextCheckbox('Possible Line Visible', whiteLineVisibleProperty),
              new UITextCheckbox('Impossible Line Visible', redLineVisibleProperty),
              new UITextCheckbox('Vertices Visible', verticesVisibleProperty),
              new UITextCheckbox('Vertices Small', smallVertexProperty),
              new UITextCheckbox('Red X Visible', redXsVisibleProperty),
              new UITextCheckbox('Red X Aligned', redXsAlignedProperty),
            ],
          ],
        }),

        new HBox({
          spacing: 20,
          visibleProperty: advancedSettingsVisibleProperty,
          children: [
            getVerticalRadioButtonGroup(
              'Line Join',
              joinedLinesJoinProperty,
              lineJoins.map((join) => {
                return {
                  value: join,
                  createNode: () =>
                    new Text(join, {
                      font: uiFont,
                      fill: currentTheme.uiForegroundColorProperty,
                    }),
                  labelContent: join,
                };
              }),
            ),
            getVerticalRadioButtonGroup(
              'Line Cap',
              joinedLinesCapProperty,
              lineCaps.map((cap) => {
                return {
                  value: cap,
                  createNode: () =>
                    new Text(cap, {
                      font: uiFont,
                      fill: currentTheme.uiForegroundColorProperty,
                    }),
                  labelContent: cap,
                };
              }),
            ),
            getVerticalRadioButtonGroup(
              'Vertex Style',
              vertexStyleProperty,
              vertexStyles.map((vertexStyle) => {
                return {
                  value: vertexStyle,
                  createNode: () =>
                    new Text(vertexStyle, {
                      font: uiFont,
                      fill: currentTheme.uiForegroundColorProperty,
                    }),
                  labelContent: vertexStyle,
                };
              }),
            ),
            getVerticalRadioButtonGroup(
              'Impossible Line Style',
              redLineStyleProperty,
              redLineStyles.map((redLineStyle) => {
                return {
                  value: redLineStyle,
                  createNode: () =>
                    new Text(redLineStyle, {
                      font: uiFont,
                      fill: currentTheme.uiForegroundColorProperty,
                    }),
                  labelContent: redLineStyle,
                };
              }),
            ),
            getVerticalRadioButtonGroup(
              'Face Value Style',
              faceValueStyleProperty,
              faceValueStyles.map((faceValueStyle) => {
                return {
                  value: faceValueStyle,
                  createNode: () =>
                    new Text(faceValueStyle, {
                      font: uiFont,
                      fill: currentTheme.uiForegroundColorProperty,
                    }),
                  labelContent: faceValueStyle,
                };
              }),
            ),
          ],
        }),
      ],
    });

    const faceColorThresholdNode = getVerticalRadioButtonGroup('Face Color Threshold', faceColorThresholdProperty, [
      {
        value: 1,
        createNode: () => new UIText('Show All'),
        labelContent: 'Show All',
      },
      {
        value: 2,
        createNode: () => new UIText('2+'),
        labelContent: '2+',
      },
      {
        value: 3,
        createNode: () => new UIText('3+'),
        labelContent: '3+',
      },
      {
        value: 5,
        createNode: () => new UIText('5+'),
        labelContent: '5+',
      },
      {
        value: 10,
        createNode: () => new UIText('10+'),
        labelContent: '10+',
      },
      {
        value: Number.POSITIVE_INFINITY,
        createNode: () => new UIText('Only Outside'),
        labelContent: 'Only Outside',
      },
    ]);

    const topLevelNode = new VBox({
      spacing: 8,
      align: 'left',
      stretch: true,
      children: [
        new UITextSwitch(autoSolveEnabledProperty, 'Auto-Solve'),
        new UITextSwitch(autoSolveToBlackProperty, 'Add Lines', {
          layoutOptions: {
            leftMargin: 20,
          },
          enabledProperty: autoSolveEnabledProperty,
        }),
        new UITextSwitch(autoSolveSimpleLoopsProperty, 'Simple Loops', {
          layoutOptions: {
            leftMargin: 20,
          },
          enabledProperty: autoSolveEnabledProperty,
        }),

        new UIText('Highlights'),
        new UITextSwitch(dimCompletedNumbersProperty, 'Dim Completed Numbers', {
          layoutOptions: {
            leftMargin: 20,
          },
        }),
        new UITextSwitch(highlightIncorrectNumbersProperty, 'Highlight Incorrect Numbers', {
          layoutOptions: {
            leftMargin: 20,
          },
        }),
        new UITextSwitch(highlightIncorrectMovesProperty, 'Highlight Incorrect Moves', {
          layoutOptions: {
            leftMargin: 20,
          },
        }),
        new UITextSwitch(highlightIntersectionsProperty, 'Highlight Intersecting Lines', {
          layoutOptions: {
            leftMargin: 20,
          },
        }),

        new UITextSwitch(
          new MappedProperty(stateTransitionModeProperty, {
            bidirectional: true,
            map: (mode) => mode === StateTransitionMode.CYCLIC,
            inverseMap: (value) => (value ? StateTransitionMode.CYCLIC : StateTransitionMode.TOGGLE),
          }) as unknown as Property<boolean>,
          'Cycle Between States',
        ),
        new UITextSwitch(showPuzzleStyleProperty, 'Show View Style Controls'),
        new UITextSwitch(redLineVisibleProperty, 'Show Impossible Lines'),
        new UITextSwitch(showPuzzleTimerProperty, 'Show Elapsed Time'),
        new UITextSwitch(showSectorViewModesProperty, 'Enable Sector View Styles'),
        new UITextSwitch(showUndoRedoAllProperty, 'Show Undo-All / Redo-All', {
          advanced: true,
        }),
        new UITextSwitch(showLayoutTestProperty, 'Show Layout Test', {
          advanced: true,
        }),
        new UITextSwitch(uiHintUsesBuiltInSolveProperty, 'Solve Uses Built-In', {
          advanced: true,
        }),
      ],
    });

    const showCustomProperty = new BooleanProperty(false);
    const customVisibleProperty = DerivedProperty.and([advancedSettingsVisibleProperty, showCustomProperty]);

    const viewStyleIcons = ViewStyleBarNode.getIcons();
    const getViewLabel = (icon: Node, text: string) =>
      new HBox({
        spacing: 5,
        children: [new UIText(text), icon],
      });

    const viewStyleNode = getVerticalRadioButtonGroup('View Style', puzzleStyleProperty, [
      {
        value: classicPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.classicIcon, 'Classic'),
        labelContent: 'Classic',
      },
      {
        value: basicLinesPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.basicLinesIcon, 'Lines'),
        labelContent: 'Lines',
      },
      {
        value: basicFaceColoringPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.basicFaceColoringIcon, 'Lines and Colors'),
        labelContent: 'Lines and Colors',
      },
      {
        value: pureFaceColorPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.pureFaceColoringIcon, 'Colors'),
        labelContent: 'Colors',
      },
      {
        value: basicSectorsPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.basicSectorsIcon, 'Sectors'),
        labelContent: 'Sectors',
        options: {
          visibleProperty: showSectorViewModesProperty,
        },
      },
      {
        value: sectorsWithColorsPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.sectorsWithColorsIcon, 'Sectors and Colors'),
        labelContent: 'Sectors and Colors',
        options: {
          visibleProperty: showSectorViewModesProperty,
        },
      },
      {
        value: vertexStatePuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.vertexStateIcon, 'Vertex State'),
        labelContent: 'Vertex State',
        options: {
          visibleProperty: advancedSettingsVisibleProperty,
        },
      },
      {
        value: faceStatePuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.faceStateIcon, 'Face State'),
        labelContent: 'Face State',
        options: {
          visibleProperty: advancedSettingsVisibleProperty,
        },
      },
      {
        // TODO: only show this when custom is enabled!!!
        value: customPuzzleStyle,
        createNode: () => getViewLabel(viewStyleIcons.customIcon, 'Custom'),
        labelContent: 'Custom',
        options: {
          visibleProperty: advancedSettingsVisibleProperty,
        },
      },
    ]);

    const customSwitch = new UITextSwitch(showCustomProperty, 'Show Custom Options', {
      advanced: true,
    });

    const customAccordionContent = new VBox({
      spacing: 20,
      align: 'left',
      children: [
        new HBox({
          spacing: 20,
          children: [autoSolveNode, faceColorThresholdNode],
        }),
        displayNode,
      ],
      visibleProperty: customVisibleProperty,
    });

    const reloadToDefaultsButton = new UITextPushButton('Reload to Defaults', {
      accessibleName: 'Clear all settings/data, and reload the page',
      listener: () => {
        localStorage.clear();

        window.location.reload();
      },
      advanced: true,
    });
    reloadToDefaultsButton.addInputListener(tooltipListener);

    const debugColors =
      DEBUG_COLORS ?
        new Node({
          children: _.range(0, 360).map((hue) => {
            return new Node({
              children: [
                new Rectangle(hue, 0, 1.5, 20, {
                  fill: new DerivedProperty([currentTheme.simpleRegionHueLUTProperty], (colors) => colors[hue]),
                }),
                new Rectangle(hue, 60, 1.5, 20, {
                  fill: new DerivedProperty([currentTheme.faceColorLightHueLUTProperty], (colors) => colors[hue]),
                }),
                new Rectangle(hue, 80, 1.5, 20, {
                  fill: new DerivedProperty([currentTheme.faceColorBasicHueLUTProperty], (colors) => colors[hue]),
                }),
                new Rectangle(hue, 100, 1.5, 20, {
                  fill: new DerivedProperty([currentTheme.faceColorDarkHueLUTProperty], (colors) => colors[hue]),
                }),
              ],
            });
          }),
        })
      : new Node();

    super(
      new VBox({
        spacing: 20,
        align: 'left',
        stretch: true,
        children: [
          topLevelNode,
          debugColors,
          new HBox({
            align: 'top',
            spacing: 30,
            children: [viewStyleNode, themeNode, themeEditButtons],
          }),
          customSwitch,
          customAccordionContent,
          reloadToDefaultsButton,
          new UITextSwitch(advancedSettingsVisibleProperty, 'Show Advanced Settings'),
        ],
      }),
      viewContext,
    );
  }
}
