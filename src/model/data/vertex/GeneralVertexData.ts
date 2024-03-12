import { TState } from '../core/TState.ts';
import { serializeVertexData, TSerializedVertexData, TVertexData } from './TVertexData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { deserializeVertex, TSerializedVertex, TVertex } from '../../board/core/TVertex.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';

export class GeneralVertexData implements TState<TVertexData> {

  public readonly vertexChangedEmitter = new TinyEmitter<[ vertex: TVertex, state: VertexState, oldState: VertexState ]>();

  public readonly vertexStateMap: Map<TVertex, VertexState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialVertexState: ( vertex: TVertex ) => VertexState = VertexState.any
  ) {
    board.vertices.forEach( vertex => {
      this.vertexStateMap.set( vertex, getInitialVertexState( vertex ) );
    } );
  }

  public getVertexState( vertex: TVertex ): VertexState {
    assertEnabled() && assert( this.vertexStateMap.has( vertex ) );

    return this.vertexStateMap.get( vertex )!;
  }

  public setVertexState( vertex: TVertex, state: VertexState ): void {
    assertEnabled() && assert( this.vertexStateMap.has( vertex ) );

    const oldState = this.vertexStateMap.get( vertex )!;

    if ( !oldState.equals( state ) ) {
      this.vertexStateMap.set( vertex, state );

      this.vertexChangedEmitter.emit( vertex, state, oldState );
    }
  }

  public clone(): GeneralVertexData {
    return new GeneralVertexData( this.board, vertex => this.getVertexState( vertex ) );
  }

  public createDelta(): TDelta<TVertexData> {
    return new GeneralVertexDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedVertexData {
    return serializeVertexData( board, this );
  }

  public static deserializeState( board: TBoard, serializedVertexData: TSerializedVertexData ): GeneralVertexData {
    const map: Map<TVertex, VertexState> = new Map( serializedVertexData.vertexs.map( ( serializedVertexState: { vertex: TSerializedVertex; state: TSerializedVertexState } ) => {
      const vertex = deserializeVertex( board, serializedVertexState.vertex );
      return [
        vertex,
        VertexState.deserialize( vertex, serializedVertexState.state )
      ];
    } ) );

    return new GeneralVertexData(
      board,
      vertex => map.get( vertex ) ?? VertexState.any( vertex )
    );
  }
}