import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TSectorStateData } from './TSectorStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import SectorState, { TSerializedSectorState } from './SectorState.ts';
import { TSector } from './TSector.ts';
import { TSerializedHalfEdge } from '../../board/core/TSerializedHalfEdge.ts';
import { serializeHalfEdge } from '../../board/core/serializeHalfEdge.ts';
import { deserializeHalfEdge } from '../../board/core/deserializeHalfEdge.ts';

export class GeneralSectorStateAction implements TAction<TSectorStateData> {
  public constructor(
    public readonly board: TBoard,
    public readonly sectorStateMap: Map<TSector, SectorState> = new Map(),
  ) {}

  public apply(state: TSectorStateData): void {
    for (const [sector, sectorState] of this.sectorStateMap) {
      state.setSectorState(sector, sectorState);
    }
  }

  public getUndo(state: TSectorStateData): TAction<TSectorStateData> {
    const sectorStateMap = new Map<TSector, SectorState>();

    for (const sector of this.sectorStateMap.keys()) {
      sectorStateMap.set(sector, state.getSectorState(sector));
    }

    return new GeneralSectorStateAction(this.board, sectorStateMap);
  }

  public isEmpty(): boolean {
    return this.sectorStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralSectorAction',
      sectors: Array.from(this.sectorStateMap.entries()).map(([sector, sectorState]) => ({
        sector: serializeHalfEdge(sector),
        state: sectorState.serialize(),
      })),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): GeneralSectorStateAction {
    return new GeneralSectorStateAction(
      board,
      new Map(
        serializedAction.sectors.map(
          (serializedSectorState: { sector: TSerializedHalfEdge; state: TSerializedSectorState }) => [
            deserializeHalfEdge(board, serializedSectorState.sector),
            SectorState.deserialize(serializedSectorState.state),
          ],
        ),
      ),
    );
  }
}
