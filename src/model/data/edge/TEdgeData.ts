import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TEmitter } from 'phet-lib/axon';

export interface TEdgeData {
  getEdgeState( edge: TEdge ): EdgeState;

  setEdgeState( edge: TEdge, state: EdgeState ): void;

  // TODO: consider passing in the old value?
  edgeStateChangedEmitter: TEmitter<[ TEdge, EdgeState ]>;
}

export type TEdgeDataListener = ( edge: TEdge, state: EdgeState ) => void;
