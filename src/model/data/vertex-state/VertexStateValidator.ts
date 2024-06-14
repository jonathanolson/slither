import { TState } from '../core/TState.ts';
import { TSerializedVertexStateData, TVertexStateData } from './TVertexStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { VertexState } from './VertexState.ts';

export class VertexStateValidator implements TState<TVertexStateData> {
  public readonly vertexStateChangedEmitter = new TinyEmitter<
    [vertex: TVertex, state: VertexState, oldState: VertexState]
  >();

  public constructor(
    private readonly board: TBoard,
    private readonly currentState: TState<TVertexStateData>,
    private readonly solvedState: TState<TVertexStateData>,
  ) {}

  public getVertexState(vertex: TVertex): VertexState {
    return this.currentState.getVertexState(vertex);
  }

  public setVertexState(vertex: TVertex, state: VertexState): void {
    assertEnabled() && assert(this.board.vertices.includes(vertex));

    const solvedState = this.solvedState.getVertexState(vertex);
    if (!solvedState.isSubsetOf(state)) {
      // TODO: how can we stringify this? toString() on VertexState
      throw new InvalidStateError(`Attempt to make vertex ${state} when it should be ${solvedState}`);
    }

    const oldState = this.currentState.getVertexState(vertex);
    if (!state.isSubsetOf(oldState)) {
      throw new InvalidStateError('Do not generalize vertex state');
    }
  }

  public clone(): VertexStateValidator {
    return this;
  }

  public createDelta(): TDelta<TVertexStateData> {
    return this as unknown as TDelta<TVertexStateData>;
  }

  public serializeState(board: TBoard): TSerializedVertexStateData {
    throw new Error('unimplemented');
  }
}
