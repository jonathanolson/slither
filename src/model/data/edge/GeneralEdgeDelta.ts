import { GeneralEdgeAction } from './GeneralEdgeAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeEdgeData, TEdgeData, TSerializedEdgeData } from './TEdgeData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';

export class GeneralEdgeDelta extends GeneralEdgeAction implements TDelta<TEdgeData> {

  public readonly edgeStateChangedEmitter = new TinyEmitter<[ TEdge, EdgeState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TEdgeData>,
    edgeStateMap: Map<TEdge, EdgeState> = new Map()
  ) {
    super( board, edgeStateMap );
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    if ( this.edgeStateMap.has( edge ) ) {
      return this.edgeStateMap.get( edge )!;
    }
    else {
      return this.parentState.getEdgeState( edge );
    }
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    const oldState = this.getEdgeState( edge );

    if ( oldState !== state ) {
      this.edgeStateMap.set( edge, state );

      this.edgeStateChangedEmitter.emit( edge, state );
    }
  }

  public clone(): GeneralEdgeDelta {
    return new GeneralEdgeDelta( this.board, this.parentState, new Map( this.edgeStateMap ) );
  }

  public createDelta(): TDelta<TEdgeData> {
    return new GeneralEdgeDelta( this.board, this, new Map() );
  }

  public serializeState( board: TBoard ): TSerializedEdgeData {
    return serializeEdgeData( board, this );
  }
}