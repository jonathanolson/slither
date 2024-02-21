import { TAction } from '../core/TAction.ts';
import { TEdgeData } from './TEdgeData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';

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
}