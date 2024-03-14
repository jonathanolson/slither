import { TEmitter } from 'phet-lib/axon';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import SectorState, { TSerializedSectorState } from './SectorState.ts';
import { TSector } from './TSector.ts';
import { serializeHalfEdge, TSerializedHalfEdge } from '../../board/core/THalfEdge.ts';

export interface TSectorStateData {
  // a sector is effectively halfEdge and halfEdge.next
  getSectorState( sector: TSector ): SectorState;

  setSectorState( sector: TSector, state: SectorState ): void;

  sectorStateChangedEmitter: TEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]>;
}

export type TSectorStateListener = ( edge: TSector, state: SectorState, oldState: SectorState ) => void;

export interface TSerializedSectorStateData extends TSerializedState {
  type: 'SectorStateData';
  sectors: {
    sector: TSerializedHalfEdge;
    state: TSerializedSectorState;
  }[];
}

export const serializeSectorStateData = ( board: TBoard, sectorData: TSectorStateData ): TSerializedSectorStateData => ( {
  type: 'SectorStateData',
  sectors: board.halfEdges.filter( sector => sectorData.getSectorState( sector ) !== SectorState.ANY ).map( sector => ( {
    sector: serializeHalfEdge( sector ),
    state: sectorData.getSectorState( sector ).serialize()
  } ) )
} );