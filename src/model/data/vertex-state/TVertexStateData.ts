import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeVertex, TSerializedVertex, TVertex } from '../../board/core/TVertex.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';

export interface TVertexStateData {
  getVertexState( vertex: TVertex ): VertexState;

  setVertexState( vertex: TVertex, state: VertexState ): void;

  vertexStateChangedEmitter: TEmitter<[ edge: TVertex, state: VertexState, oldState: VertexState ]>;
}

export type TVertexStateListener = ( edge: TVertex, state: VertexState, oldState: VertexState ) => void;

export interface TSerializedVertexStateData extends TSerializedState {
  type: 'VertexStateData';
  vertices: {
    vertex: TSerializedVertex;
    state: TSerializedVertexState;
  }[];
}

export const serializeVertexStateData = ( board: TBoard, vertexData: TVertexStateData ): TSerializedVertexStateData => ( {
  type: 'VertexStateData',
  vertices: board.vertices.filter( vertex => !vertexData.getVertexState( vertex ).isAny() ).map( vertex => ( {
    vertex: serializeVertex( vertex ),
    state: vertexData.getVertexState( vertex ).serialize()
  } ) )
} );
