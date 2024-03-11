import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import SectorState, { TSerializedSectorState } from './SectorState.ts';
import { TSector } from './TSector.ts';
import { serializeHalfEdge, TSerializedHalfEdge } from '../../board/core/THalfEdge.ts';

export interface TSectorData {
  // a sector is effectively halfEdge and halfEdge.next
  getSectorState( sector: TSector ): SectorState;

  setSectorState( sector: TSector, state: SectorState ): void;

  sectorChangedEmitter: TEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]>;
}

export type TSectorDataListener = ( edge: TSector, state: SectorState, oldState: SectorState ) => void;

export interface TSerializedSectorData extends TSerializedState {
  type: 'SectorData';
  sectors: {
    sector: TSerializedHalfEdge;
    state: TSerializedSectorState;
  }[];
}

export const serializeSectorData = ( board: TBoard, sectorData: TSectorData ): TSerializedSectorData => ( {
  type: 'SectorData',
  sectors: board.halfEdges.filter( sector => sectorData.getSectorState( sector ) !== SectorState.ANY ).map( sector => ( {
    sector: serializeHalfEdge( sector ),
    state: sectorData.getSectorState( sector ).serialize()
  } ) )
} );
