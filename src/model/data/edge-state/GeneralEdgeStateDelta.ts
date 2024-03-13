import { GeneralEdgeStateAction } from './GeneralEdgeStateAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeEdgeStateData, TEdgeStateData, TSerializedEdgeStateData } from './TEdgeStateData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';

export class GeneralEdgeStateDelta extends GeneralEdgeStateAction implements TDelta<TEdgeStateData> {

  public readonly edgeStateChangedEmitter = new TinyEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TEdgeStateData>,
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

      this.edgeStateChangedEmitter.emit( edge, state, oldState );
    }
  }

  public clone(): GeneralEdgeStateDelta {
    return new GeneralEdgeStateDelta( this.board, this.parentState, new Map( this.edgeStateMap ) );
  }

  public createDelta(): TDelta<TEdgeStateData> {
    return new GeneralEdgeStateDelta( this.board, this, new Map() );
  }

  public serializeState( board: TBoard ): TSerializedEdgeStateData {
    return serializeEdgeStateData( board, this );
  }
}