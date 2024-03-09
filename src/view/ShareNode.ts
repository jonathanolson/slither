import { BooleanProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { Node, VBox } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { TState } from '../model/data/core/TState.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { puzzleToCompressedString, TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { copyToClipboard } from '../util/copyToClipboard.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import { CompleteData } from '../model/data/combined/CompleteData.ts';
import { UITextPushButton } from './UITextPushButton.ts';

export class ShareNode extends PopupNode {

  private readonly includeStateProperty;
  private puzzle: TPropertyPuzzle<TStructure, TState<TCompleteData>> | null = null;

  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>
  ) {

    const includeStateProperty = new BooleanProperty( false );

    super( new VBox( {
      spacing: 20,
      align: 'left',
      stretch: true,
      children: [
        new UITextPushButton( 'Copy URL', {
          listener: () => {
            if ( this.puzzle ) {
              const baseURL = location.protocol + '//' + location.host + location.pathname;

              let puzzle = this.puzzle;
              if ( !this.includeStateProperty.value ) {
                puzzle = new BasicPuzzle( puzzle.board, CompleteData.fromFaceData( puzzle.board, puzzle.stateProperty.value ) );
              }

              const puzzleString = puzzleToCompressedString( puzzle );

              copyToClipboard( baseURL + '?p=' + encodeURIComponent( puzzleString ) );

              // TODO: replace button with "copied" text?
            }
          }
        } ),
        new UITextCheckbox( 'Include edge state', includeStateProperty )
      ]
    } ), glassPane, layoutBoundsProperty );

    this.includeStateProperty = includeStateProperty;
  }

  public setPuzzle( puzzle: TPropertyPuzzle<TStructure, TState<TCompleteData>> ): void {
    this.puzzle = puzzle;
  }

  public override reset(): void {
    super.reset();

    this.includeStateProperty.reset();
  }
}
