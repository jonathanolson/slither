import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TEdgeStateData } from './TEdgeStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';
import { TSerializedEdge } from '../../board/core/TSerializedEdge.ts';

export class GeneralEdgeStateAction implements TAction<TEdgeStateData> {
  public constructor(
    public readonly board: TBoard,
    public readonly edgeStateMap: Map<TEdge, EdgeState> = new Map(),
  ) {}

  public apply(state: TEdgeStateData): void {
    for (const [edge, edgeState] of this.edgeStateMap) {
      state.setEdgeState(edge, edgeState);
    }
  }

  public getUndo(state: TEdgeStateData): TAction<TEdgeStateData> {
    const edgeStateMap = new Map<TEdge, EdgeState>();

    for (const edge of this.edgeStateMap.keys()) {
      edgeStateMap.set(edge, state.getEdgeState(edge));
    }

    return new GeneralEdgeStateAction(this.board, edgeStateMap);
  }

  public isEmpty(): boolean {
    return this.edgeStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralEdgeAction',
      edges: Array.from(this.edgeStateMap.entries()).map(([edge, edgeState]) => ({
        edge: serializeEdge(edge),
        state: edgeState.name,
      })),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): GeneralEdgeStateAction {
    return new GeneralEdgeStateAction(
      board,
      new Map(
        serializedAction.edges.map((serializedEdgeState: { edge: TSerializedEdge; state: string }) => [
          deserializeEdge(board, serializedEdgeState.edge),
          EdgeState.enumeration.getValue(serializedEdgeState.state),
        ]),
      ),
    );
  }
}
