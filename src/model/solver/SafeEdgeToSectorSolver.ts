import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeData, TEdgeDataListener } from '../data/edge/TEdgeData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TSectorData } from '../data/sector/TSectorData.ts';
import { TSector } from '../data/sector/TSector.ts';
import SectorState from '../data/sector/SectorState.ts';
import { SectorStateSetAction } from '../data/sector/SectorStateSetAction.ts';

type Data = TEdgeData & TSectorData;

// sector + edges => sector
export class SafeEdgeToSectorSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtySectors = new Set<TSector>();

  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>
  ) {
    board.halfEdges.forEach( sector => this.dirtySectors.add( sector ) );

    this.edgeListener = ( edge: TEdge, state: EdgeState, oldState: EdgeState ) => {
      this.dirtySectors.add( edge.forwardHalf );
      this.dirtySectors.add( edge.forwardHalf.previous );
      this.dirtySectors.add( edge.reversedHalf );
      this.dirtySectors.add( edge.reversedHalf.previous );
    };

    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtySectors.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtySectors.size ) {
      const sector: TSector = this.dirtySectors.values().next().value;
      this.dirtySectors.delete( sector );

      const edgeA = sector.edge;
      const edgeB = sector.next.edge;

      const edgeStateA = this.state.getEdgeState( edgeA );
      const edgeStateB = this.state.getEdgeState( edgeB );

      const initialSectorState = this.state.getSectorState( sector );
      let sectorState = initialSectorState;

      const whiteCount = ( edgeStateA === EdgeState.WHITE ? 1 : 0 ) + ( edgeStateB === EdgeState.WHITE ? 1 : 0 );
      const blackCount = ( edgeStateA === EdgeState.BLACK ? 1 : 0 ) + ( edgeStateB === EdgeState.BLACK ? 1 : 0 );
      const redCount = ( edgeStateA === EdgeState.RED ? 1 : 0 ) + ( edgeStateB === EdgeState.RED ? 1 : 0 );

      if ( whiteCount === 0 ) {
        sectorState = SectorState.getOnly( blackCount );
      }
      else if ( whiteCount === 1 ) {
        if ( blackCount && sectorState.zero ) {
          sectorState = sectorState.withDisallowZero();
        }
        if ( redCount && sectorState.two ) {
          sectorState = sectorState.withDisallowTwo();
        }
      }

      if ( sectorState !== initialSectorState ) {
        return new AnnotatedAction( new SectorStateSetAction( sector, sectorState ), {
          type: whiteCount === 1 ? 'SingleEdgeToSector' : 'DoubleEdgeToSector',
          sector: sector,
          beforeState: initialSectorState,
          afterState: sectorState
        } );
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): SafeEdgeToSectorSolver {
    return new SafeEdgeToSectorSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}
