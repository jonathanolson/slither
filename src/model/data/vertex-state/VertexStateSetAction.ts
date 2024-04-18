import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TVertexStateData } from './TVertexStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { VertexState } from './VertexState.ts';
import { serializeVertex } from '../../board/core/serializeVertex.ts';
import { deserializeVertex } from '../../board/core/deserializeVertex.ts';

export class VertexStateSetAction implements TAction<TVertexStateData> {

  public constructor(
    public readonly vertex: TVertex,
    public readonly state: VertexState
  ) {}

  public apply( state: TVertexStateData ): void {
    state.setVertexState( this.vertex, this.state );
  }

  public getUndo( state: TVertexStateData ): TAction<TVertexStateData> {
    const previousState = state.getVertexState( this.vertex );
    return new VertexStateSetAction( this.vertex, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'VertexStateSetAction',
      vertex: serializeVertex( this.vertex ),
      state: this.state.serialize()
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): VertexStateSetAction {
    const vertex = deserializeVertex( board, serializedAction.vertex );
    return new VertexStateSetAction(
      vertex,
      VertexState.deserialize( vertex, serializedAction.state )
    );
  }
}