import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TVertexStateData } from './TVertexStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';
import { TSerializedVertex } from '../../board/core/TSerializedVertex.ts';
import { serializeVertex } from '../../board/core/serializeVertex.ts';
import { deserializeVertex } from '../../board/core/deserializeVertex.ts';

export class GeneralVertexStateAction implements TAction<TVertexStateData> {
  public constructor(
    public readonly board: TBoard,
    public readonly vertexStateMap: Map<TVertex, VertexState> = new Map(),
  ) {}

  public apply(state: TVertexStateData): void {
    for (const [vertex, vertexState] of this.vertexStateMap) {
      state.setVertexState(vertex, vertexState);
    }
  }

  public getUndo(state: TVertexStateData): TAction<TVertexStateData> {
    const vertexStateMap = new Map<TVertex, VertexState>();

    for (const vertex of this.vertexStateMap.keys()) {
      vertexStateMap.set(vertex, state.getVertexState(vertex));
    }

    return new GeneralVertexStateAction(this.board, vertexStateMap);
  }

  public isEmpty(): boolean {
    return this.vertexStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralVertexAction',
      vertices: Array.from(this.vertexStateMap.entries()).map(([vertex, vertexState]) => ({
        vertex: serializeVertex(vertex),
        state: vertexState.serialize(),
      })),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): GeneralVertexStateAction {
    return new GeneralVertexStateAction(
      board,
      new Map(
        serializedAction.vertices.map(
          (serializedVertexState: { vertex: TSerializedVertex; state: TSerializedVertexState }) => [
            deserializeVertex(board, serializedVertexState.vertex),
            VertexState.deserialize(
              deserializeVertex(board, serializedVertexState.vertex),
              serializedVertexState.state,
            ),
          ],
        ),
      ),
    );
  }
}
