import { GeneralSectorAction } from './GeneralSectorAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeSectorData, TSectorData, TSerializedSectorData } from './TSectorData.ts';
import SectorState from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSector } from './TSector.ts';

export class GeneralSectorDelta extends GeneralSectorAction implements TDelta<TSectorData> {

  public readonly sectorChangedEmitter = new TinyEmitter<[ sector: TSector, state: SectorState, oldState: SectorState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TSectorData>,
    sectorStateMap: Map<TSector, SectorState> = new Map()
  ) {
    super( board, sectorStateMap );
  }

  public getSectorState( sector: TSector ): SectorState {
    if ( this.sectorStateMap.has( sector ) ) {
      return this.sectorStateMap.get( sector )!;
    }
    else {
      return this.parentState.getSectorState( sector );
    }
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    const oldState = this.getSectorState( sector );

    if ( oldState !== state ) {
      this.sectorStateMap.set( sector, state );

      this.sectorChangedEmitter.emit( sector, state, oldState );
    }
  }

  public clone(): GeneralSectorDelta {
    return new GeneralSectorDelta( this.board, this.parentState, new Map( this.sectorStateMap ) );
  }

  public createDelta(): TDelta<TSectorData> {
    return new GeneralSectorDelta( this.board, this, new Map() );
  }

  public serializeState( board: TBoard ): TSerializedSectorData {
    return serializeSectorData( board, this );
  }
}