import { HBox, Node, Path, Rectangle } from 'phet-lib/scenery';
import { SelectedSectorEdit } from '../../model/puzzle/SelectedSectorEdit.ts';
import { SectorNode } from './SectorNode.ts';
import SectorState from '../../model/data/sector-state/SectorState.ts';
import { Panel, RectangularPushButton } from 'phet-lib/sun';
import { TSector } from '../../model/data/sector-state/TSector.ts';
import { rectangularButtonAppearanceStrategy } from '../Theme.ts';
import { PuzzleBackgroundNode } from './PuzzleBackgroundNode.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

export type SelectedSectorEditNodeOptions = {
  sectorSetListener?: (sector: TSector, state: SectorState) => void;
  useBackgroundOffsetStroke: boolean;
  backgroundOffsetDistance: number;
};

export class SelectedSectorEditNode extends Node {
  public constructor(
    public readonly selectedSectorEdit: SelectedSectorEdit,
    background: PuzzleBackgroundNode,
    style: TPuzzleStyle,
    options: SelectedSectorEditNodeOptions,
  ) {
    const children: Node[] = [];
    const nodesToDispose: Node[] = [];

    const sector = selectedSectorEdit.sector;
    const sectorState = selectedSectorEdit.currentState;

    const sectorShape = SectorNode.getSectorArcShape(sector, 0.5);
    const sectorHighlightNode = new Path(sectorShape.getOffsetShape(0.05), {
      stroke: style.theme.selectedSectorEditColorProperty,
      lineWidth: 0.02,
    });
    children.push(sectorHighlightNode);

    const availableSectorStates: SectorState[] = [];

    if (sectorState === SectorState.ANY) {
      availableSectorStates.push(SectorState.NOT_ZERO);
      availableSectorStates.push(SectorState.NOT_ONE);
      availableSectorStates.push(SectorState.NOT_TWO);
    }
    if (sectorState.one && sectorState !== SectorState.ONLY_ONE) {
      availableSectorStates.push(SectorState.ONLY_ONE);
    }

    if (availableSectorStates.length) {
      const buttons = availableSectorStates.map((state) => {
        const paint = SectorNode.getStrokeFromStyle(state, style)!;

        return new RectangularPushButton({
          accessibleName: SectorNode.nameMap.get(state)!,
          content: new Rectangle(0, 0, 25, 25),
          listener: () => {
            options.sectorSetListener && options.sectorSetListener(sector, state);
          },

          buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
          baseColor: paint,
          xMargin: 8 * 1.3,
          yMargin: 5 * 1.3,

          mouseAreaXDilation: 5,
          mouseAreaYDilation: 5,
          touchAreaXDilation: 5,
          touchAreaYDilation: 5,
        });
      });

      nodesToDispose.push(...buttons);

      // TODO: disposal of buttons

      const panel = new Panel(
        new HBox({
          children: buttons,
          spacing: 10,
        }),
        {
          xMargin: 10,
          yMargin: 10,
          fill: style.theme.uiBackgroundColorProperty,
          stroke: style.theme.uiForegroundColorProperty,
          scale: 0.01,
        },
      );
      nodesToDispose.push(panel);

      const margin = 0.1;

      children.push(panel);
      panel.centerBottom = sectorHighlightNode.centerTop.plusXY(0, -0.15);
      if (panel.top < background.top + margin) {
        panel.centerTop = sectorHighlightNode.centerBottom.plusXY(0, 0.15);
      }
      if (panel.left < background.left + margin) {
        panel.left = background.left + margin;
      }
      if (panel.right > background.right - margin) {
        panel.right = background.right - margin;
      }
    }

    super({
      children: children,
    });

    this.disposeEmitter.addListener(() => {
      nodesToDispose.forEach((node) => node.dispose());
    });
  }
}
