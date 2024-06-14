import { GeneralSectorStateAction } from './GeneralSectorStateAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeSectorStateData, TSectorStateData, TSerializedSectorStateData } from './TSectorStateData.ts';
import SectorState from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSector } from './TSector.ts';

export class GeneralSectorStateDelta extends GeneralSectorStateAction implements TDelta<TSectorStateData> {
  public readonly sectorStateChangedEmitter = new TinyEmitter<
    [sector: TSector, state: SectorState, oldState: SectorState]
  >();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TSectorStateData>,
    sectorStateMap: Map<TSector, SectorState> = new Map(),
  ) {
    super(board, sectorStateMap);
  }

  public getSectorState(sector: TSector): SectorState {
    if (this.sectorStateMap.has(sector)) {
      return this.sectorStateMap.get(sector)!;
    } else {
      return this.parentState.getSectorState(sector);
    }
  }

  public setSectorState(sector: TSector, state: SectorState): void {
    const oldState = this.getSectorState(sector);

    if (oldState !== state) {
      this.sectorStateMap.set(sector, state);

      this.sectorStateChangedEmitter.emit(sector, state, oldState);
    }
  }

  public clone(): GeneralSectorStateDelta {
    return new GeneralSectorStateDelta(this.board, this.parentState, new Map(this.sectorStateMap));
  }

  public createDelta(): TDelta<TSectorStateData> {
    return new GeneralSectorStateDelta(this.board, this, new Map());
  }

  public serializeState(board: TBoard): TSerializedSectorStateData {
    return serializeSectorStateData(board, this);
  }
}
