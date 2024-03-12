import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TVertexData } from './TVertexData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { deserializeVertex, serializeVertex, TSerializedVertex, TVertex } from '../../board/core/TVertex.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';

export class GeneralVertexAction implements TAction<TVertexData> {
  public constructor(
    public readonly board: TBoard,
    public readonly vertexStateMap: Map<TVertex, VertexState> = new Map()
  ) {}

  public apply( state: TVertexData ): void {
    for ( const [ vertex, vertexState ] of this.vertexStateMap ) {
      state.setVertexState( vertex, vertexState );
    }
  }

  public getUndo( state: TVertexData ): TAction<TVertexData> {
    const vertexStateMap = new Map<TVertex, VertexState>();

    for ( const vertex of this.vertexStateMap.keys() ) {
      vertexStateMap.set( vertex, state.getVertexState( vertex ) );
    }

    return new GeneralVertexAction( this.board, vertexStateMap );
  }

  public isEmpty(): boolean {
    return this.vertexStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralVertexAction',
      vertices: Array.from( this.vertexStateMap.entries() ).map( ( [ vertex, vertexState ] ) => ( {
        vertex: serializeVertex( vertex ),
        state: vertexState.serialize()
      } ) )
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): GeneralVertexAction {
    return new GeneralVertexAction(
      board,
      new Map( serializedAction.vertices.map( ( serializedVertexState: { vertex: TSerializedVertex; state: TSerializedVertexState } ) => [
        deserializeVertex( board, serializedVertexState.vertex ),
        VertexState.deserialize( deserializeVertex( board, serializedVertexState.vertex ), serializedVertexState.state )
      ] ) )
    );
  }
}