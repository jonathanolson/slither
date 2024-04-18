import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';
import { TSerializedVertex } from '../../board/core/TSerializedVertex.ts';
import { serializeVertex } from '../../board/core/serializeVertex.ts';

export interface TVertexStateData {
  getVertexState( vertex: TVertex ): VertexState;

  setVertexState( vertex: TVertex, state: VertexState ): void;

  vertexStateChangedEmitter: TEmitter<[ vertex: TVertex, state: VertexState, oldState: VertexState ]>;
}

export type TVertexStateListener = ( vertex: TVertex, state: VertexState, oldState: VertexState ) => void;

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
