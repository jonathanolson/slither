import { TSolver } from './TSolver.ts';
import { CompositeAction, EdgeStateSetAction, TAction, TBoard, TEdge, TEdgeData, TFaceData, TSimpleRegion, TSimpleRegionData, TSimpleRegionDataListener, TState, TVertex } from '../structure.ts';
import { InvalidStateError } from './InvalidStateError.ts';
import EdgeState from '../EdgeState.ts';

export type SimpleLoopSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
  resolveAllRegions: boolean;
};

export class SimpleLoopSolver implements TSolver<TFaceData & TEdgeData & TSimpleRegionData, TAction<TFaceData & TEdgeData & TSimpleRegionData>> {

  private readonly dirtySimpleRegions: Set<TSimpleRegion>;
  private hasDirtyWeirdEdges: boolean = false;

  private readonly simpleRegionListener: TSimpleRegionDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TFaceData & TEdgeData & TSimpleRegionData>,
    private readonly options: SimpleLoopSolverOptions,
    dirtySimpleRegions?: Iterable<TSimpleRegion>
  ) {
    if ( dirtySimpleRegions ) {
      this.dirtySimpleRegions = new Set( dirtySimpleRegions );
    }
    else {
      this.dirtySimpleRegions = new Set( state.getSimpleRegions() );
    }

    this.simpleRegionListener = (
      addedRegions: Iterable<TSimpleRegion>,
      removedRegions: Iterable<TSimpleRegion>,
      addedWeirdEdges: Iterable<TEdge>,
      removedWeirdEdges: Iterable<TEdge>
    ) => {
      for ( const region of removedRegions ) {
        this.dirtySimpleRegions.delete( region );
      }
      for ( const region of addedRegions ) {
        this.dirtySimpleRegions.add( region );
      }
      this.hasDirtyWeirdEdges = state.getWeirdEdges().length > 0;
    };

    this.state.simpleRegionsChangedEmitter.addListener( this.simpleRegionListener );
  }

  public get dirty(): boolean {
    return this.dirtySimpleRegions.size > 0 || this.hasDirtyWeirdEdges;
  }

  public nextAction(): TAction<TFaceData & TEdgeData & TSimpleRegionData> | null {
    if ( !this.dirty ) { return null; }

    if ( this.state.getWeirdEdges().length ) {
      throw new InvalidStateError( 'has weird edges' );
    }

    const dirtySet = this.options.resolveAllRegions ? new Set( this.state.getSimpleRegions() ) : this.dirtySimpleRegions;

    while ( dirtySet.size > 0 ) {
      const region = dirtySet.values().next().value;

      if ( !region.isSolved ) {
        const startVertex = region.a;
        const endVertex = region.b;
        const startEdge = region.halfEdges[ 0 ].edge;

        // TODO: create more primitives for tracing these forced paths in the future

        // Look at all potential candidate edges (to see if we can rule something out)
        for ( const candidateEdge of startVertex.edges ) {
          if ( candidateEdge === startEdge || this.state.getEdgeState( candidateEdge ) === EdgeState.RED ) { continue; }

          const edges = [ candidateEdge ];
          let currentEdge = candidateEdge;
          let currentVertex: TVertex = candidateEdge.getOtherVertex( startVertex );

          while ( currentVertex !== endVertex ) {
            let hasBlack = false;
            const forcedEdges = currentVertex.edges.filter( edge => {
              if ( edge === currentEdge ) {
                return false;
              }

              const state = this.state.getEdgeState( edge );

              if ( state === EdgeState.BLACK ) {
                hasBlack = true;
              }

              return state === EdgeState.WHITE;
            } );

            // If we have a black edge OR we aren't forced into one white edge, we can't continue
            if ( forcedEdges.length !== 1 || hasBlack ) {
              break;
            }

            currentEdge = forcedEdges[ 0 ];
            edges.push( currentEdge );
            currentVertex = currentEdge.getOtherVertex( currentVertex );
          }

          // We have a forced loop around!
          if ( currentVertex === endVertex ) {
            if ( this.isSolvedWithAddedEdges( region, edges ) ) {
              if ( this.options.solveToBlack ) {
                return new CompositeAction( edges.map( edge => new EdgeStateSetAction( edge, EdgeState.BLACK ) ) );
              }
            }
            else {
              if ( this.options.solveToRed ) {
                return new CompositeAction( edges.map( edge => new EdgeStateSetAction( edge, EdgeState.RED ) ) );
              }
            }
          }
        }
      }

      // Only delete it once we've verified it's good (it's possible to construct regions that can have multiple cut branches
      dirtySet.delete( region );
    }

    return null;
  }

  private isSolvedWithAddedEdges( region: TSimpleRegion, edges: TEdge[] ): boolean {
    const edgeSet = new Set( region.edges );
    for ( const edge of edges ) {
      edgeSet.add( edge );
    }

    for ( const face of this.board.faces ) {
      const faceValue = this.state.getFaceState( face );
      if ( faceValue !== null ) {
        const count = face.edges.filter( faceEdge => edgeSet.has( faceEdge ) ).length;
        if ( count !== faceValue ) {
          return false;
        }
      }
    }

    return true;
  }

  public clone( equivalentState: TState<TFaceData & TEdgeData & TSimpleRegionData> ): SimpleLoopSolver {
    return new SimpleLoopSolver( this.board, equivalentState, this.options, this.dirtySimpleRegions );
  }

  public dispose(): void {
    this.state.simpleRegionsChangedEmitter.removeListener( this.simpleRegionListener );
  }
}
