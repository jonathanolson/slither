import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TSectorData } from './TSectorData.ts';
import SectorState from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TSector } from './TSector.ts';
import { deserializeHalfEdge, serializeHalfEdge } from '../../board/core/THalfEdge.ts';

export class SectorStateSetAction implements TAction<TSectorData> {

  public constructor(
    public readonly sector: TSector,
    public readonly state: SectorState
  ) {}

  public apply( state: TSectorData ): void {
    state.setSectorState( this.sector, this.state );
  }

  public getUndo( state: TSectorData ): TAction<TSectorData> {
    const previousState = state.getSectorState( this.sector );
    return new SectorStateSetAction( this.sector, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'SectorStateSetAction',
      sector: serializeHalfEdge( this.sector ),
      state: this.state.serialize()
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): SectorStateSetAction {
    return new SectorStateSetAction(
      deserializeHalfEdge( board, serializedAction.sector ),
      SectorState.deserialize( serializedAction.state )
    );
  }
}