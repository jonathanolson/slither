import { GeneralVertexAction } from './GeneralVertexAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeVertexData, TVertexData, TSerializedVertexData } from './TVertexData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TVertex } from '../../board/core/TVertex.ts';
import { VertexState } from './VertexState.ts';

export class GeneralVertexDelta extends GeneralVertexAction implements TDelta<TVertexData> {

  public readonly vertexChangedEmitter = new TinyEmitter<[ vertex: TVertex, state: VertexState, oldState: VertexState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TVertexData>,
    vertexStateMap: Map<TVertex, VertexState> = new Map()
  ) {
    super( board, vertexStateMap );
  }

  public getVertexState( vertex: TVertex ): VertexState {
    if ( this.vertexStateMap.has( vertex ) ) {
      return this.vertexStateMap.get( vertex )!;
    }
    else {
      return this.parentState.getVertexState( vertex );
    }
  }

  public setVertexState( vertex: TVertex, state: VertexState ): void {
    const oldState = this.getVertexState( vertex );

    if ( !oldState.equals( state ) ) {
      this.vertexStateMap.set( vertex, state );

      this.vertexChangedEmitter.emit( vertex, state, oldState );
    }
  }

  public clone(): GeneralVertexDelta {
    return new GeneralVertexDelta( this.board, this.parentState, new Map( this.vertexStateMap ) );
  }

  public createDelta(): TDelta<TVertexData> {
    return new GeneralVertexDelta( this.board, this, new Map() );
  }

  public serializeState( board: TBoard ): TSerializedVertexData {
    return serializeVertexData( board, this );
  }
}