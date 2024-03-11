import { TState } from '../core/TState.ts';
import { serializeSectorData, TSectorData, TSerializedSectorData } from './TSectorData.ts';
import SectorState, { TSerializedSectorState } from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSector } from './TSector.ts';
import { deserializeHalfEdge, TSerializedHalfEdge } from '../../board/core/THalfEdge.ts';
import { GeneralSectorDelta } from './GeneralSectorDelta.ts';

// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta

// TODO: faster forms for Square in particular (bit-pack the states!)
export class GeneralSectorData implements TState<TSectorData> {

  public readonly sectorChangedEmitter = new TinyEmitter<[ sector: TSector, state: SectorState, oldState: SectorState ]>();

  public readonly sectorStateMap: Map<TSector, SectorState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialSectorState: ( sector: TSector ) => SectorState
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

      this.sectorChangedEmitter.emit( sector, state, oldState );
    }
  }

  public clone(): GeneralSectorData {
    return new GeneralSectorData( this.board, sector => this.getSectorState( sector ) );
  }

  public createDelta(): TDelta<TSectorData> {
    return new GeneralSectorDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedSectorData {
    return serializeSectorData( board, this );
  }

  public static deserializeState( board: TBoard, serializedSectorData: TSerializedSectorData ): GeneralSectorData {
    const map: Map<TSector, SectorState> = new Map( serializedSectorData.sectors.map( ( serializedSectorState: { sector: TSerializedHalfEdge; state: TSerializedSectorState } ) => [
      deserializeHalfEdge( board, serializedSectorState.sector ),
      SectorState.deserialize( serializedSectorState.state )
    ] ) );

    return new GeneralSectorData(
      board,
      sector => map.get( sector ) ?? SectorState.ANY
    );
  }
}