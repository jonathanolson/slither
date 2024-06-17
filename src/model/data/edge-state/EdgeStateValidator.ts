import { CorrectnessState } from '../../CorrectnessState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import EdgeState from './EdgeState.ts';
import { TEdgeStateData, TSerializedEdgeStateData } from './TEdgeStateData.ts';

import { TinyEmitter } from 'phet-lib/axon';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class EdgeStateValidator implements TState<TEdgeStateData> {
  public readonly edgeStateChangedEmitter = new TinyEmitter<[edge: TEdge, state: EdgeState, oldState: EdgeState]>();

  public constructor(
    private readonly board: TBoard,
    private readonly currentState: TState<TEdgeStateData>,
    private readonly solvedState: TState<TEdgeStateData>,
  ) {}

  public getEdgeState(edge: TEdge): EdgeState {
    return this.currentState.getEdgeState(edge);
  }

  public setEdgeState(edge: TEdge, state: EdgeState): void {
    assertEnabled() && assert(this.board.edges.includes(edge));

    if (state !== EdgeState.WHITE) {
      const solvedState = this.solvedState.getEdgeState(edge);
      if (state !== solvedState) {
        throw new InvalidStateError(`Attempt to make edge ${state} when it should be ${solvedState}`);
      }
    }
  }

  public clone(): EdgeStateValidator {
    return this;
  }

  public createDelta(): TDelta<TEdgeStateData> {
    return this as unknown as TDelta<TEdgeStateData>;
  }

  public serializeState(board: TBoard): TSerializedEdgeStateData {
    throw new Error('unimplemented');
  }

  public static getCorrectnessState(
    board: TBoard,
    state: TState<TEdgeStateData>,
    solvedState: TState<TEdgeStateData>,
  ): CorrectnessState {
    const incorrectEdges = new Set<TEdge>();

    for (const edge of board.edges) {
      const edgeState = state.getEdgeState(edge);

      if (edgeState !== EdgeState.WHITE && edgeState !== solvedState.getEdgeState(edge)) {
        incorrectEdges.add(edge);
      }
    }

    return new CorrectnessState(incorrectEdges, new Set());
  }
}
