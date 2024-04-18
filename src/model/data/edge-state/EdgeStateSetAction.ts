import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TEdgeStateData } from './TEdgeStateData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';

export class EdgeStateSetAction implements TAction<TEdgeStateData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly state: EdgeState
  ) {}

  public apply( state: TEdgeStateData ): void {
    state.setEdgeState( this.edge, this.state );
  }

  public getUndo( state: TEdgeStateData ): TAction<TEdgeStateData> {
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