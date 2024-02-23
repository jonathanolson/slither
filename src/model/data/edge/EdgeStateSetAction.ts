import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TEdgeData } from './TEdgeData.ts';
import { deserializeEdge, serializeEdge, TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export class EdgeStateSetAction implements TAction<TEdgeData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly state: EdgeState
  ) {}

  public apply( state: TEdgeData ): void {
    state.setEdgeState( this.edge, this.state );
  }

  public getUndo( state: TEdgeData ): TAction<TEdgeData> {
    const previousState = state.getEdgeState( this.edge );
    return new EdgeStateSetAction( this.edge, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'EdgeStateSetAction',
      edge: serializeEdge( this.edge ),
      state: this.state.name
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): EdgeStateSetAction {
    return new EdgeStateSetAction(
      deserializeEdge( board, serializedAction.edge ),
      EdgeState.enumeration.getValue( serializedAction.state )
    );
  }
}