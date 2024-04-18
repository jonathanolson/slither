// TODO: immediate user repeat of "toggle" should undo auto-solve (that is probably out of the scope of these simple actions)
// TODO: Potentially a UserEdgeStateToggleAction that does this and other things?
import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TEdgeStateData } from './TEdgeStateData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';

export class EdgeStateCycleAction implements TAction<TEdgeStateData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly forward: boolean = true
  ) {}

  public apply( state: TEdgeStateData ): void {
    const currentState = state.getEdgeState( this.edge );
    if ( currentState === EdgeState.WHITE ) {
      state.setEdgeState( this.edge, this.forward ? EdgeState.BLACK : EdgeState.RED );
    }
    else if ( currentState === EdgeState.BLACK ) {
      state.setEdgeState( this.edge, this.forward ? EdgeState.RED : EdgeState.WHITE );
    }
    else {
      state.setEdgeState( this.edge, this.forward ? EdgeState.WHITE : EdgeState.BLACK );
    }
  }

  public getUndo( _state: TEdgeStateData ): TAction<TEdgeStateData> {
    return new EdgeStateCycleAction( this.edge, !this.forward );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'EdgeStateCycleAction',
      edge: serializeEdge( this.edge ),
      forward: this.forward
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): EdgeStateCycleAction {
    return new EdgeStateCycleAction( deserializeEdge( board, serializedAction.edge ), serializedAction.forward );
  }
}