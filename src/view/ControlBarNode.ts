import { DerivedProperty, DynamicProperty, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { HBox } from 'phet-lib/scenery';
import PuzzleModel, { showUndoRedoAllProperty } from '../model/puzzle/PuzzleModel.ts';
import { RectangularPushButton, RectangularPushButtonOptions, TextPushButton, TextPushButtonOptions } from 'phet-lib/sun';
import { SettingsNode } from './SettingsNode.ts';
import { fontAwesomeBackwardShape, fontAwesomeForwardShape, fontAwesomeGearShape, fontAwesomeShareShape, fontAwesomeStepBackwardShape, fontAwesomeStepForwardShape, toFontAwesomePath } from './FontAwesomeShape.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { controlBarFont, controlBarMargin, currentTheme, rectangularButtonAppearanceStrategy } from './Theme.ts';
import { TStructure } from '../model/board/core/TStructure.ts';

import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { ShareNode } from './ShareNode.ts';
import { GenNode } from './GenNode.ts';
import { TooltipListener } from './TooltipListener.ts';
import { TimerNode } from './TimerNode.ts';
import { showPuzzleTimerProperty } from './puzzle/puzzleStyles.ts';
import { ViewContext } from './ViewContext.ts';
import HintState from '../model/puzzle/HintState.ts';

export type ControlBarNodeOptions = {
  // TODO: better forwarding of this option
  loadPuzzle: ( puzzle: TPropertyPuzzle<TStructure, TCompleteData> ) => void;
};

// TODO: support a background node with more complexity in the future?
export default class ControlBarNode extends HBox {
  public constructor(
    public readonly puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null>,
    viewContext: ViewContext,
    options: ControlBarNodeOptions
  ) {

    const tooltipListener = new TooltipListener( viewContext );

    const falseProperty = new TinyProperty( false );
    const zeroProperty = new TinyProperty( 0 );
    const hintStateNotFoundProperty = new TinyProperty( HintState.NOT_FOUND );

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

    const isSolvedProperty = new DynamicProperty( puzzleModelProperty, {
      derive: ( puzzleModel: PuzzleModel | null ) => {
        return puzzleModel ? puzzleModel.isSolvedProperty : falseProperty;
      }
    } ) as TReadOnlyProperty<boolean>; // Why, TS?

    const timeProperty = new DynamicProperty( puzzleModelProperty, {
      derive: ( puzzleModel: PuzzleModel | null ) => {
        return puzzleModel ? puzzleModel.timeElapsedProperty : zeroProperty;
      }
    } ) as TReadOnlyProperty<number>;

    const hintStateProperty = new DynamicProperty( puzzleModelProperty, {
      derive: ( puzzleModel: PuzzleModel | null ) => {
        return puzzleModel ? puzzleModel.hintStateProperty : hintStateNotFoundProperty;
      }
    } ) as TReadOnlyProperty<HintState>;

    const isUnsolvedProperty = new DerivedProperty( [ isSolvedProperty ], isSolved => !isSolved );

    let genNode: GenNode | null = null;
    let shareNode: ShareNode | null = null;
    let settingsNode: SettingsNode | null = null;

    const commonButtonOptions = {
      buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      baseColor: currentTheme.uiButtonBaseColorProperty,
      disabledColor: currentTheme.uiButtonDisabledColorProperty,
      xMargin: 8 * 1.3,
      yMargin: 5 * 1.3,

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
            genNode = genNode || new GenNode( viewContext, {
              loadPuzzle: options.loadPuzzle
            } );

            genNode.show();
          },
          textFill: currentTheme.uiButtonForegroundProperty,
          baseColor: currentTheme.uiButtonBaseColorProperty,
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
          enabledProperty: undoEnabledProperty,
          visibleProperty: showUndoRedoAllProperty,
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Undo',
          content: toFontAwesomePath( fontAwesomeStepBackwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserUndo();
            }
          },
          enabledProperty: undoEnabledProperty,
          fireOnHold: true,
        } ) ),
        new TimerNode( timeProperty, {
          visibleProperty: showPuzzleTimerProperty
        } ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Redo',
          content: toFontAwesomePath( fontAwesomeStepForwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRedo();
            }
          },
          enabledProperty: redoEnabledProperty,
          fireOnHold: true,
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Redo All',
          content: toFontAwesomePath( fontAwesomeForwardShape ),
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRedoAll();
            }
          },
          enabledProperty: redoEnabledProperty,
          visibleProperty: showUndoRedoAllProperty,
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Settings',
          content: toFontAwesomePath( fontAwesomeGearShape ),
          listener: () => {
            settingsNode = settingsNode || new SettingsNode( viewContext );

            settingsNode.show();
          },
        } ) ),
        new RectangularPushButton( combineOptions<RectangularPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Share',
          content: toFontAwesomePath( fontAwesomeShareShape ),
          listener: () => {
            const puzzleModel = puzzleModelProperty.value;
            if ( puzzleModel ) {
              shareNode = shareNode || new ShareNode( viewContext );

              shareNode.setPuzzle( puzzleModel.puzzle );

              shareNode.show();
            }
          },
        } ) ),
        new TextPushButton( 'Solve', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Solve',
          listener: () => {
            if ( puzzleModelProperty.value ) {
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
          buttonAppearanceStrategy: rectangularButtonAppearanceStrategy
        } ) ),
        new TextPushButton( 'Hint', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
          accessibleName: 'Hint',
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRequestHint();
            }
          },

          enabledProperty: new DerivedProperty( [ isUnsolvedProperty, hintStateProperty ], (
            isUnsolved, hintState,
          ) => {
            return isUnsolved && hintState === HintState.DEFAULT;
          } ),

          // TODO: factor these out
          textFill: currentTheme.uiButtonForegroundProperty,
          baseColor: currentTheme.uiButtonBaseColorProperty,
          xMargin: 5,
          yMargin: 5,
          font: controlBarFont,
          buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
        } ) ),
      ]
    } );

    this.children.forEach( child => child.addInputListener( tooltipListener ) );

    viewContext.layoutBoundsProperty.link( bounds => {
      this.maxWidth = Math.max( 1, bounds.width - 2 * controlBarMargin );
    } );
  }
}