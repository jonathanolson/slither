import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeData, TEdgeDataListener } from '../data/edge/TEdgeData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TSectorData, TSectorDataListener } from '../data/sector/TSectorData.ts';
import { TSector } from '../data/sector/TSector.ts';
import SectorState from '../data/sector/SectorState.ts';
import { TFaceColor, TFaceColorData, TFaceColorDataListener } from '../data/face-color/TFaceColorData.ts';
import { TVertexData } from '../data/vertex/TVertexData.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';
import { TFace } from '../board/core/TFace.ts';
import { VertexState } from '../data/vertex/VertexState.ts';
import { VertexStateSetAction } from '../data/vertex/VertexStateSetAction.ts';

type Data = TEdgeData & TSectorData & TFaceColorData & TVertexData;

// sector + edges => sector
export class SafeEdgeSectorColorToVertexSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyVertices = new Set<TVertex>();

  private readonly edgeListener: TEdgeDataListener;
  private readonly sectorListener: TSectorDataListener;
  private readonly faceColorListener: TFaceColorDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>
  ) {
    board.vertices.forEach( vertex => this.dirtyVertices.add( vertex ) );

    this.edgeListener = ( edge: TEdge, state: EdgeState, oldState: EdgeState ) => {
      this.dirtyVertices.add( edge.start );
      this.dirtyVertices.add( edge.end );
    };
    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );

    this.sectorListener = ( sector: TSector, state: SectorState, oldState: SectorState ) => {
      this.dirtyVertices.add( sector.start );
    };
    this.state.sectorChangedEmitter.addListener( this.sectorListener );

    this.faceColorListener = (
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ) => {
      // TODO: factor out this type of listener? OR BETTER YET compute this to send to the listener

      for ( const face of changedFaces ) {
        for ( const vertex of face.vertices ) {
          this.dirtyVertices.add( vertex );
        }
      }

      for ( const faceColor of oppositeChangedFaceColors ) {
        const faces = this.state.getFacesWithColor( faceColor );
        for ( const face of faces ) {
          for ( const vertex of face.vertices ) {
            this.dirtyVertices.add( vertex );
          }
        }
      }
    };
    this.state.faceColorsChangedEmitter.addListener( this.faceColorListener );
  }

  public get dirty(): boolean {
    return this.dirtyVertices.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyVertices.size ) {
      const vertex: TVertex = this.dirtyVertices.values().next().value;
      this.dirtyVertices.delete( vertex );

      const oldState = this.state.getVertexState( vertex );

      // TODO: consider moving that code in here?
      // NOTE: the AND here is because if we have MORE advanced deductions in, we want to keep them
      const newState = VertexState.fromEdgeColorSectorData( vertex, this.state ).and( oldState );

      if ( !oldState.equals( newState ) ) {
        return new AnnotatedAction( new VertexStateSetAction( vertex, newState ), {
          type: 'VertexState',
          vertex: vertex,
          beforeState: oldState,
          afterState: newState,
        } );
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): SafeEdgeSectorColorToVertexSolver {
    return new SafeEdgeSectorColorToVertexSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
    this.state.sectorChangedEmitter.removeListener( this.sectorListener );
    this.state.faceColorsChangedEmitter.removeListener( this.faceColorListener );
  }
}
