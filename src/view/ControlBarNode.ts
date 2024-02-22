import { BooleanProperty, DynamicProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { HBox, Node, Path } from 'phet-lib/scenery';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { RectangularPushButton, RectangularPushButtonOptions, TextPushButton, TextPushButtonOptions } from 'phet-lib/sun';
import { Bounds2 } from 'phet-lib/dot';
import { SettingsNode } from './SettingsNode.ts';
import { fontAwesomeBackwardShape, fontAwesomeForwardShape, fontAwesomeGearShape, fontAwesomeStepBackwardShape, fontAwesomeStepForwardShape, toFontAwesomePath } from './FontAwesomeShape.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { controlBarFont, rectangularButtonAppearanceStrategy, uiButtonBaseColorProperty, uiButtonDisabledColorProperty, uiButtonForegroundProperty } from './Theme.ts';
import { NewNode } from './NewNode.ts';
import { TState } from '../model/data/core/TState.ts';
import { TStructure } from '../model/board/core/TStructure.ts';

import { TPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';

export type ControlBarNodeOptions = {
  // TODO: better forwarding of this option
  loadPuzzle: ( puzzle: TPuzzle<TStructure, TState<TCompleteData>> ) => void;
  glassPane: Node;
  layoutBoundsProperty: TReadOnlyProperty<Bounds2>;
};

// TODO: support a background node with more complexity in the future?
export default class ControlBarNode extends HBox {
  public constructor(
    public readonly puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null>,
    options: ControlBarNodeOptions
  ) {

    const falseProperty = new BooleanProperty( false );

    const undoEnabledProperty = new DynamicProperty( puzzleModelProperty, {
      derive: ( puzzleModel: PuzzleModel | null ) => {
        return puzzleModel ? puzzleModel.undoPossibleProperty : falseProperty;
      }
    } ) as TReadOnlyProperty<boolean>; // Why, TS?

    const redoEnabledProperty = new DynamicProperty( puzzleModelProperty, {
      derive: ( puzzleModel: PuzzleModel | null ) => {
        return puzzleModel ? puzzleModel.redoPossibleProperty : falseProperty;
      }
    } ) as TReadOnlyProperty<boolean>; // Why, TS?

    let newNode: NewNode | null = null;
    let settingsNode: SettingsNode | null = null;

    const commonButtonOptions = {
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      baseColor: uiButtonBaseColorProperty,
      disabledColor: uiButtonDisabledColorProperty,

      mouseAreaXDilation: 5,
      mouseAreaYDilation: 5,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    } as const;

    super( {
      spacing: 10,
      stretch: true,
      children: [
        // TODO: iconify this instead of the text?
        new TextPushButton( 'New', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'New',
          listener: () => {
            newNode = newNode || new NewNode( options.glassPane, options.layoutBoundsProperty, {
              loadPuzzle: options.loadPuzzle
            } );

            newNode.show();
          },
          textFill: uiButtonForegroundProperty,
          baseColor: uiButtonBaseColorProperty,
          xMargin: 5,
          yMargin: 5,
          font: controlBarFont,
          buttonAppearanceStrategy: rectangularButtonAppearanceStrategy
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Undo All',
          content: toFontAwesomePath( fontAwesomeBackwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserUndoAll();
            }
          },
          enabledProperty: undoEnabledProperty
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Undo',
          content: toFontAwesomePath( fontAwesomeStepBackwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserUndo();
            }
          },
          enabledProperty: undoEnabledProperty
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Redo',
          content: toFontAwesomePath( fontAwesomeStepForwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRedo();
            }
          },
          enabledProperty: redoEnabledProperty
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Redo All',
          content: toFontAwesomePath( fontAwesomeForwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRedoAll();
            }
          },
          enabledProperty: redoEnabledProperty
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Settings',
          content: new Path( fontAwesomeGearShape, {
            maxWidth: 15,
            maxHeight: 15,
            fill: 'black'
          } ),
          listener: () => {
            settingsNode = settingsNode || new SettingsNode( options.glassPane, options.layoutBoundsProperty );

            settingsNode.show();
          }
        } ) ),
        new TextPushButton( 'Solve', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Solve',
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRequestSolve();
            }
          },

          // TODO: enabledProperty

          // TODO: factor these out
          textFill: uiButtonForegroundProperty,
          baseColor: uiButtonBaseColorProperty,
          xMargin: 5,
          yMargin: 5,
          font: controlBarFont,
          buttonAppearanceStrategy: rectangularButtonAppearanceStrategy
        } ) ),
      ]
    } );
  }
}