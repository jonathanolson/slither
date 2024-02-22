import { TAction } from '../core/TAction.ts';
import { TEdgeData } from './TEdgeData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';

export class GeneralEdgeAction implements TAction<TEdgeData> {
  public constructor(
    public readonly board: TBoard,
    public readonly edgeStateMap: Map<TEdge, EdgeState> = new Map()
  ) {}

  public apply( state: TEdgeData ): void {
    for ( const [ edge, edgeState ] of this.edgeStateMap ) {
      state.setEdgeState( edge, edgeState );
    }
  }

  public getUndo( state: TEdgeData ): TAction<TEdgeData> {
    const edgeStateMap = new Map<TEdge, EdgeState>();

    for ( const edge of this.edgeStateMap.keys() ) {
      edgeStateMap.set( edge, state.getEdgeState( edge ) );
    }

    return new GeneralEdgeAction( this.board, edgeStateMap );
  }

  public isEmpty(): boolean {
    return this.edgeStateMap.size === 0;
  }
}