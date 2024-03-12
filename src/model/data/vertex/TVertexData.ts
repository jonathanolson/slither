import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeVertex, TSerializedVertex, TVertex } from '../../board/core/TVertex.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';

export interface TVertexData {
  getVertexState( vertex: TVertex ): VertexState;

  setVertexState( vertex: TVertex, state: VertexState ): void;

  vertexChangedEmitter: TEmitter<[ edge: TVertex, state: VertexState, oldState: VertexState ]>;
}

export type TVertexDataListener = ( edge: TVertex, state: VertexState, oldState: VertexState ) => void;

export interface TSerializedVertexData extends TSerializedState {
  type: 'VertexData';
  vertices: {
    vertex: TSerializedVertex;
    state: TSerializedVertexState;
  }[];
}

export const serializeVertexData = ( board: TBoard, vertexData: TVertexData ): TSerializedVertexData => ( {
  type: 'VertexData',
  vertices: board.vertices.filter( vertex => !vertexData.getVertexState( vertex ).isAny() ).map( vertex => ( {
    vertex: serializeVertex( vertex ),
    state: vertexData.getVertexState( vertex ).serialize()
  } ) )
} );
