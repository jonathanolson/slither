// TODO: immediate user repeat of "toggle" should undo auto-solve (that is probably out of the scope of these simple actions)
// TODO: Potentially a UserEdgeStateToggleAction that does this and other things?
import { TAction } from '../core/TAction.ts';
import { TEdgeData } from './TEdgeData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';

export class EdgeStateCycleAction implements TAction<TEdgeData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly forward: boolean = true
  ) {}

  public apply( state: TEdgeData ): void {
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

  public getUndo( _state: TEdgeData ): TAction<TEdgeData> {
    return new EdgeStateCycleAction( this.edge, !this.forward );
  }

  public isEmpty(): boolean {
    return false;
  }
}