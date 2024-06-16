import { TBoard } from '../../board/core/TBoard.ts';
import { TSerializedVertex } from '../../board/core/TSerializedVertex.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { deserializeVertex } from '../../board/core/deserializeVertex.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import { GeneralVertexStateDelta } from './GeneralVertexStateDelta.ts';
import { TSerializedVertexStateData, TVertexStateData, serializeVertexStateData } from './TVertexStateData.ts';
import { TSerializedVertexState, VertexState } from './VertexState.ts';

import { TinyEmitter } from 'phet-lib/axon';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class GeneralVertexStateData implements TState<TVertexStateData> {
  public readonly vertexStateChangedEmitter = new TinyEmitter<
    [vertex: TVertex, state: VertexState, oldState: VertexState]
  >();

  public readonly vertexStateMap: Map<TVertex, VertexState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialVertexState: (vertex: TVertex) => VertexState = VertexState.any,
  ) {
    board.vertices.forEach((vertex) => {
      this.vertexStateMap.set(vertex, getInitialVertexState(vertex));
    });
  }

  public getVertexState(vertex: TVertex): VertexState {
    assertEnabled() && assert(this.vertexStateMap.has(vertex));

    return this.vertexStateMap.get(vertex)!;
  }

  public setVertexState(vertex: TVertex, state: VertexState): void {
    assertEnabled() && assert(this.vertexStateMap.has(vertex));

    const oldState = this.vertexStateMap.get(vertex)!;

    if (!oldState.equals(state)) {
      this.vertexStateMap.set(vertex, state);

      this.vertexStateChangedEmitter.emit(vertex, state, oldState);
    }
  }

  public clone(): GeneralVertexStateData {
    return new GeneralVertexStateData(this.board, (vertex) => this.getVertexState(vertex));
  }

  public createDelta(): TDelta<TVertexStateData> {
    return new GeneralVertexStateDelta(this.board, this);
  }

  public serializeState(board: TBoard): TSerializedVertexStateData {
    return serializeVertexStateData(board, this);
  }

  public static deserializeState(
    board: TBoard,
    serializedVertexData: TSerializedVertexStateData,
  ): GeneralVertexStateData {
    const map: Map<TVertex, VertexState> = new Map(
      serializedVertexData.vertices.map(
        (serializedVertexState: { vertex: TSerializedVertex; state: TSerializedVertexState }) => {
          const vertex = deserializeVertex(board, serializedVertexState.vertex);
          return [vertex, VertexState.deserialize(vertex, serializedVertexState.state)];
        },
      ),
    );

    return new GeneralVertexStateData(board, (vertex) => map.get(vertex) ?? VertexState.any(vertex));
  }
}
