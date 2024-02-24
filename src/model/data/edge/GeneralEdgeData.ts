import { TState } from '../core/TState.ts';
import { serializeEdgeData, TEdgeData, TSerializedEdgeData } from './TEdgeData.ts';
import { deserializeEdge, TEdge, TSerializedEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { GeneralEdgeDelta } from './GeneralEdgeDelta.ts';

// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta

// TODO: faster forms for Square in particular (bit-pack the states!)
export class GeneralEdgeData implements TState<TEdgeData> {

  public readonly edgeStateChangedEmitter = new TinyEmitter<[ TEdge, EdgeState ]>();

  public readonly edgeStateMap: Map<TEdge, EdgeState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialEdgeState: ( edge: TEdge ) => EdgeState
  ) {
    board.edges.forEach( edge => {
      this.edgeStateMap.set( edge, getInitialEdgeState( edge ) );
    } );
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    assertEnabled() && assert( this.edgeStateMap.has( edge ) );

    return this.edgeStateMap.get( edge )!;
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    assertEnabled() && assert( this.edgeStateMap.has( edge ) );

    const oldState = this.edgeStateMap.get( edge )!;

    if ( oldState !== state ) {
      this.edgeStateMap.set( edge, state );

      this.edgeStateChangedEmitter.emit( edge, state );
    }
  }

  public clone(): GeneralEdgeData {
    return new GeneralEdgeData( this.board, edge => this.getEdgeState( edge ) );
  }

  public createDelta(): TDelta<TEdgeData> {
    return new GeneralEdgeDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedEdgeData {
    return serializeEdgeData( board, this );
  }

  public static deserializeState( board: TBoard, serializedEdgeData: TSerializedEdgeData ): GeneralEdgeData {
    const map: Map<TEdge, EdgeState> = new Map( serializedEdgeData.edges.map( ( serializedEdgeState: { edge: TSerializedEdge; state: string } ) => [
      deserializeEdge( board, serializedEdgeState.edge ),
      EdgeState.enumeration.getValue( serializedEdgeState.state )
    ] ) );

    return new GeneralEdgeData(
      board,
      edge => map.get( edge ) ?? EdgeState.WHITE
    );
  }
}