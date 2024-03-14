import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData, TEdgeStateListener } from '../data/edge-state/TEdgeStateData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TSectorStateData, TSectorStateListener } from '../data/sector-state/TSectorStateData.ts';
import { TSector } from '../data/sector-state/TSector.ts';
import SectorState from '../data/sector-state/SectorState.ts';
import { TFaceColor, TFaceColorData, TFaceColorListener } from '../data/face-color/TFaceColorData.ts';
import { TVertexStateData } from '../data/vertex-state/TVertexStateData.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';
import { TFace } from '../board/core/TFace.ts';
import { VertexState } from '../data/vertex-state/VertexState.ts';
import { VertexStateSetAction } from '../data/vertex-state/VertexStateSetAction.ts';

type Data = TEdgeStateData & TSectorStateData & TFaceColorData & TVertexStateData;

/**
 * Some related notes

- Vertex + all sectors => sectors/edges update (or... also face colors)
  - OMG, OMG, just (cubic... in time? this hopefully is fast enough):
    - FIRST check all edges around vertex. If they are all set, ABORT.
    - create a fresh state for each sector (NONE)
    - create a pair of booleans for each edge (canBeBlack: false, canBeRed: false)
    - Enumerate all the cases:
      - if a case satisfies all of the input sector states:
        - make the sector state field that happened to TRUE for those "fresh states"
        - make the edge fields that happened to TRUE for those edges
    - if edges are just a single type, color them black/red (if they aren't already)
    - adjust sector types by ANDing our fresh ones with the current ones, look for changes
  - if 2 edges:
    - AND them, and be done with it
    - OH, and exclude 1s (might as well)
  - if 3+ edges:
    - "adjacent" sectors share 1 edge
    - "non-adjacent" sectors share 0 edges
    - possibilities:
      - 0, 1, 2, 0-1, 0-2, 1-2, 0-1-2, (NONE)
    - only interesting are:
      - 0-1, 0-2, 1, 1-2   (note: we will have 0s and 0-1-2s - ignore possibility of 2-only as that is already solved)
    -
    - If we think SAT-style:
      - 0 is !A ^ !B
      - 1 is A xor B e.g. ....
      - 2 is A ^ B
      - 0-1 is not-2, e.g. (!A or !B)
      - 0-2 is not-1, e.g. (!A or B)
      - 1-2 is not-0, e.g. (A or B)
      - 0-1-2 is... true.
      - ... we could just SAT this, bleh
    -
    - GUARANTEED SafeEdgeToSectorSolver, so we don't have to worry about awkward cases
    - Quick Removals (do first, and keep dirty), since this reduces the later logic - NOTE more efficient to keep in memory and keep applying reductions? maybe a future thing
      - any 2 (only) short-circuits to handle (2x black, Nx red)
      - any NONE error out
      - adjacent 0-1 and 1-2: both get 1'd with black shared edge (1x black, 2x red)
      - adjacent 0-2 and 0-2: all 0'd (3x red)
      - adjacent 0-2 and 1: 0-2 gets 2'd (2x black, 1 red)
      - adjacent 0-2 and 1-2: 0-2 gets 2'd, 1-2 gets 1'd (2x black, 1x red)
      - adjacent 0-2 and 0-1-2: convert 0-1-2 to 0-1 (no edges)
      - non-adjacent 1-2s get 1'ed out (no edges)
    - Now:
      - Only 0, 1, 0-1, 0-2, 1-2, 0-1-2
      - 0-2 only adjacent to 0-1
      - 0 only adjacent to 0-1, 0-1-2
      - 1 only adjacent to 1, 0-1, 1-2, 0-1-2
      - 0-1 only adjacent to 0, 1, 0-1, 0-2, 0-1-2
      - 1-2 only adjacent to 1, 0-1, 1-2, 0-1-2
      - 0-1-2 only adjacent to 0, 1, 0-1, 1-2, 0-1-2
    -
    - IF we have a single black edge:
      - We HAVE to have an exit
      - All non-adjacent to the black edge will have 2's removed, thus:
        - adjacent to black: 1/1-2
        - non-adjacent to black: 0/0-1/1
        - JUST... enumerate the cases, and see what can potentially change?
        - IF there is a 1 non-black-adjacent, red-out everything but its two edges and the black edge
        - (thus after, all non-adjacent are 0/0-1)
        - IF black-adjacent is 1 and 1/1-2 (with another 0-1 only next to it) and all the rest are 0s, we have a forced exit (... would we already know this from another solver?)
        - IF black-adjacent is 1 and 1, and there is a single pair of adjacent 0-1s (all others are 0), we have a forced exit
    - IF we have no black edges:
      - DO count scan first, since that might reduce things
      -
      - sparse:
        - IF there is ONLY one sector that has a 1 or 2 (all others are 0), remove the 1 from it
      -
      - counts (surroundings have 0s?):
        - one 1/1-2: 1
        - two adjacent 1/1-2: 1 (could just be shared edge), no other deductions
        - three adjacent 1/1-2: 2 (1 only on side ones, central one can still be 1/1-2)
        - four adjacent 1/1-2: 2 (0 everything else, the 5 edges need to be red black red black red)
        - Use:
          - If we have two separate 1-count clusters, for each cluster:
            - x all the 2s (can't have any triple-sector clusters)
            - if it is a pair of non-zero (1s now), black the middle edge, red the outsides
          - If we have a single 1-count cluster, we'll need to find an exit
            - x out all the 2s that are NOT ... adjacent(?) to this cluster
 */

export class SafeEdgeSectorColorToVertexSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyVertices = new Set<TVertex>();

  private readonly edgeListener: TEdgeStateListener;
  private readonly sectorListener: TSectorStateListener;
  private readonly faceColorListener: TFaceColorListener;

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
      this.dirtyVertices.add( sector.end );
    };
    this.state.sectorStateChangedEmitter.addListener( this.sectorListener );

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
    this.state.sectorStateChangedEmitter.removeListener( this.sectorListener );
    this.state.faceColorsChangedEmitter.removeListener( this.faceColorListener );
  }
}
