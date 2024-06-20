import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TSerializedEdge } from '../board/core/TSerializedEdge.ts';
import { deserializeEdge } from '../board/core/deserializeEdge.ts';
import { serializeEdge } from '../board/core/serializeEdge.ts';
import { TAction, TSerializedAction } from '../data/core/TAction.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';

export class UserEdgeDragAction implements TAction<TEdgeStateData> {
  public constructor(
    public readonly firstEdge: TEdge,
    public readonly edges: TEdge[],
    public readonly state: EdgeState,
    public readonly dragIndex: number,
  ) {}

  public apply(state: TEdgeStateData): void {
    for (const edge of this.edges) {
      state.setEdgeState(edge, this.state);
    }
  }

  public getUndo(state: TEdgeStateData): TAction<TEdgeStateData> {
    throw new Error('unimplemented');
  }

  public isEmpty(): boolean {
    return this.edges.length === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'UserEdgeDragAction',
      firstEdge: serializeEdge(this.firstEdge),
      edges: this.edges.map((edge) => serializeEdge(edge)),
      state: this.state.name,
      dragIndex: this.dragIndex,
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): UserEdgeDragAction {
    return new UserEdgeDragAction(
      deserializeEdge(board, serializedAction.firstEdge as TSerializedEdge),
      serializedAction.edges.map((edge: TSerializedEdge) => deserializeEdge(board, edge)),
      EdgeState.enumeration.getValue(serializedAction.state),
      serializedAction.dragIndex,
    );
  }
}
