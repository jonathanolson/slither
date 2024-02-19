import { BooleanProperty, DynamicProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Font, HBox, Node } from 'phet-lib/scenery';
import PuzzleModel from '../model/PuzzleModel';
import { RectangularButton, TextPushButton } from 'phet-lib/sun';
import { Bounds2 } from 'phet-lib/dot';
import { SettingsNode } from './SettingsNode.ts';

const font = new Font( {
  family: 'sans-serif',
  size: 20
} );

const useFlatButtons = false;

const buttonAppearanceStrategy = useFlatButtons ? RectangularButton.FlatAppearanceStrategy : RectangularButton.ThreeDAppearanceStrategy;

export type ControlBarNodeOptions = {
  userActionLoadPuzzle: () => void;
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

    super( {
      spacing: 10,
      children: [
        new TextPushButton( 'Load image', {
          font: font,
          buttonAppearanceStrategy: buttonAppearanceStrategy,
          listener: options.userActionLoadPuzzle
        } ),
        new TextPushButton( 'Undo', {
          font: font,
          buttonAppearanceStrategy: buttonAppearanceStrategy,
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserUndo();
            }
          },
          enabledProperty: undoEnabledProperty
        } ),
        new TextPushButton( 'Redo', {
          font: font,
          buttonAppearanceStrategy: buttonAppearanceStrategy,
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRedo();
            }
          },
          enabledProperty: redoEnabledProperty
        } ),
        new TextPushButton( 'Settings', {
          font: font,
          buttonAppearanceStrategy: buttonAppearanceStrategy,
          listener: () => {
            settingsNode = settingsNode || new SettingsNode( options.glassPane, options.layoutBoundsProperty );

            settingsNode.show();
          }
        } )
      ]
    } );
  }
}