import { BooleanProperty, DynamicProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Font, HBox, Node, Path } from 'phet-lib/scenery';
import PuzzleModel from '../model/PuzzleModel';
import { RectangularButton, RectangularPushButton, RectangularPushButtonOptions, TextPushButton } from 'phet-lib/sun';
import { Bounds2 } from 'phet-lib/dot';
import { SettingsNode } from './SettingsNode.ts';
import { fontAwesomeBackwardShape, fontAwesomeForwardShape, fontAwesomeGearShape, fontAwesomeStepBackwardShape, fontAwesomeStepForwardShape, toFontAwesomePath } from './FontAwesomeShape.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { uiButtonBaseColorProperty, uiButtonDisabledColorProperty, uiButtonForegroundProperty } from './Theme.ts';

const font = new Font( {
  family: 'sans-serif',
  size: 12
} );

const useFlatButtons = true;

const buttonAppearanceStrategy = useFlatButtons ? RectangularButton.FlatAppearanceStrategy : RectangularButton.ThreeDAppearanceStrategy;

export type ControlBarNodeOptions = {
  userActionLoadPuzzleFromString: () => void;
  userActionLoadPuzzleFromImage: () => void;
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

    let settingsNode: SettingsNode | null = null;

    const commonButtonOptions = {
      buttonAppearanceStrategy: buttonAppearanceStrategy,
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
        new TextPushButton( 'Load String', {
          textFill: uiButtonForegroundProperty,
          baseColor: uiButtonBaseColorProperty,
          xMargin: 5,
          yMargin: 5,
          font: font,
          buttonAppearanceStrategy: buttonAppearanceStrategy,
          listener: options.userActionLoadPuzzleFromString
        } ),
        new TextPushButton( 'Load Image', {
          textFill: uiButtonForegroundProperty,
          baseColor: uiButtonBaseColorProperty,
          font: font,
          buttonAppearanceStrategy: buttonAppearanceStrategy,
          listener: options.userActionLoadPuzzleFromImage
        } ),
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
        } ) )
      ]
    } );
  }
}