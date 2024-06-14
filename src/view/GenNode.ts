import { HBox, HSeparator, Node, VBox } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import scanURL from '../scan/scanURL.ts';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import { GenerateNode } from './GenerateNode.ts';
import { UITextPushButton } from './UITextPushButton.ts';
import { ScanNode } from './ScanNode.ts';
import { ViewContext } from './ViewContext.ts';

export type GenNodeOptions = {
  loadPuzzle: (puzzle: TPropertyPuzzle<TStructure, TCompleteData>) => void;
};

export class GenNode extends PopupNode {
  public constructor(viewContext: ViewContext, options: GenNodeOptions) {
    super(
      new VBox({
        spacing: 20,
        align: 'left',
        stretch: true,
        children: [
          new Node({
            children: [
              new GenerateNode(viewContext, {
                loadPuzzle: (puzzle) => {
                  this.hide();

                  options.loadPuzzle(puzzle);
                },
                preferredWidth: 700,
                preferredHeight: 300, // TODO: change this once we have... more generators?
              }),
            ],
          }),
          new HSeparator(),
          new HBox({
            spacing: 15,
            grow: 1,
            children: [
              new UITextPushButton('Load String', {
                listener: () => {
                  this.hide();

                  // TODO: try/catch
                  const string = prompt('Enter puzzle string');

                  if (string) {
                    options.loadPuzzle(BasicPuzzle.loadDeprecatedScalaString(string));
                  }
                },
              }),
              new UITextPushButton('Load Image (Rectangular Only)', {
                listener: () => {
                  this.hide();

                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (event) => {
                    // @ts-expect-error
                    const file = event.target!.files[0];

                    var reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onloadend = async () => {
                      const url = reader.result as string;

                      // const scanURL = ( await import ( '../scan/scanURL.ts' ) ).default;

                      const scanNode = new ScanNode(viewContext);
                      scanNode.show();

                      const puzzle = await scanURL(url, scanNode.getScanOptions());

                      options.loadPuzzle(puzzle);
                    };
                  };
                  input.click();
                },
              }),
            ],
          }),
        ],
      }),
      viewContext,
    );
  }
}
