import { SectorNode } from './SectorNode.ts';
import { ShapeInteractionNode } from './ShapeInteractionNode.ts';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TSector } from '../../model/data/sector-state/TSector.ts';


// TODO: better options pattern!
export type SectorViewInteractionNodeOptions = {
  backgroundOffsetDistance: number;

  sectorPressListener: (sector: TSector, button: 0 | 1 | 2) => void;
};

export class SectorViewInteractionNode extends ShapeInteractionNode<TSector> {
  public constructor(board: TBoard, options: SectorViewInteractionNodeOptions) {
    super(
      board.halfEdges,
      (sector) => SectorNode.getSectorBaseShape(sector, options.backgroundOffsetDistance),
      options.sectorPressListener,
    );
  }
}
