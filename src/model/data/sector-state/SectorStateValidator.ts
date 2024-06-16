import { TBoard } from '../../board/core/TBoard.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { TEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import SectorState from './SectorState.ts';
import { TSector } from './TSector.ts';
import { TSectorStateData, TSerializedSectorStateData } from './TSectorStateData.ts';

import { TinyEmitter } from 'phet-lib/axon';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class SectorStateValidator implements TState<TSectorStateData> {
  public readonly sectorStateChangedEmitter = new TinyEmitter<
    [edge: TSector, state: SectorState, oldState: SectorState]
  >();

  public constructor(
    private readonly board: TBoard,
    private readonly currentState: TState<TSectorStateData>,
    private readonly solvedState: TState<TSectorStateData>,
  ) {}

  public getSectorState(edge: TSector): SectorState {
    return this.currentState.getSectorState(edge);
  }

  public setSectorState(sector: TSector, state: SectorState): void {
    assertEnabled() && assert(this.board.halfEdges.includes(sector));

    const solvedState = this.solvedState.getSectorState(sector);
    if (!solvedState.isSubsetOf(state)) {
      throw new InvalidStateError(`Attempt to make sector ${state} when it should be ${solvedState}`);
    }
  }

  public clone(): SectorStateValidator {
    return this;
  }

  public createDelta(): TDelta<TSectorStateData> {
    return this as unknown as TDelta<TSectorStateData>;
  }

  public serializeState(board: TBoard): TSerializedSectorStateData {
    throw new Error('unimplemented');
  }

  public static isStateCorrect(
    board: TBoard,
    state: TState<TSectorStateData>,
    solvedState: TState<TEdgeStateData>,
  ): boolean {
    for (const sector of board.halfEdges) {
      const edgeA = sector.edge;
      const edgeB = sector.next.edge;

      const sectorState = state.getSectorState(sector);

      const count =
        (solvedState.getEdgeState(edgeA) === EdgeState.BLACK ? 1 : 0) +
        (solvedState.getEdgeState(edgeB) === EdgeState.BLACK ? 1 : 0);

      if (!sectorState.allows(count)) {
        return false;
      }
    }

    return true;
  }
}
