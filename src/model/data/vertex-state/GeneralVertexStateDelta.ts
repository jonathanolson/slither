import { TBoard } from '../../board/core/TBoard.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import { GeneralVertexStateAction } from './GeneralVertexStateAction.ts';
import { TSerializedVertexStateData, TVertexStateData, serializeVertexStateData } from './TVertexStateData.ts';
import { VertexState } from './VertexState.ts';

import { TinyEmitter } from 'phet-lib/axon';

export class GeneralVertexStateDelta extends GeneralVertexStateAction implements TDelta<TVertexStateData> {
  public readonly vertexStateChangedEmitter = new TinyEmitter<
    [vertex: TVertex, state: VertexState, oldState: VertexState]
  >();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TVertexStateData>,
    vertexStateMap: Map<TVertex, VertexState> = new Map(),
  ) {
    super(board, vertexStateMap);
  }

  public getVertexState(vertex: TVertex): VertexState {
    if (this.vertexStateMap.has(vertex)) {
      return this.vertexStateMap.get(vertex)!;
    } else {
      return this.parentState.getVertexState(vertex);
    }
  }

  public setVertexState(vertex: TVertex, state: VertexState): void {
    const oldState = this.getVertexState(vertex);

    if (!oldState.equals(state)) {
      this.vertexStateMap.set(vertex, state);

      this.vertexStateChangedEmitter.emit(vertex, state, oldState);
    }
  }

  public clone(): GeneralVertexStateDelta {
    return new GeneralVertexStateDelta(this.board, this.parentState, new Map(this.vertexStateMap));
  }

  public createDelta(): TDelta<TVertexStateData> {
    return new GeneralVertexStateDelta(this.board, this, new Map());
  }

  public serializeState(board: TBoard): TSerializedVertexStateData {
    return serializeVertexStateData(board, this);
  }
}
