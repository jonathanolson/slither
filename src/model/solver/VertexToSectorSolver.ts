import { TSolver } from './TSolver.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { TState } from '../data/core/TState.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TVertexData, TVertexDataListener } from '../data/vertex/TVertexData.ts';
import { TSectorData } from '../data/sector/TSectorData.ts';
import { getSectorsFromVertex } from '../data/sector/getSectorsFromVertex.ts';
import SectorState from '../data/sector/SectorState.ts';
import { SectorStateSetAction } from '../data/sector/SectorStateSetAction.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TSector } from '../data/sector/TSector.ts';

type Data = TSectorData & TVertexData;

export class VertexToSectorSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyVertices: TVertex[] = [];

  private readonly vertexListener: TVertexDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyVertices?: TVertex[]
  ) {
    if ( dirtyVertices ) {
      this.dirtyVertices.push( ...dirtyVertices );
    }
    else {
      this.dirtyVertices.push( ...board.vertices );
    }

    this.vertexListener = ( vertex: TVertex ) => {
      this.dirtyVertices.push( vertex );
    };
    this.state.vertexChangedEmitter.addListener( this.vertexListener );
  }

  public get dirty(): boolean {
    return this.dirtyVertices.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyVertices.length ) {
      const vertex = this.dirtyVertices.pop()!;

      const vertexState = this.state.getVertexState( vertex );

      if ( vertexState.possibilityCount === 0 ) {
        throw new InvalidStateError( 'Vertex has no possibilities' );
      }

      const sectors = getSectorsFromVertex( vertex );
      const oldSectorStates = sectors.map( sector => this.state.getSectorState( sector ) );
      const newSectorStates = sectors.map( sector => SectorState.NONE );

      for ( const pair of vertexState.getAllowedPairs() ) {
        for ( let i = 0; i < sectors.length; i++ ) {
          const sector = sectors[ i ];

          const a = sector.edge;
          const b = sector.next.edge;
          const c = pair[ 0 ];
          const d = pair[ 1 ];

          const n = ( a === c || a === d ? 1 : 0 ) + ( b === c || b === d ? 1 : 0 );
          newSectorStates[ i ] = newSectorStates[ i ].with( n );
        }
      }
      if ( vertexState.allowsEmpty() ) {
        for ( let i = 0; i < sectors.length; i++ ) {
          newSectorStates[ i ] = newSectorStates[ i ].withZero( true );
        }
      }

      // Maintain information that we already know (that can't be locally deduced)
      for ( let i = 0; i < sectors.length; i++ ) {
        newSectorStates[ i ] = newSectorStates[ i ].and( oldSectorStates[ i ] );
      }

      for ( const newSectorState of newSectorStates ) {
        if ( newSectorState === SectorState.NONE ) {
          throw new InvalidStateError( 'Sector has no possibilities' );
        }
      }

      const changedSectors: TSector[] = [];
      const changedOldSectorStates: SectorState[] = [];
      const changedNewSectorStates: SectorState[] = [];

      for ( let i = 0; i < sectors.length; i++ ) {
        if ( oldSectorStates[ i ] !== newSectorStates[ i ] ) {
          changedSectors.push( sectors[ i ] );
          changedOldSectorStates.push( oldSectorStates[ i ] );
          changedNewSectorStates.push( newSectorStates[ i ] );
        }
      }

      if ( changedSectors.length ) {
        return new AnnotatedAction( new CompositeAction(
          changedSectors.map( ( sector, i ) => new SectorStateSetAction( sector, changedNewSectorStates[ i ] ) )
        ), {
          type: 'VertexStateToSector',
          vertex: vertex,
          sectors: changedSectors,
          beforeStates: changedOldSectorStates,
          afterStates: changedNewSectorStates,
        } );
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): VertexToSectorSolver {
    return new VertexToSectorSolver( this.board, equivalentState, this.dirtyVertices );
  }

  public dispose(): void {
    this.state.vertexChangedEmitter.removeListener( this.vertexListener );
  }
}
