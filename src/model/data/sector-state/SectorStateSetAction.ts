import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TSectorStateData } from './TSectorStateData.ts';
import SectorState from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TSector } from './TSector.ts';
import { serializeHalfEdge } from '../../board/core/serializeHalfEdge.ts';
import { deserializeHalfEdge } from '../../board/core/deserializeHalfEdge.ts';

export class SectorStateSetAction implements TAction<TSectorStateData> {
  public constructor(
    public readonly sector: TSector,
    public readonly state: SectorState,
  ) {}

  public apply(state: TSectorStateData): void {
    state.setSectorState(this.sector, this.state);
  }

  public getUndo(state: TSectorStateData): TAction<TSectorStateData> {
    const previousState = state.getSectorState(this.sector);
    return new SectorStateSetAction(this.sector, previousState);
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'SectorStateSetAction',
      sector: serializeHalfEdge(this.sector),
      state: this.state.serialize(),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): SectorStateSetAction {
    return new SectorStateSetAction(
      deserializeHalfEdge(board, serializedAction.sector),
      SectorState.deserialize(serializedAction.state),
    );
  }
}
