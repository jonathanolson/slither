import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import _ from '../../workarounds/_.ts';
import { GeneralSimpleRegion } from '../data/simple-region/GeneralSimpleRegion.ts';
import { THalfEdge } from '../board/core/THalfEdge.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { TEdgeData, TEdgeDataListener } from '../data/edge/TEdgeData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../data/simple-region/TSimpleRegionData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { GeneralSimpleRegionAction } from '../data/simple-region/GeneralSimpleRegionAction.ts';
import { dotRandom } from 'phet-lib/dot';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';

// Oops, because on app restart, region IDs are persistent
const getSimpleRegionGlobalId = (): number => dotRandom.nextInt( Number.MAX_SAFE_INTEGER );

type Data = TFaceData & TEdgeData & TSimpleRegionData;

export class SafeEdgeToSimpleRegionSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyEdges = new Set<TEdge>();

  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>
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

  public nextAction(): TAnnotatedAction<Data> | null {
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

        // TODO: handle "solved" regions that are loops!

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

          // We might have the "start" and "end" regions of a solved loop still be attached, so we'll check for that
          if ( region.isSolved && halfEdgeRegions.length > 1 ) {
            const firstHalfEdge = halfEdgeRegions[ 0 ][ 0 ];
            const lastHalfEdge = halfEdgeRegions[ halfEdgeRegions.length - 1 ][ halfEdgeRegions[ halfEdgeRegions.length - 1 ].length - 1 ];
            if ( firstHalfEdge.start === lastHalfEdge.end ) {
              halfEdgeRegions[ 0 ].unshift( ...halfEdgeRegions.pop()! );
            }
          }

          const largestHalfEdgeRegion = _.maxBy( halfEdgeRegions, halfEdgeRegion => halfEdgeRegion.length )!;

          for ( const halfEdgeRegion of halfEdgeRegions ) {
            const newRegion = new GeneralSimpleRegion(
              halfEdgeRegion === largestHalfEdgeRegion ? region.id : getSimpleRegionGlobalId(),
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

      if ( startRegion && endRegion ) {
        if ( startRegion === endRegion ) {
          if ( SafeEdgeToSimpleRegionSolver.isSolvedWithAddedEdge( this.board, this.state, startRegion, edge ) ) {
            removeRegion( startRegion );
            addRegion( new GeneralSimpleRegion( startRegion.id, SafeEdgeToSimpleRegionSolver.combineHalfEdgeArrays(
              startRegion.halfEdges,
              [ edge.forwardHalf ]
            ), true ) ); // NOTE: solved!
          }
          else {
            return false;
          }
        }
        else {
          // We are joining two regions(!)

          const primaryRegion = startRegion.halfEdges.length >= endRegion.halfEdges.length ? startRegion : endRegion;
          const secondaryRegion = primaryRegion === startRegion ? endRegion : startRegion;

          const newRegion = new GeneralSimpleRegion( primaryRegion.id, SafeEdgeToSimpleRegionSolver.combineHalfEdgeArrays(
            primaryRegion.halfEdges,
            [ edge.forwardHalf ],
            secondaryRegion.halfEdges
          ) );

          removeRegion( primaryRegion );
          removeRegion( secondaryRegion );
          addRegion( newRegion );
        }
      }
      else if ( startRegion ) {
        const newRegion = new GeneralSimpleRegion( startRegion.id, SafeEdgeToSimpleRegionSolver.combineHalfEdgeArrays(
          startRegion.halfEdges,
          [ edge.forwardHalf ]
        ) );

        removeRegion( startRegion );
        addRegion( newRegion );
      }
      else if ( endRegion ) {
        const newRegion = new GeneralSimpleRegion( endRegion.id, SafeEdgeToSimpleRegionSolver.combineHalfEdgeArrays(
          endRegion.halfEdges,
          [ edge.forwardHalf ]
        ) );

        removeRegion( endRegion );
        addRegion( newRegion );
      }
      else {
        const newRegion = new GeneralSimpleRegion( getSimpleRegionGlobalId(), [ edge.forwardHalf ] );

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

    return new AnnotatedAction( new GeneralSimpleRegionAction( this.board, addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges ), {
      type: 'SimpleRegions'
    } );
  }

  public clone( equivalentState: TState<Data> ): SafeEdgeToSimpleRegionSolver {
    return new SafeEdgeToSimpleRegionSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }

  public static isSolvedWithAddedEdge( board: TBoard, data: TFaceData & TEdgeData, simpleRegion: TSimpleRegion, edge: TEdge ): boolean {
    // Sanity checks
    if ( edge.start !== simpleRegion.a && edge.start !== simpleRegion.b ) {
      return false;
    }
    if ( edge.end !== simpleRegion.a && edge.end !== simpleRegion.b ) {
      return false;
    }

    const edgeSet = new Set( simpleRegion.edges );
    edgeSet.add( edge );

    // NOTE: we can probably get a more efficient check in the future, but this is robust to cases where the user
    // creates additional loops or bogus things. This only depends on THIS region.
    for ( const face of board.faces ) {
      const faceValue = data.getFaceState( face );
      if ( faceValue !== null ) {
        const count = face.edges.filter( faceEdge => edgeSet.has( faceEdge ) ).length;
        if ( count !== faceValue ) {
          return false;
        }
      }
    }

    return true;
  }

  public static combineHalfEdgeArrays( ...arrays: THalfEdge[][] ): THalfEdge[] {
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
  }
}
