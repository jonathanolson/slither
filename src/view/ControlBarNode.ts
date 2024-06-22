import {
  fontAwesomeBackwardShape,
  fontAwesomeForwardShape,
  fontAwesomeGearShape,
  fontAwesomeQuestionCircleShape,
  fontAwesomeStepBackwardShape,
  fontAwesomeStepForwardShape,
  toFontAwesomePath,
} from './FontAwesomeShape.ts';
import { GenNode } from './GenNode.ts';
import { HelpNode } from './HelpNode.ts';
import { SettingsNode } from './SettingsNode.ts';
import { ShareNode } from './ShareNode.ts';
import { controlBarFont, controlBarMargin, currentTheme, rectangularButtonAppearanceStrategy } from './Theme.ts';
import { TimerNode } from './TimerNode.ts';
import { TooltipListener } from './TooltipListener.ts';
import { ViewContext } from './ViewContext.ts';
import { showPuzzleTimerProperty } from './puzzle/puzzleStyles.ts';

import { DerivedProperty, DynamicProperty, TReadOnlyProperty, TinyProperty } from 'phet-lib/axon';
import { Shape } from 'phet-lib/kite';
import { combineOptions } from 'phet-lib/phet-core';
import { HBox } from 'phet-lib/scenery';
import {
  RectangularPushButton,
  RectangularPushButtonOptions,
  TextPushButton,
  TextPushButtonOptions,
} from 'phet-lib/sun';

import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import HintState from '../model/puzzle/HintState.ts';
import PuzzleModel, { showUndoRedoAllProperty } from '../model/puzzle/PuzzleModel.ts';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';

export type ControlBarNodeOptions = {
  // TODO: better forwarding of this option
  loadPuzzle: (puzzle: TPropertyPuzzle<TStructure, TCompleteData>) => void;
};

// TODO: support a background node with more complexity in the future?
export default class ControlBarNode extends HBox {
  public constructor(
    public readonly puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null>,
    viewContext: ViewContext,
    options: ControlBarNodeOptions,
  ) {
    const tooltipListener = new TooltipListener(viewContext);

    const shareShape = new Shape(
      // https://www.svgrepo.com/svg/311182/share-ios
      // COLLECTION: Fluent UI Icons Filled
      // LICENSE: MIT License
      // AUTHOR: Microsoft
      'M37.75,20.25 C38.6681734,20.25 39.4211923,20.9571103 39.4941988,21.8564728 L39.5,22 L39.5,36.25 C39.5,39.3517853 37.0439828,41.879937 33.9705557,41.9958479 L33.75,42 L14.25,42 C11.1482147,42 8.62006299,39.5439828 8.50415208,36.4705557 L8.5,36.25 L8.5,22 C8.5,21.0335017 9.28350169,20.25 10.25,20.25 C11.1681734,20.25 11.9211923,20.9571103 11.9941988,21.8564728 L12,22 L12,36.25 C12,37.440864 12.9251616,38.4156449 14.0959512,38.4948092 L14.25,38.5 L33.75,38.5 C34.940864,38.5 35.9156449,37.5748384 35.9948092,36.4040488 L36,36.25 L36,22 C36,21.0335017 36.7835017,20.25 37.75,20.25 Z M23.4989075,6.26787884 L23.6477793,6.25297693 L23.6477793,6.25297693 L23.8225053,6.25140103 L23.8225053,6.25140103 L23.9770074,6.26441014 L23.9770074,6.26441014 L24.1549097,6.29667263 L24.1549097,6.29667263 L24.223898,6.31492315 L24.223898,6.31492315 C24.4192207,6.36884271 24.6069182,6.4577966 24.7773762,6.58126437 L24.8968901,6.67628678 L24.8968901,6.67628678 L24.989825,6.76256313 L32.7679996,14.5407377 C33.4514171,15.2241552 33.4514171,16.3321939 32.7679996,17.0156115 C32.1247831,17.6588279 31.1054316,17.6966642 30.4179639,17.1291203 L30.2931259,17.0156115 L25.5,12.222 L25.5,31.5 C25.5,32.4181734 24.7928897,33.1711923 23.8935272,33.2441988 L23.75,33.25 C22.8318266,33.25 22.0788077,32.5428897 22.0058012,31.6435272 L22,31.5 L22,12.226 L17.2116504,17.0156115 C16.5684339,17.6588279 15.5490824,17.6966642 14.8616148,17.1291203 L14.7367767,17.0156115 C14.0935602,16.372395 14.055724,15.3530435 14.6232679,14.6655758 L14.7367767,14.5407377 L22.488804,6.78678454 C22.5446792,6.72871358 22.6045271,6.67449255 22.6679103,6.62455868 L22.7812362,6.54379243 L22.7812362,6.54379243 C22.8189499,6.51724 22.858413,6.49312256 22.8988638,6.47056335 L22.9176605,6.46138558 C23.0947495,6.36422067 23.2909216,6.29776289 23.4989075,6.26787884 Z',
    );

    const falseProperty = new TinyProperty(false);
    const zeroProperty = new TinyProperty(0);
    const hintStateNotFoundProperty = new TinyProperty(HintState.NOT_FOUND);

    const undoEnabledProperty = new DynamicProperty(puzzleModelProperty, {
      derive: (puzzleModel: PuzzleModel | null) => {
        return puzzleModel ? puzzleModel.undoPossibleProperty : falseProperty;
      },
    }) as TReadOnlyProperty<boolean>; // Why, TS?

    const redoEnabledProperty = new DynamicProperty(puzzleModelProperty, {
      derive: (puzzleModel: PuzzleModel | null) => {
        return puzzleModel ? puzzleModel.redoPossibleProperty : falseProperty;
      },
    }) as TReadOnlyProperty<boolean>; // Why, TS?

    const isSolvedProperty = new DynamicProperty(puzzleModelProperty, {
      derive: (puzzleModel: PuzzleModel | null) => {
        return puzzleModel ? puzzleModel.isSolvedProperty : falseProperty;
      },
    }) as TReadOnlyProperty<boolean>; // Why, TS?

    const timeProperty = new DynamicProperty(puzzleModelProperty, {
      derive: (puzzleModel: PuzzleModel | null) => {
        return puzzleModel ? puzzleModel.timeElapsedProperty : zeroProperty;
      },
    }) as TReadOnlyProperty<number>;

    const hintStateProperty = new DynamicProperty(puzzleModelProperty, {
      derive: (puzzleModel: PuzzleModel | null) => {
        return puzzleModel ? puzzleModel.hintStateProperty : hintStateNotFoundProperty;
      },
    }) as TReadOnlyProperty<HintState>;

    const isUnsolvedProperty = new DerivedProperty([isSolvedProperty], (isSolved) => !isSolved);

    let genNode: GenNode | null = null;
    let shareNode: ShareNode | null = null;
    let settingsNode: SettingsNode | null = null;
    let helpNode: HelpNode | null = null;

    const commonButtonOptions = {
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      baseColor: currentTheme.uiButtonBaseColorProperty,
      disabledColor: currentTheme.uiButtonDisabledColorProperty,
      xMargin: 8 * 1.3,
      yMargin: 5 * 1.3,

      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
    } as const;

    super({
      spacing: 10,
      stretch: true,
      children: [
        // TODO: iconify this instead of the text?
        new TextPushButton(
          'New',
          combineOptions<TextPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'New',
            listener: () => {
              genNode =
                genNode ||
                new GenNode(viewContext, {
                  loadPuzzle: options.loadPuzzle,
                });

              genNode.show();
            },
            textFill: currentTheme.uiButtonForegroundProperty,
            baseColor: currentTheme.uiButtonBaseColorProperty,
            xMargin: 5,
            yMargin: 5,
            font: controlBarFont,
            buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
          }),
        ),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Undo All',
            content: toFontAwesomePath(fontAwesomeBackwardShape),
            listener: () => {
              if (puzzleModelProperty.value) {
                puzzleModelProperty.value.onUserUndoAll();
              }
            },
            enabledProperty: undoEnabledProperty,
            visibleProperty: showUndoRedoAllProperty,
          }),
        ),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Undo',
            content: toFontAwesomePath(fontAwesomeStepBackwardShape),
            listener: () => {
              if (puzzleModelProperty.value) {
                puzzleModelProperty.value.onUserUndo();
              }
            },
            enabledProperty: undoEnabledProperty,
            fireOnHold: true,
          }),
        ),
        new TimerNode(timeProperty, {
          visibleProperty: showPuzzleTimerProperty,
        }),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Redo',
            content: toFontAwesomePath(fontAwesomeStepForwardShape),
            listener: () => {
              if (puzzleModelProperty.value) {
                puzzleModelProperty.value.onUserRedo();
              }
            },
            enabledProperty: redoEnabledProperty,
            fireOnHold: true,
          }),
        ),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Redo All',
            content: toFontAwesomePath(fontAwesomeForwardShape),
            listener: () => {
              if (puzzleModelProperty.value) {
                puzzleModelProperty.value.onUserRedoAll();
              }
            },
            enabledProperty: redoEnabledProperty,
            visibleProperty: showUndoRedoAllProperty,
          }),
        ),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Settings',
            content: toFontAwesomePath(fontAwesomeGearShape),
            listener: () => {
              settingsNode = settingsNode || new SettingsNode(viewContext);

              settingsNode.show();
            },
          }),
        ),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Share',
            content: toFontAwesomePath(shareShape),
            listener: () => {
              const puzzleModel = puzzleModelProperty.value;
              if (puzzleModel) {
                shareNode = shareNode || new ShareNode(viewContext);

                shareNode.setPuzzle(puzzleModel.puzzle);

                shareNode.show();
              }
            },
          }),
        ),
        new TextPushButton(
          'Solve',
          combineOptions<TextPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Solve',
            listener: () => {
              if (puzzleModelProperty.value) {
                puzzleModelProperty.value.onUserRequestSolve();
              }
            },

            enabledProperty: isUnsolvedProperty,

            // TODO: factor these out
            textFill: currentTheme.uiButtonForegroundProperty,
            baseColor: currentTheme.uiButtonBaseColorProperty,
            xMargin: 5,
            yMargin: 5,
            font: controlBarFont,
            buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
          }),
        ),
        new TextPushButton(
          'Hint',
          combineOptions<TextPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Hint',
            listener: () => {
              if (puzzleModelProperty.value) {
                puzzleModelProperty.value.onUserRequestHint();
              }
            },

            enabledProperty: new DerivedProperty([isUnsolvedProperty, hintStateProperty], (isUnsolved, hintState) => {
              return isUnsolved && hintState === HintState.DEFAULT;
            }),

            // TODO: factor these out
            textFill: currentTheme.uiButtonForegroundProperty,
            baseColor: currentTheme.uiButtonBaseColorProperty,
            xMargin: 5,
            yMargin: 5,
            font: controlBarFont,
            buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
          }),
        ),
        new RectangularPushButton(
          combineOptions<RectangularPushButtonOptions>({}, commonButtonOptions, {
            accessibleName: 'Help',
            content: toFontAwesomePath(fontAwesomeQuestionCircleShape),
            listener: () => {
              helpNode = helpNode || new HelpNode(viewContext);

              helpNode.show();
            },
          }),
        ),
      ],
    });

    this.children.forEach((child) => child.addInputListener(tooltipListener));

    viewContext.layoutBoundsProperty.link((bounds) => {
      this.maxWidth = Math.max(1, bounds.width - 2 * controlBarMargin);
    });
  }
}
