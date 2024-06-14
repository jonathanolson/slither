import { BooleanProperty } from 'phet-lib/axon';
import { VBox } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { copyToClipboard } from '../util/copyToClipboard.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import { CompleteData } from '../model/data/combined/CompleteData.ts';
import { UITextPushButton } from './UITextPushButton.ts';
import { ViewContext } from './ViewContext.ts';
import { puzzleToCompressedString } from '../model/puzzle/puzzleToCompressedString.ts';
import { TooltipListener } from './TooltipListener.ts';

export class ShareNode extends PopupNode {
  private readonly includeStateProperty;
  private puzzle: TPropertyPuzzle<TStructure, TCompleteData> | null = null;

  public constructor(viewContext: ViewContext) {
    const includeStateProperty = new BooleanProperty(false);

    const copyButton = new UITextPushButton('Copy URL', {
      accessibleName: 'Copy Shareable URL to Clipboard',
      listener: () => {
        if (this.puzzle) {
          const baseURL = location.protocol + '//' + location.host + location.pathname;

          let puzzle = this.puzzle;
          if (!this.includeStateProperty.value) {
            puzzle = new BasicPuzzle(
              puzzle.board,
              CompleteData.fromFaceValueData(puzzle.board, puzzle.stateProperty.value),
            );
          }

          const puzzleString = puzzleToCompressedString(puzzle);

          copyToClipboard(baseURL + '?p=' + encodeURIComponent(puzzleString));

          // TODO: replace button with "copied" text?
        }
      },
    });
    copyButton.addInputListener(new TooltipListener(viewContext));

    super(
      new VBox({
        spacing: 20,
        align: 'left',
        stretch: true,
        children: [copyButton, new UITextCheckbox('Include Solve Progress', includeStateProperty)],
      }),
      viewContext,
    );

    this.includeStateProperty = includeStateProperty;
  }

  public setPuzzle(puzzle: TPropertyPuzzle<TStructure, TCompleteData>): void {
    this.puzzle = puzzle;
  }

  public override reset(): void {
    super.reset();

    this.includeStateProperty.reset();
  }
}
