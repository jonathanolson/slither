import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TEdgeData } from './TEdgeData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { deserializeEdge, serializeEdge, TEdge, TSerializedEdge } from '../../board/core/TEdge.ts';
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

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralEdgeAction',
      edges: Array.from( this.edgeStateMap.entries() ).map( ( [ edge, edgeState ] ) => ( {
        edge: serializeEdge( edge ),
        state: edgeState.name
      } ) )
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): GeneralEdgeAction {
    return new GeneralEdgeAction(
      board,
      new Map( serializedAction.edges.map( ( serializedEdgeState: { edge: TSerializedEdge; state: string } ) => [
        deserializeEdge( board, serializedEdgeState.edge ),
        EdgeState.enumeration.getValue( serializedEdgeState.state )
      ] ) )
    );
  }
}