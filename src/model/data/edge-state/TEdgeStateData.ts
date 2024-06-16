import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TSerializedEdge } from '../../board/core/TSerializedEdge.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { TSerializedState } from '../core/TSerializedState.ts';
import EdgeState from './EdgeState.ts';

import { TEmitter } from 'phet-lib/axon';

export interface TEdgeStateData {
  getEdgeState(edge: TEdge): EdgeState;

  setEdgeState(edge: TEdge, state: EdgeState): void;

  edgeStateChangedEmitter: TEmitter<[edge: TEdge, state: EdgeState, oldState: EdgeState]>;
}

export type TEdgeStateListener = (edge: TEdge, state: EdgeState, oldState: EdgeState) => void;

export interface TSerializedEdgeStateData extends TSerializedState {
  type: 'EdgeData';
  edges: {
    edge: TSerializedEdge;
    state: string;
  }[];
}

export const serializeEdgeStateData = (board: TBoard, edgeData: TEdgeStateData): TSerializedEdgeStateData => ({
  type: 'EdgeData',
  edges: board.edges
    .filter((edge) => edgeData.getEdgeState(edge) !== EdgeState.WHITE)
    .map((edge) => ({
      edge: serializeEdge(edge),
      state: edgeData.getEdgeState(edge).name,
    })),
});
