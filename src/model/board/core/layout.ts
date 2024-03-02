import { Circle, Color, Line, Node, Path, TColor, Text } from 'phet-lib/scenery';
// @ts-expect-error
import cytoscape from '../../../lib/cytoscape/cytoscape.js';
// @ts-expect-error
import fcose from '../../../lib/cytoscape/cytoscape-fcose/src/index.js';
// @ts-expect-error
import coseBilkent from '../../../lib/cytoscape/cytoscape-cose-bilkent/index.js';
import { scene } from '../../../view/scene.ts';
import { Vector2 } from 'phet-lib/dot';
import { arrayRemove, merge } from 'phet-lib/phet-core';
import { TState } from '../../data/core/TState.ts';
import { TFaceData } from '../../data/face/TFaceData.ts';
import { TEdgeData } from '../../data/edge/TEdgeData.ts';
import { TVertex } from './TVertex.ts';
import { TEdge } from './TEdge.ts';
import EdgeState from '../../data/edge/EdgeState.ts';
import { TSimpleRegionData } from '../../data/simple-region/TSimpleRegionData.ts';
import { LocalStorageBooleanProperty } from '../../../util/localStorage.ts';
import { TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../../puzzle/PuzzleModel.ts';
import { TBoard } from './TBoard.ts';
import { BaseHalfEdge } from './BaseHalfEdge.ts';
import { BaseEdge } from './BaseEdge.ts';
import { BaseFace } from './BaseFace.ts';
import { BaseVertex } from './BaseVertex.ts';
import { THalfEdge } from './THalfEdge.ts';
import { TFace } from './TFace.ts';
import { BaseBoard } from './BaseBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import FaceState from '../../data/face/FaceState.ts';
import { validateBoard } from './validateBoard.ts';
import { getCentroid } from './createBoardDescriptor.ts';
// @ts-expect-error
import { formatHex, toGamut } from 'culori';
import { Shape } from 'phet-lib/kite';
import _ from '../../../workarounds/_.ts';
import { blackLineColorProperty, faceValueColorProperty } from '../../../view/Theme.ts';

// TODO: factor this color stuff out
const toRGB = toGamut( 'rgb' );

cytoscape.use( fcose );
cytoscape.use( coseBilkent );

export const showLayoutTestProperty = new LocalStorageBooleanProperty( 'showLayoutTestProperty', false );

export type LayoutStructure = {
  HalfEdge: LayoutHalfEdge;
  Edge: LayoutEdge;
  Face: LayoutFace;
  Vertex: LayoutVertex;
};

export class LayoutHalfEdge extends BaseHalfEdge<LayoutStructure> {
  public constructor(
    layoutStart: LayoutVertex,
    layoutEnd: LayoutVertex,
    isReversed: boolean
  ) {
    super( layoutStart, layoutEnd, isReversed );
  }
}

export class LayoutEdge extends BaseEdge<LayoutStructure> {

  public originalEdges: Set<TEdge> = new Set();

  public constructor(
    layoutStart: LayoutVertex,
    layoutEnd: LayoutVertex
  ) {
    super( layoutStart, layoutEnd );
  }
}

export class LayoutFace extends BaseFace<LayoutStructure> {

  public originalFace: TFace | null = null;

  public constructor(
    logicalCoordinates: Vector2,
    viewCoordinates: Vector2
  ) {
    super( logicalCoordinates.copy(), viewCoordinates.copy() );
  }
}

export class LayoutVertex extends BaseVertex<LayoutStructure> {
  public constructor(
    logicalCoordinates: Vector2,
    viewCoordinates: Vector2
  ) {
    super( logicalCoordinates.copy(), viewCoordinates.copy() );
  }
}

export class LayoutInternalZone {
  public constructor(
    public readonly faces: LayoutFace[],
    public readonly boundaryHalfEdges: LayoutHalfEdge[]
  ) {}
}

export class LayoutExternalZone {
  public constructor(
    public readonly faces: LayoutFace[],
    public readonly boundaryHalfEdges: LayoutHalfEdge[],
    public readonly boundarySegments: LayoutHalfEdge[][]
  ) {}
}

export class LayoutPuzzle extends BaseBoard<LayoutStructure> {

  public edgeStateMap: Map<LayoutEdge, EdgeState> = new Map();
  public faceValueMap: Map<LayoutFace, FaceState> = new Map();

  public constructor(
    public readonly originalBoard: TBoard,
    public readonly originalState: TState<TFaceData & TEdgeData>
  ) {
    const vertexMap = new Map<TVertex, LayoutVertex>();
    const faceMap = new Map<TFace, LayoutFace>();
    const edgeMap = new Map<TEdge, LayoutEdge>();
    const halfEdgeMap = new Map<THalfEdge, LayoutHalfEdge>();

    const vertexReverseMap = new Map<LayoutVertex, TVertex>();
    const faceReverseMap = new Map<LayoutFace, TFace>();
    const edgeReverseMap = new Map<LayoutEdge, TEdge>();
    const halfEdgeReverseMap = new Map<LayoutHalfEdge, THalfEdge>();

    const getLayoutVertex = ( vertex: TVertex ) => {
      const layoutVertex = vertexMap.get( vertex );
      assertEnabled() && assert( layoutVertex );
      return layoutVertex!;
    };
    const getLayoutFace = ( face: TFace ) => {
      const layoutFace = faceMap.get( face );
      assertEnabled() && assert( layoutFace );
      return layoutFace!;
    };
    const getLayoutEdge = ( edge: TEdge ) => {
      const layoutEdge = edgeMap.get( edge );
      assertEnabled() && assert( layoutEdge );
      return layoutEdge!;
    };
    const getLayoutHalfEdge = ( halfEdge: THalfEdge ) => {
      const layoutHalfEdge = halfEdgeMap.get( halfEdge );
      assertEnabled() && assert( layoutHalfEdge );
      return layoutHalfEdge!;
    };

    const getOriginalVertex = ( layoutVertex: LayoutVertex ) => {
      const vertex = vertexReverseMap.get( layoutVertex );
      assertEnabled() && assert( vertex );
      return vertex!;
    };
    const getOriginalFace = ( layoutFace: LayoutFace ) => {
      const face = faceReverseMap.get( layoutFace );
      assertEnabled() && assert( face );
      return face!;
    };
    const getOriginalEdge = ( layoutEdge: LayoutEdge ) => {
      const edge = edgeReverseMap.get( layoutEdge );
      assertEnabled() && assert( edge );
      return edge!;
    };
    const getOriginalHalfEdge = ( layoutHalfEdge: LayoutHalfEdge ) => {
      const halfEdge = halfEdgeReverseMap.get( layoutHalfEdge );
      assertEnabled() && assert( halfEdge );
      return halfEdge!;
    };

    const vertices = originalBoard.vertices.map( vertex => {
      const layoutVertex = new LayoutVertex( vertex.logicalCoordinates, vertex.viewCoordinates );
      vertexMap.set( vertex, layoutVertex );
      vertexReverseMap.set( layoutVertex, vertex );
      return layoutVertex;
    } );
    const faces = originalBoard.faces.map( face => {
      const layoutFace = new LayoutFace( face.logicalCoordinates, face.viewCoordinates );
      faceMap.set( face, layoutFace );
      faceReverseMap.set( layoutFace, face );
      layoutFace.originalFace = face;
      return layoutFace;
    } );
    const halfEdges: LayoutHalfEdge[] = [];
    const edges = originalBoard.edges.map( edge => {
      const start = vertexMap.get( edge.start )!;
      const end = vertexMap.get( edge.end )!;
      assertEnabled() && assert( start );
      assertEnabled() && assert( end );

      const layoutEdge = new LayoutEdge( start, end );
      layoutEdge.originalEdges.add( edge );
      edgeMap.set( edge, layoutEdge );
      edgeReverseMap.set( layoutEdge, edge );

      const forwardHalf = new LayoutHalfEdge( start, end, false );
      halfEdgeMap.set( edge.forwardHalf, forwardHalf );
      halfEdgeReverseMap.set( forwardHalf, edge.forwardHalf );
      halfEdges.push( forwardHalf );

      const reversedHalf = new LayoutHalfEdge( end, start, true );
      halfEdgeMap.set( edge.reversedHalf, reversedHalf );
      halfEdgeReverseMap.set( reversedHalf, edge.reversedHalf );
      halfEdges.push( reversedHalf );

      return layoutEdge;
    } );

    vertices.forEach( layoutVertex => {
      const vertex = getOriginalVertex( layoutVertex );
      layoutVertex.incomingHalfEdges = vertex.incomingHalfEdges.map( getLayoutHalfEdge );
      layoutVertex.outgoingHalfEdges = vertex.outgoingHalfEdges.map( getLayoutHalfEdge );
      layoutVertex.edges = vertex.edges.map( getLayoutEdge );
      layoutVertex.faces = vertex.faces.map( getLayoutFace );
    } );

    faces.forEach( layoutFace => {
      const face = getOriginalFace( layoutFace );
      layoutFace.halfEdges = face.halfEdges.map( getLayoutHalfEdge );
      layoutFace.edges = face.edges.map( getLayoutEdge );
      layoutFace.vertices = face.vertices.map( getLayoutVertex );
    } );

    edges.forEach( layoutEdge => {
      const edge = getOriginalEdge( layoutEdge );
      layoutEdge.forwardHalf = getLayoutHalfEdge( edge.forwardHalf );
      layoutEdge.reversedHalf = getLayoutHalfEdge( edge.reversedHalf );
      layoutEdge.forwardFace = edge.forwardFace ? getLayoutFace( edge.forwardFace ) : null;
      layoutEdge.reversedFace = edge.reversedFace ? getLayoutFace( edge.reversedFace ) : null;
      layoutEdge.vertices = edge.vertices.map( getLayoutVertex );
      layoutEdge.faces = edge.faces.map( getLayoutFace );
    } );

    halfEdges.forEach( layoutHalfEdge => {
      const halfEdge = getOriginalHalfEdge( layoutHalfEdge );
      layoutHalfEdge.edge = getLayoutEdge( halfEdge.edge );
      layoutHalfEdge.reversed = getLayoutHalfEdge( halfEdge.reversed );
      layoutHalfEdge.next = getLayoutHalfEdge( halfEdge.next );
      layoutHalfEdge.previous = getLayoutHalfEdge( halfEdge.previous );
      layoutHalfEdge.face = halfEdge.face ? getLayoutFace( halfEdge.face ) : null;
    } );

    super( {
      edges: edges,
      vertices: vertices,
      faces: faces,
      halfEdges: halfEdges,

      // TODO: how to handle? We can just recompute after everything?
      outerBoundary: originalBoard.outerBoundary.map( getLayoutHalfEdge ),
      innerBoundaries: originalBoard.innerBoundaries.map( innerBoundary => innerBoundary.map( getLayoutHalfEdge ) )
    } );

    edges.forEach( layoutEdge => {
      this.edgeStateMap.set( layoutEdge, originalState.getEdgeState( getOriginalEdge( layoutEdge ) ) );
    } );

    faces.forEach( layoutFace => {
      this.faceValueMap.set( layoutFace, originalState.getFaceState( getOriginalFace( layoutFace ) ) );
    } );

    assertEnabled() && validateBoard( this );
  }

  private getFaceValue( face: LayoutFace ): FaceState {
    const state = this.faceValueMap.get( face );
    assertEnabled() && assert( state !== undefined );
    return state!;
  }

  private getEdgeState( edge: LayoutEdge ): EdgeState {
    const state = this.edgeStateMap.get( edge );
    assertEnabled() && assert( state !== undefined );
    return state!;
  }

  private clearSatisfiedFaces(): void {
    this.faces.forEach( face => {

      const faceValue = this.getFaceValue( face );
      if ( faceValue === null ) {
        return;
      }

      let whiteCount = 0;
      let blackCount = 0;

      face.edges.forEach( edge => {
        const edgeState = this.getEdgeState( edge );
        if ( edgeState === EdgeState.WHITE ) {
          whiteCount++;
        }
        else if ( edgeState === EdgeState.BLACK ) {
          blackCount++;
        }
      } );

      if ( whiteCount === 0 && blackCount === faceValue ) {
        this.faceValueMap.set( face, null );
      }
    } );
  }

  private removeDeadRedEdges(): void {
    const deadEdges = new Set( this.edges.filter( edge => {
      return this.getEdgeState( edge ) === EdgeState.RED && edge.faces.every( face => {
        return face === null || this.getFaceValue( face ) === null;
      } );
    } ) );
    const deadVertices = new Set( this.vertices.filter( vertex => {
      return vertex.edges.every( edge => deadEdges.has( edge ) );
    } ) );
    const deadFaces = new Set( this.faces.filter( face => {
      return face.edges.some( edge => deadEdges.has( edge ) );
    } ) );

    const deadZones: ( LayoutInternalZone | LayoutExternalZone )[] = [];

    // Handle adjacently-grouped faces in groups
    const deadFacesRemaining = new Set( deadFaces );
    while ( deadFacesRemaining.size ) {
      const initialFace: LayoutFace = deadFacesRemaining.values().next().value;
      deadFacesRemaining.delete( initialFace );

      const faces = [ initialFace ];
      let isExterior = false;
      for ( let i = 0; i < faces.length; i++ ) {
        const face = faces[ i ];
        face.edges.forEach( edge => {
          if ( deadEdges.has( edge ) ) {
            [ edge.forwardFace, edge.reversedFace ].forEach( adjacentFace => {
              if ( adjacentFace === face ) {
                return;
              }
              if ( adjacentFace === null ) {
                isExterior = true;
                return;
              }
              if ( deadFacesRemaining.has( adjacentFace ) ) {
                deadFacesRemaining.delete( adjacentFace );
                faces.push( adjacentFace );
              }
            } );
          }
        } );
      }

      const allHalfEdges = new Set( faces.flatMap( face => face.halfEdges ) );
      const allReversedHalfEdges = new Set( faces.flatMap( face => face.halfEdges.map( halfEdge => halfEdge.reversed ) ) );
      const boundaryHalfEdgesSet = new Set( [ ...allHalfEdges ].filter( halfEdge => !allReversedHalfEdges.has( halfEdge ) ) );

      const getNextHalfEdge = ( halfEdge: LayoutHalfEdge ) => {
        let nextHalfEdge = halfEdge.next;
        while ( nextHalfEdge !== halfEdge && !boundaryHalfEdgesSet.has( nextHalfEdge ) ) {
          nextHalfEdge = nextHalfEdge.reversed.next;
        }
        assertEnabled() && assert( nextHalfEdge !== halfEdge );
        return nextHalfEdge;
      };

      const initialHalfEdge: LayoutHalfEdge = boundaryHalfEdgesSet.values().next().value;
      const boundaryHalfEdges: LayoutHalfEdge[] = [ initialHalfEdge ];
      let currentHalfEdge = getNextHalfEdge( initialHalfEdge );
      while ( currentHalfEdge !== initialHalfEdge ) {
        boundaryHalfEdges.push( currentHalfEdge );
        currentHalfEdge = getNextHalfEdge( currentHalfEdge );
      }
      assertEnabled() && assert( boundaryHalfEdges.length === boundaryHalfEdgesSet.size );

      // TODO: do we actually FIX up the boundaries? maybe recompute them later

      console.log( 'group', `faces: ${faces.length}`, isExterior ? 'exterior' : 'interior', `boundary length: ${boundaryHalfEdges.length}` );

      if ( isExterior ) {
        // Find half edges that "start" the boundary (previous edge is removed)
        const boundarySegments: LayoutHalfEdge[][] = [];
        for ( let i = 0; i < boundaryHalfEdges.length; i++ ) {
          const halfEdge = boundaryHalfEdges[ i ];
          const previousHalfEdge = boundaryHalfEdges[ ( i + boundaryHalfEdges.length - 1 ) % boundaryHalfEdges.length ];

          assertEnabled() && assert( previousHalfEdge.end === halfEdge.start );

          if ( !deadEdges.has( halfEdge.edge ) && deadEdges.has( previousHalfEdge.edge ) ) {

            const boundarySegment = [ halfEdge ];
            for ( let j = i + 1;; j++ ) {
              const nextHalfEdge = boundaryHalfEdges[ j % boundaryHalfEdges.length ];

              if ( deadEdges.has( nextHalfEdge.edge ) ) {
                break;
              }
              else {
                boundarySegment.push( nextHalfEdge );
              }
            }
            boundarySegments.push( boundarySegment );

            console.log( 'segment', boundarySegment.length );
          }
        }
        deadZones.push( new LayoutExternalZone( faces, boundaryHalfEdges, boundarySegments ) );
      }
      else {
        deadZones.push( new LayoutInternalZone( faces, boundaryHalfEdges ) );
      }
    }

    deadZones.forEach( zone => {
      if ( zone instanceof LayoutInternalZone ) {
        const vertices = zone.boundaryHalfEdges.map( halfEdge => halfEdge.start );
        const edges = zone.boundaryHalfEdges.map( halfEdge => halfEdge.edge );

        // TODO: can we do a better job with logical coordinates here? incremental?
        const newFace = new LayoutFace( getCentroid( vertices.map( vertex => vertex.viewCoordinates ) ), getCentroid( vertices.map( vertex => vertex.logicalCoordinates ) ) );
        this.faces.push( newFace );
        this.faceValueMap.set( newFace, null );

        newFace.halfEdges = zone.boundaryHalfEdges;
        newFace.edges = edges;
        newFace.vertices = vertices;

        // Rewrite the boundary half-edges
        for ( let i = 0; i < zone.boundaryHalfEdges.length; i++ ) {
          const halfEdge = zone.boundaryHalfEdges[ i ];
          const oldFace = halfEdge.face;

          halfEdge.face = newFace;

          const edge = halfEdge.edge;
          if ( halfEdge.isReversed ) {
            edge.reversedFace = newFace;
          }
          else {
            edge.forwardFace = newFace;
          }

          assertEnabled() && assert( oldFace );
          if ( oldFace ) {
            arrayRemove( edge.faces, oldFace );
          }
          edge.faces.push( newFace );
        }
      }
      else {
        zone.boundarySegments.forEach( boundarySegment => {
          boundarySegment.forEach( halfEdge => {
            const edge = halfEdge.edge;
            const oldFace = halfEdge.face;
            if ( oldFace ) {
              halfEdge.face = null;
              arrayRemove( edge.faces, oldFace );
            }
            if ( halfEdge.isReversed ) {
              edge.reversedFace = null;
            }
            else {
              edge.forwardFace = null;
            }
          } );
        } );
      }
    } );

    deadEdges.forEach( deadEdge => {
      // TODO: have a better way of doing this?
      arrayRemove( this.edges, deadEdge );
      arrayRemove( this.halfEdges, deadEdge.forwardHalf );
      arrayRemove( this.halfEdges, deadEdge.reversedHalf );
    } );

    deadVertices.forEach( deadVertex => {
      arrayRemove( this.vertices, deadVertex );
    } );

    deadFaces.forEach( deadFace => {
      arrayRemove( this.faces, deadFace );
    } );

    this.vertices.forEach( vertex => {
      vertex.edges = vertex.edges.filter( edge => !deadEdges.has( edge ) );
      vertex.incomingHalfEdges = vertex.incomingHalfEdges.filter( halfEdge => !deadEdges.has( halfEdge.edge ) );
      vertex.outgoingHalfEdges = vertex.outgoingHalfEdges.filter( halfEdge => !deadEdges.has( halfEdge.edge ) );
      vertex.faces = vertex.incomingHalfEdges.map( halfEdge => halfEdge.face ).filter( face => face !== null ) as LayoutFace[];

      // fix up next/previous (easier to wait for here)
      for ( let i = 0; i < vertex.incomingHalfEdges.length; i++ ) {
        // const firstIncomingHalfEdge = vertex.incomingHalfEdges[ i ];
        const firstOutgoingHalfEdge = vertex.outgoingHalfEdges[ i ];

        const secondIncomingHalfEdge = vertex.incomingHalfEdges[ ( i + 1 ) % vertex.incomingHalfEdges.length ];
        // const secondOutgoingHalfEdge = vertex.outgoingHalfEdges[ ( i + 1 ) % vertex.incomingHalfEdges.length ];

        secondIncomingHalfEdge.next = firstOutgoingHalfEdge;
        firstOutgoingHalfEdge.previous = secondIncomingHalfEdge;
      }
    } );

    assertEnabled() && validateBoard( this );

    // TODO: validate, but give it an option to ignore the boundary bits
    // TODO: validate existence in our arrays too
  }

  public removeSimpleForced(): void {
    // changing during iteration
    this.vertices.slice().forEach( vertex => {
      // Only 2 edges
      if ( vertex.edges.length !== 2 ) {
        return;
      }

      // Only null-ish faces
      const faces = _.uniq( vertex.edges.flatMap( edge => edge.faces ) );
      if ( faces.some( face => this.getFaceValue( face ) !== null ) ) {
        return;
      }

      const firstEdge = vertex.edges[ 0 ];
      const secondEdge = vertex.edges[ 1 ];

      const edgeStateA = this.getEdgeState( firstEdge );
      const edgeStateB = this.getEdgeState( secondEdge );

      // Same edge state
      if ( edgeStateA !== edgeStateB ) {
        return;
      }

      const startVertex = firstEdge.getOtherVertex( vertex );
      const endVertex = secondEdge.getOtherVertex( vertex );

      // Different vertices (not a triangle)
      if ( startVertex === endVertex ) {
        return;
      }

      // "forward" and "reversed" in our new ordering (from startVertex to vertex to endVertex)
      const firstForwardHalf = firstEdge.forwardHalf.end === vertex ? firstEdge.forwardHalf : firstEdge.reversedHalf;
      const firstReversedHalf = firstEdge.forwardHalf.end === vertex ? firstEdge.reversedHalf : firstEdge.forwardHalf;
      const secondForwardHalf = secondEdge.forwardHalf.start === vertex ? secondEdge.forwardHalf : secondEdge.reversedHalf;
      const secondReversedHalf = secondEdge.forwardHalf.start === vertex ? secondEdge.reversedHalf : secondEdge.forwardHalf;

      const forwardFace = firstForwardHalf.face;
      const reversedFace = firstReversedHalf.face;

      // TODO: preserve originalEdges(!)

      const newEdge = new LayoutEdge( startVertex, endVertex );
      this.edgeStateMap.set( newEdge, edgeStateA );
      this.edges.push( newEdge );

      const newForwardHalfEdge = new LayoutHalfEdge( startVertex, endVertex, false );
      this.halfEdges.push( newForwardHalfEdge );

      const newReversedHalfEdge = new LayoutHalfEdge( endVertex, startVertex, true );
      this.halfEdges.push( newReversedHalfEdge );

      // TODO: factor out the code to replace this two-edge vertex with a single edge (we'll use it elsewhere)
      // TODO: e.g. when we replace simple cases with faces(!)

      newEdge.forwardHalf = newForwardHalfEdge;
      newEdge.reversedHalf = newReversedHalfEdge;
      newEdge.forwardFace = forwardFace;
      newEdge.reversedFace = reversedFace;
      newEdge.vertices = [ startVertex, endVertex ];
      newEdge.faces = [ forwardFace, reversedFace ].filter( face => face !== null ) as LayoutFace[];

      newForwardHalfEdge.edge = newEdge;
      newForwardHalfEdge.reversed = newReversedHalfEdge;
      newForwardHalfEdge.next = secondForwardHalf.next;
      newForwardHalfEdge.previous = firstForwardHalf.previous;
      newForwardHalfEdge.face = forwardFace;

      newReversedHalfEdge.edge = newEdge;
      newReversedHalfEdge.reversed = newForwardHalfEdge;
      newReversedHalfEdge.next = firstReversedHalf.next;
      newReversedHalfEdge.previous = secondReversedHalf.previous;
      newReversedHalfEdge.face = reversedFace;

      if ( forwardFace ) {
        const halfIndex = forwardFace.halfEdges.indexOf( firstForwardHalf );
        const index = forwardFace.edges.indexOf( firstEdge );

        assertEnabled() && assert( halfIndex !== -1 );
        assertEnabled() && assert( index !== -1 );

        forwardFace.halfEdges[ halfIndex ] = newForwardHalfEdge;
        arrayRemove( forwardFace.halfEdges, secondForwardHalf );

        forwardFace.edges[ index ] = newEdge;
        arrayRemove( forwardFace.edges, secondEdge );

        arrayRemove( forwardFace.vertices, vertex );
      }

      if ( reversedFace ) {
        const halfIndex = reversedFace.halfEdges.indexOf( secondReversedHalf );
        const index = reversedFace.edges.indexOf( secondEdge );

        assertEnabled() && assert( halfIndex !== -1 );
        assertEnabled() && assert( index !== -1 );

        reversedFace.halfEdges[ halfIndex ] = newReversedHalfEdge;
        arrayRemove( reversedFace.halfEdges, firstReversedHalf );

        reversedFace.edges[ index ] = newEdge;
        arrayRemove( reversedFace.edges, firstEdge );

        arrayRemove( reversedFace.vertices, vertex );
      }

      // startVertex
      {
        const incomingIndex = startVertex.incomingHalfEdges.indexOf( firstReversedHalf );
        const outgoingIndex = startVertex.outgoingHalfEdges.indexOf( firstForwardHalf );
        const edgeIndex = startVertex.edges.indexOf( firstEdge );

        assertEnabled() && assert( incomingIndex !== -1 );
        assertEnabled() && assert( outgoingIndex !== -1 );
        assertEnabled() && assert( edgeIndex !== -1 );

        startVertex.incomingHalfEdges[ incomingIndex ] = newReversedHalfEdge;
        startVertex.outgoingHalfEdges[ outgoingIndex ] = newForwardHalfEdge;
        startVertex.edges[ edgeIndex ] = newEdge;
      }

      // endVertex
      {
        const incomingIndex = endVertex.incomingHalfEdges.indexOf( secondForwardHalf );
        const outgoingIndex = endVertex.outgoingHalfEdges.indexOf( secondReversedHalf );
        const edgeIndex = endVertex.edges.indexOf( secondEdge );

        assertEnabled() && assert( incomingIndex !== -1 );
        assertEnabled() && assert( outgoingIndex !== -1 );
        assertEnabled() && assert( edgeIndex !== -1 );

        endVertex.incomingHalfEdges[ incomingIndex ] = newForwardHalfEdge;
        endVertex.outgoingHalfEdges[ outgoingIndex ] = newReversedHalfEdge;
        endVertex.edges[ edgeIndex ] = newEdge;
      }

      newForwardHalfEdge.previous.next = newForwardHalfEdge;
      newForwardHalfEdge.next.previous = newForwardHalfEdge;
      newReversedHalfEdge.previous.next = newReversedHalfEdge;
      newReversedHalfEdge.next.previous = newReversedHalfEdge;

      arrayRemove( this.edges, firstEdge );
      arrayRemove( this.edges, secondEdge );
      arrayRemove( this.halfEdges, firstEdge.forwardHalf );
      arrayRemove( this.halfEdges, firstEdge.reversedHalf );
      arrayRemove( this.halfEdges, secondEdge.forwardHalf );
      arrayRemove( this.halfEdges, secondEdge.reversedHalf );
      arrayRemove( this.vertices, vertex );
    } );

    assertEnabled() && validateBoard( this );
  }

  public simplify(): void {
    // TODO: show how things progress(!)
    console.log( 'simplify' );
    this.clearSatisfiedFaces();
    this.removeDeadRedEdges();
    this.removeSimpleForced();
  }

  // TODO: getCompleteState / getPuzzle / etc.

  public layout(): void {
    const vertexTagMap: Map<LayoutVertex, string> = new Map();
    const vertexReverseTagMap: Map<string, LayoutVertex> = new Map();

    this.vertices.forEach( ( vertex, index ) => {
      vertexTagMap.set( vertex, `v${index}` );
      vertexReverseTagMap.set( `v${index}`, vertex );
    } );

    const idealEdgeLengthMap = new Map<string, number>();
    const edgeElasticityMap = new Map<string, number>();

    const vertexScale = 50;
    const elasticityBase = 0.45;

    // NOTE: could use cy.add, e.g.
    // cy.add( { data: { id: 'edgeid', source: 'node1', target: 'node2' } }
    const elements = [
      ...this.vertices.map( vertex => ( { data: { id: vertexTagMap.get( vertex ) } } ) ),
      ...this.edges.map( edge => {
        const edgeId = `${vertexTagMap.get( edge.start )}-${vertexTagMap.get( edge.end )}`;
        idealEdgeLengthMap.set( edgeId, vertexScale );
        edgeElasticityMap.set( edgeId, elasticityBase );

        return {
          data: {
            id: edgeId,
            source: vertexTagMap.get( edge.vertices[ 0 ] ),
            target: vertexTagMap.get( edge.vertices[ 1 ] )
          }
        };
      } ),
      ...this.faces.flatMap( face => {
        const numEdges = face.edges.length;

        const circleCircumference = numEdges * vertexScale;
        const circleRadius = circleCircumference / ( 2 * Math.PI );

        const subElements: any[] = [];
        // For all non-adjacent vertices
        for ( let i = 0; i < numEdges; i++ ) {
          for ( let j = i + 2; j < numEdges; j++ ) {
            if ( i === 0 && j === numEdges - 1 ) {
              continue;
            }

            const start = face.edges[ i ].end;
            const end = face.edges[ j ].end;

            const edgeId = `${vertexTagMap.get( start )}-${vertexTagMap.get( end )}`;

            const radialA = Vector2.createPolar( circleRadius, i * 2 * Math.PI / numEdges );
            const radialB = Vector2.createPolar( circleRadius, j * 2 * Math.PI / numEdges );
            const circleDistance = radialA.distance( radialB );

            idealEdgeLengthMap.set( edgeId, circleDistance );
            edgeElasticityMap.set( edgeId, elasticityBase / numEdges );

            subElements.push( {
              data: {
                id: edgeId,
                source: vertexTagMap.get( start ),
                target: vertexTagMap.get( end )
              }
            } );
          }
        }

        // return []; // TODO: enable this again? experiment?
        return subElements;
      } )
    ];

    const cy = cytoscape( {
      headless: true,
      elements: elements
    } );

    // cy.add( element );

    this.vertices.forEach( vertex => {
      cy.getElementById( vertexTagMap.get( vertex ) ).position( { x: vertexScale * vertex.viewCoordinates.x, y: vertexScale * vertex.viewCoordinates.y } );
    } );

    // coseCytoLayout( cy, { randomize: false } );
    // coseBilkentCytoLayout( cy, { randomize: true } );
    fcoseCytoLayout( cy, {
      randomize: false,
      // nestingFactor: 5.5,
      // tile: true,

      nodeRepulsion: ( node: any ) => {
        const vertex = vertexReverseTagMap.get( node.id() )!;
        assertEnabled() && assert( vertex );
        return 4500;
      },
      idealEdgeLength: ( edge: any ) => {
        const idealEdgeLength = idealEdgeLengthMap.get( edge.id() );
        assertEnabled() && assert( idealEdgeLength !== undefined );
        return idealEdgeLength;
      },
      edgeElasticity: ( edge: any ) => {
        const edgeElasticity = edgeElasticityMap.get( edge.id() );
        assertEnabled() && assert( edgeElasticity !== undefined );
        return edgeElasticity;
      },
    } );

    this.vertices.forEach( vertex => {
      const position = cy.getElementById( vertexTagMap.get( vertex ) ).position();

      vertex.viewCoordinates.setXY( position.x / vertexScale, position.y / vertexScale );
    } );

    this.faces.forEach( face => {
      face.viewCoordinates.set( getCentroid( face.halfEdges.map( halfEdge => halfEdge.start.viewCoordinates ) ) );
    } );

    cy.destroy();
  }

  public getDebugNode(): Node {
    // TODO: if we are still a planar-embedding, use a PuzzleNode?
    const debugNode = new Node();

    const showBackgrounds = false;
    const showRedEdges = true;

    this.edges.forEach( edge => {
      const start = edge.start.viewCoordinates;
      const end = edge.end.viewCoordinates;

      let stroke: TColor;
      let lineWidth: number;
      const edgeState = this.edgeStateMap.get( edge );
      if ( edgeState === EdgeState.WHITE ) {
        stroke = blackLineColorProperty;
        lineWidth = 0.02;
      }
      else if ( edgeState === EdgeState.BLACK ) {
        stroke = blackLineColorProperty;
        lineWidth = 0.1;
      }
      else {
        stroke = showRedEdges ? 'red' : null;
        lineWidth = 0.02;
      }

      debugNode.addChild( new Line( start, end, {
        stroke: stroke,
        lineWidth: lineWidth
      } ) );
    } );

    if ( showBackgrounds ) {
      this.faces.forEach( face => {
        const backgroundColor = new Color( formatHex( toRGB( {
          mode: 'okhsl',
          h: Math.random() * 360,
          s: 0.7,
          l: 0.6
        } ) ) as unknown as string ).withAlpha( 0.5 );
        debugNode.addChild( new Path( Shape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) ), {
          fill: backgroundColor
        } ) );
      } );
    }

    this.vertices.forEach( vertex => {
      debugNode.addChild( new Circle( 0.1, {
        x: vertex.viewCoordinates.x,
        y: vertex.viewCoordinates.y,
        fill: blackLineColorProperty
      } ) );
    } );

    this.faces.forEach( face => {
      const faceValue = this.faceValueMap.get( face ) ?? null;

      if ( faceValue !== null ) {
        debugNode.addChild( new Text( faceValue, {
          maxWidth: 0.9,
          maxHeight: 0.9,
          center: face.viewCoordinates,
          fill: faceValueColorProperty
        } ) );
      }
    } );

    return debugNode;
  };
}

export const layoutTest = ( puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null> ) => {

  const layoutTestNode = new Node( {
    scale: 0.4
  } );
  scene.addChild( layoutTestNode );

  const showPuzzleLayout = ( board: TBoard, state: TState<TFaceData & TEdgeData & TSimpleRegionData> ) => {

    const layoutPuzzle = new LayoutPuzzle( board, state );

    layoutPuzzle.simplify();
    layoutPuzzle.layout();

    const debugNode = layoutPuzzle.getDebugNode();

    const size = 600;

    debugNode.scale( Math.min( size / debugNode.width, size / debugNode.height ) );

    debugNode.left = 20;
    debugNode.top = 130;

    layoutTestNode.children = [ debugNode ];
  };

  const puzzleStateListener = () => {
    layoutTestNode.children = [];

    if ( showLayoutTestProperty.value && puzzleModelProperty.value ) {
      showPuzzleLayout( puzzleModelProperty.value.puzzle.board, puzzleModelProperty.value.puzzle.stateProperty.value );
    }
  };
  puzzleModelProperty.lazyLink( puzzleStateListener );
  showLayoutTestProperty.lazyLink( puzzleStateListener );
  puzzleStateListener();

  puzzleModelProperty.link( ( newPuzzleModel, oldPuzzleModel ) => {
    if ( oldPuzzleModel ) {
      oldPuzzleModel.puzzle.stateProperty.unlink( puzzleStateListener );
    }
    if ( newPuzzleModel ) {
      newPuzzleModel.puzzle.stateProperty.link( puzzleStateListener );
    }
  } );
};

/*
  name: 'cose',

  // Called on `layoutready`
  ready: function(){},

  // Called on `layoutstop`
  stop: function(){},

  // Whether to animate while running the layout
  // true : Animate continuously as the layout is running
  // false : Just show the end result
  // 'end' : Animate with the end result, from the initial positions to the end positions
  animate: true,

  // Easing of the animation for animate:'end'
  animationEasing: undefined,

  // The duration of the animation for animate:'end'
  animationDuration: undefined,

  // A function that determines whether the node should be animated
  // All nodes animated by default on animate enabled
  // Non-animated nodes are positioned immediately when the layout starts
  animateFilter: function ( node, i ){ return true; },


  // The layout animates only after this many milliseconds for animate:true
  // (prevents flashing on fast runs)
  animationThreshold: 250,

  // Number of iterations between consecutive screen positions update
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Excludes the label when calculating node bounding boxes for the layout algorithm
  nodeDimensionsIncludeLabels: false,

  // Randomize the initial positions of the nodes (true) or use existing positions (false)
  randomize: false,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 40,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: function( node ){ return 2048; },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 4,

  // Ideal edge (non nested) length
  idealEdgeLength: function( edge ){ return 32; },

  // Divisor to compute edge forces
  edgeElasticity: function( edge ){ return 32; },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 1.2,

  // Gravity force (constant)
  gravity: 1,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 1000,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.99,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0
 */
export const coseCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'cose',
    animate: false,
    quality: 'proof', // highest, of 'draft', 'default' or 'proof'
  }, options ) );
  layout.run();
};

/*
  // Called on `layoutready`
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // 'draft', 'default' or 'proof"
  // - 'draft' fast cooling rate
  // - 'default' moderate cooling rate
  // - "proof" slow cooling rate
  quality: 'default',
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // Whether to tile disconnected nodes
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Duration for animate:end
  animationDuration: 500,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5
 */
export const coseBilkentCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'cose-bilkent',
    quality: 'proof',
    animate: false
  }, options ) );
  layout.run();
};

/*
  // 'draft', 'default' or 'proof'
  // - "draft" only applies spectral layout
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate)
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // Whether or not to animate the layout
  animate: true,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
  packComponents: true,
  // Layout step - all, transformed, enforced, cose - for debug purpose only
  step: "all",

  /* spectral layout options

  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 75,
  // Power iteration tolerance
  piTol: 0.0000001,

  /* incremental layout options

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: node => 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: edge => 50,
  // Divisor to compute edge forces
  edgeElasticity: edge => 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // The comparison function to be used while sorting nodes during tiling operation.
  // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
  // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
  // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
  // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
  // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
  tilingCompareBy: undefined,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.3,

  /* constraint options

  // Fix desired nodes to predefined positions
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: undefined,
  // Align desired nodes in vertical/horizontal direction
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,
  // Place two nodes relatively in vertical/horizontal direction
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,

  /* layout event callbacks
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
 */
export const fcoseCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'fcose',
    quality: 'proof', // highest, of 'draft', 'default' or 'proof'
    animate: false
  }, options ) );
  layout.run();
};
