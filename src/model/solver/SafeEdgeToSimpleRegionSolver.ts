import { TSolver } from './TSolver.ts';
import { TAction, TBoard, TEdge, TEdgeData, TEdgeDataListener, THalfEdge, TSimpleRegion, TSimpleRegionData, TState } from '../structure.ts';
import EdgeState from '../EdgeState.ts';
import _ from '../../workarounds/_.ts';
import { GeneralSimpleRegion, GeneralSimpleRegionAction } from '../region.ts';

let simpleRegionGlobalId = 0;

export class SafeEdgeToSimpleRegionSolver implements TSolver<TEdgeData & TSimpleRegionData, TAction<TEdgeData & TSimpleRegionData>> {

  private readonly dirtyEdges = new Set<TEdge>();

  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TEdgeData & TSimpleRegionData>
  ) {
    board.edges.forEach( edge => {
      this.dirtyEdges.add( edge );
    } );

    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      this.dirtyEdges.add( edge );
    };

    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyEdges.size > 0;
  }

  public nextAction(): TAction<TEdgeData & TSimpleRegionData> | null {
    if ( !this.dirty ) { return null; }

    const oldRegions = this.state.getSimpleRegions();
    const oldWeirdEdges = this.state.getWeirdEdges();

    // TODO: handle spiked 2s(!)

    const nowBlackEdges = new Set<TEdge>();
    const nowClearedEdges = new Set<TEdge>();

    for ( const edge of this.dirtyEdges ) {
      const edgeState = this.state.getEdgeState( edge );
      if ( edgeState === EdgeState.BLACK ) {
        nowBlackEdges.add( edge );
      }
      else {
        nowClearedEdges.add( edge );
      }
    }

    const addedRegions = new Set<TSimpleRegion>();
    const removedRegions = new Set<TSimpleRegion>();
    const regions = new Set<TSimpleRegion>( oldRegions );
    const addedWeirdEdges = new Set<TEdge>();
    const removedWeirdEdges = new Set<TEdge>();
    const weirdEdges = new Set<TEdge>( oldWeirdEdges );

    // Handle removals from weird edges
    for ( const edge of nowClearedEdges ) {
      if ( weirdEdges.has( edge ) ) {
        weirdEdges.delete( edge );
        removedWeirdEdges.add( edge );
      }
    }

    for ( const edge of nowBlackEdges ) {
      // Handle additions that duplicate weird edges (we'll leave the weird edge mark)
      if ( weirdEdges.has( edge ) ) {
        nowBlackEdges.delete( edge );
      }

      // Handle additions that duplicate actual regions
      if ( [ ...regions ].some( region => region.halfEdges.some( halfEdge => halfEdge.edge === edge ) ) ) {
        nowBlackEdges.delete( edge );
      }
    }

    // Now, we have three disjoint sets: nowBlackEdges, nowClearedEdges, and weirdEdges

    // Handle removals from actual regions
    for ( const region of oldRegions ) {
      if ( region.halfEdges.some( halfEdge => nowClearedEdges.has( halfEdge.edge ) ) ) {
        const halfEdgeRegions: THalfEdge[][] = [];
        let currentHalfEdgeRegion: THalfEdge[] = [];

        for ( const halfEdge of region.halfEdges ) {
          if ( !nowClearedEdges.has( halfEdge.edge ) ) {
            currentHalfEdgeRegion.push( halfEdge );
          }
          else if ( currentHalfEdgeRegion.length > 0 ) {
            halfEdgeRegions.push( currentHalfEdgeRegion );
            currentHalfEdgeRegion = [];
          }
        }
        if ( currentHalfEdgeRegion.length > 0 ) {
          halfEdgeRegions.push( currentHalfEdgeRegion );
        }

        removedRegions.add( region );
        regions.delete( region );

        if ( halfEdgeRegions.length ) {
          const largestHalfEdgeRegion = _.maxBy( halfEdgeRegions, halfEdgeRegion => halfEdgeRegion.length )!;

          for ( const halfEdgeRegion of halfEdgeRegions ) {
            const newRegion = new GeneralSimpleRegion(
              halfEdgeRegion === largestHalfEdgeRegion ? region.id : simpleRegionGlobalId++,
              halfEdgeRegion
            );
            addedRegions.add( newRegion );
            regions.add( newRegion );
          }
        }
      }
    }

    const attemptToAddEdge = ( edge: TEdge ): boolean => {
      const startVertex = edge.start;
      const endVertex = edge.end;

      // NOTE: guaranteed to NOT exist in our regions (by now)


      // Should only be at most
      const startRegion = [ ...regions ].find( region => region.a === startVertex || region.b === startVertex ) || null;
      const endRegion = [ ...regions ].find( region => region.a === endVertex || region.b === endVertex ) || null;

      // Check to see if it is a weird edge
      const startVertexEdgeCount = startVertex.edges.filter( vertexEdge => this.state.getEdgeState( vertexEdge ) === EdgeState.BLACK ).length;
      const endVertexEdgeCount = endVertex.edges.filter( vertexEdge => this.state.getEdgeState( vertexEdge ) === EdgeState.BLACK ).length;
      if ( startVertexEdgeCount > 2 || endVertexEdgeCount > 2 ) {
        // It's weird(!)
        return false;
      }

      const addRegion = ( region: TSimpleRegion ) => {
        regions.add( region );
        addedRegions.add( region );
      };
      const removeRegion = ( region: TSimpleRegion ) => {
        regions.delete( region );
        if ( addedRegions.has( region ) ) {
          addedRegions.delete( region );
        }
        else {
          removedRegions.add( region );
        }
      };

      const combineHalfEdgeArrays = ( ...arrays: THalfEdge[][] ): THalfEdge[] => {
        if ( arrays.length === 0 ) {
          return [];
        }
        let result = [
          ...arrays[ 0 ]
        ];
        for ( let i = 1; i < arrays.length; i++ ) {
          const arr = arrays[ i ];
          if ( arr.length === 0 ) {
            continue;
          }

          // TODO: could probably do things faster
          if ( result[ 0 ].start === arr[ 0 ].start ) {
            result = [
              ...arr.map( halfEdge => halfEdge.reversed ).reverse(),
              ...result
            ];
          }
          else if ( result[ 0 ].start === arr[ arr.length - 1 ].end ) {
            result = [
              ...arr,
              ...result
            ];
          }
          else if ( result[ result.length - 1 ].end === arr[ 0 ].start ) {
            // TODO: push instead?
            result = [
              ...result,
              ...arr
            ];
          }
          else if ( result[ result.length - 1 ].end === arr[ arr.length - 1 ].end ) {
            // TODO: push instead?
            result = [
              ...result,
              ...arr.map( halfEdge => halfEdge.reversed ).reverse()
            ];
          }
          else {
            throw new Error( 'Cannot combine half edge arrays' );
          }
        }
        return result;
      };

      if ( startRegion && endRegion ) {
        if ( startRegion === endRegion ) {
          // TODO: how do we handle... completed loops? Do we check to see if it is solved?
          // TODO: Do we... have a data type that checks these things?
          return false; // TODO: hah, we just mark it as weird.... for now?
        }
        else {
          // We are joining two regions(!)

          const primaryRegion = startRegion.halfEdges.length >= endRegion.halfEdges.length ? startRegion : endRegion;
          const secondaryRegion = primaryRegion === startRegion ? endRegion : startRegion;

          const newRegion = new GeneralSimpleRegion( primaryRegion.id, combineHalfEdgeArrays( primaryRegion.halfEdges, [ edge.forwardHalf ], secondaryRegion.halfEdges ) );

          removeRegion( primaryRegion );
          removeRegion( secondaryRegion );
          addRegion( newRegion );
        }
      }
      else if ( startRegion ) {
        const newRegion = new GeneralSimpleRegion( startRegion.id, combineHalfEdgeArrays( startRegion.halfEdges, [ edge.forwardHalf ] ) );

        removeRegion( startRegion );
        addRegion( newRegion );
      }
      else if ( endRegion ) {
        const newRegion = new GeneralSimpleRegion( endRegion.id, combineHalfEdgeArrays( endRegion.halfEdges, [ edge.forwardHalf ] ) );

        removeRegion( endRegion );
        addRegion( newRegion );
      }
      else {
        const newRegion = new GeneralSimpleRegion( simpleRegionGlobalId++, [ edge.forwardHalf ] );

        addRegion( newRegion );
      }

      return true;
    };

    // Try weird edges first
    for ( const weirdEdge of weirdEdges ) {
      const success = attemptToAddEdge( weirdEdge );

      if ( success ) {
        removedWeirdEdges.add( weirdEdge );
        weirdEdges.delete( weirdEdge );
      }
    }

    for ( const edge of nowBlackEdges ) {
      const success = attemptToAddEdge( edge );

      if ( !success ) {
        addedWeirdEdges.add( edge );
        weirdEdges.add( edge ); // TODO: why, we're not saving it...?
      }
    }

    // NOTE: only do this at the end, since if we "error out" we'll want to note we still need to be computed
    this.dirtyEdges.clear();

    return new GeneralSimpleRegionAction( this.board, addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public clone( equivalentState: TState<TEdgeData & TSimpleRegionData> ): SafeEdgeToSimpleRegionSolver {
    return new SafeEdgeToSimpleRegionSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}