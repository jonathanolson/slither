import { TState } from '../core/TState.ts';
import { serializeSectorStateData, TSectorStateData, TSerializedSectorStateData } from './TSectorStateData.ts';
import SectorState, { TSerializedSectorState } from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSector } from './TSector.ts';
import { deserializeHalfEdge, TSerializedHalfEdge } from '../../board/core/THalfEdge.ts';
import { GeneralSectorStateDelta } from './GeneralSectorStateDelta.ts';

export class GeneralSectorStateData implements TState<TSectorStateData> {

  public readonly sectorStateChangedEmitter = new TinyEmitter<[ sector: TSector, state: SectorState, oldState: SectorState ]>();

  public readonly sectorStateMap: Map<TSector, SectorState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialSectorState: ( sector: TSector ) => SectorState = () => SectorState.ANY
  ) {
    board.halfEdges.forEach( sector => {
      this.sectorStateMap.set( sector, getInitialSectorState( sector ) );
    } );
  }

  public getSectorState( sector: TSector ): SectorState {
    assertEnabled() && assert( this.sectorStateMap.has( sector ) );

    return this.sectorStateMap.get( sector )!;
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    assertEnabled() && assert( this.sectorStateMap.has( sector ) );

    const oldState = this.sectorStateMap.get( sector )!;

    if ( oldState !== state ) {
      this.sectorStateMap.set( sector, state );

      this.sectorStateChangedEmitter.emit( sector, state, oldState );
    }
  }

  public clone(): GeneralSectorStateData {
    return new GeneralSectorStateData( this.board, sector => this.getSectorState( sector ) );
  }

  public createDelta(): TDelta<TSectorStateData> {
    return new GeneralSectorStateDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedSectorStateData {
    return serializeSectorStateData( board, this );
  }

  public static deserializeState( board: TBoard, serializedSectorData: TSerializedSectorStateData ): GeneralSectorStateData {
    const map: Map<TSector, SectorState> = new Map( serializedSectorData.sectors.map( ( serializedSectorState: { sector: TSerializedHalfEdge; state: TSerializedSectorState } ) => [
      deserializeHalfEdge( board, serializedSectorState.sector ),
      SectorState.deserialize( serializedSectorState.state )
    ] ) );

    return new GeneralSectorStateData(
      board,
      sector => map.get( sector ) ?? SectorState.ANY
    );
  }
}