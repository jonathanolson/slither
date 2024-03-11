import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TSectorData } from './TSectorData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import SectorState, { TSerializedSectorState } from './SectorState.ts';
import { TSector } from './TSector.ts';
import { deserializeHalfEdge, serializeHalfEdge, TSerializedHalfEdge } from '../../board/core/THalfEdge.ts';

export class GeneralSectorAction implements TAction<TSectorData> {
  public constructor(
    public readonly board: TBoard,
    public readonly sectorStateMap: Map<TSector, SectorState> = new Map()
  ) {}

  public apply( state: TSectorData ): void {
    for ( const [ sector, sectorState ] of this.sectorStateMap ) {
      state.setSectorState( sector, sectorState );
    }
  }

  public getUndo( state: TSectorData ): TAction<TSectorData> {
    const sectorStateMap = new Map<TSector, SectorState>();

    for ( const sector of this.sectorStateMap.keys() ) {
      sectorStateMap.set( sector, state.getSectorState( sector ) );
    }

    return new GeneralSectorAction( this.board, sectorStateMap );
  }

  public isEmpty(): boolean {
    return this.sectorStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralSectorAction',
      sectors: Array.from( this.sectorStateMap.entries() ).map( ( [ sector, sectorState ] ) => ( {
        sector: serializeHalfEdge( sector ),
        state: sectorState.serialize()
      } ) )
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): GeneralSectorAction {
    return new GeneralSectorAction(
      board,
      new Map( serializedAction.sectors.map( ( serializedSectorState: { sector: TSerializedHalfEdge; state: TSerializedSectorState } ) => [
        deserializeHalfEdge( board, serializedSectorState.sector ),
        SectorState.deserialize( serializedSectorState.state )
      ] ) )
    );
  }
}