import { serializeEdge, TEdge, TSerializedEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export interface TEdgeData {
  getEdgeState( edge: TEdge ): EdgeState;

  setEdgeState( edge: TEdge, state: EdgeState ): void;

  edgeStateChangedEmitter: TEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]>;
}

export type TEdgeDataListener = ( edge: TEdge, state: EdgeState, oldState: EdgeState ) => void;

export interface TSerializedEdgeData extends TSerializedState {
  type: 'EdgeData';
  edges: {
    edge: TSerializedEdge;
    state: string;
  }[];
}

export const serializeEdgeData = ( board: TBoard, edgeData: TEdgeData ): TSerializedEdgeData => ( {
  type: 'EdgeData',
  edges: board.edges.filter( edge => edgeData.getEdgeState( edge ) !== EdgeState.WHITE ).map( edge => ( {
    edge: serializeEdge( edge ),
    state: edgeData.getEdgeState( edge ).name
  } ) )
} );
