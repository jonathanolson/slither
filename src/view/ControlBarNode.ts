import { BooleanProperty, DynamicProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Font, HBox } from 'phet-lib/scenery';
import PuzzleModel from '../model/PuzzleModel';
import { TextPushButton } from 'phet-lib/sun';

const font = new Font( {
  family: 'sans-serif',
  size: 25
} );

export type ControlBarNodeOptions = {
  userActionLoadPuzzle: () => void;
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

    super( {
      spacing: 10,
      children: [
        new TextPushButton( 'Load image', {
          font: font,
          listener: options.userActionLoadPuzzle
        } ),
        new TextPushButton( 'Undo', {
          font: font,
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserUndo();
            }
          },
          enabledProperty: undoEnabledProperty
        } ),
        new TextPushButton( 'Redo', {
          font: font,
          listener: () => {
            if ( puzzleModelProperty.value ) {
              puzzleModelProperty.value.onUserRedo();
            }
          },
          enabledProperty: redoEnabledProperty
        } )
      ]
    } );
  }
}