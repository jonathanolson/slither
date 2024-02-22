import { Vector2 } from 'phet-lib/dot';
import { BaseVertex } from './BaseVertex.ts';
import { TStructure } from './TStructure.ts';
import { BaseFace } from './BaseFace.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { BaseEdge } from './BaseEdge.ts';
import { BaseHalfEdge } from './BaseHalfEdge.ts';

export type VertexLocation = Vector2;
export type FaceLocation = Vector2;
export type ViewLocation = Vector2;

export interface TVertexDescriptor {
  logicalCoordinates: VertexLocation;
  viewCoordinates: ViewLocation;
}

export interface TFaceDescriptor {
  logicalCoordinates: FaceLocation;
  vertices: TVertexDescriptor[];
}

export type TBoardDescriptor<Structure extends TStructure = TStructure> = {
  edges: Structure[ 'Edge' ][];
  vertices: Structure[ 'Vertex' ][];
  faces: Structure[ 'Face' ][];
  halfEdges: Structure[ 'HalfEdge' ][];
  outerBoundary: Structure[ 'HalfEdge' ][];
  innerBoundaries: Structure[ 'HalfEdge' ][][];
};

// TODO: dedup and use from Alpenglow PolygonalFace
export const getSignedArea = ( points: Vector2[] ) => {
  let area = 0;

  for ( let j = 0; j < points.length; j++ ) {
    const p0 = points[ j ];
    const p1 = points[ ( j + 1 ) % points.length ];

    // Shoelace formula for the area
    area += ( p1.x + p0.x ) * ( p1.y - p0.y );
  }

  return 0.5 * area;
};

// TODO: dedup and use from Alpenglow PolygonalFace
export const getCentroid = ( points: Vector2[] ) => {
  const area = getSignedArea( points );

  let x = 0;
  let y = 0;

  for ( let j = 0; j < points.length; j++ ) {
    const p0 = points[ j ];
    const p1 = points[ ( j + 1 ) % points.length ];

    // Partial centroid evaluation. NOTE: using the compound version here, for performance/stability tradeoffs
    const base = ( p0.x * ( 2 * p0.y + p1.y ) + p1.x * ( p0.y + 2 * p1.y ) );
    x += ( p0.x - p1.x ) * base;
    y += ( p1.y - p0.y ) * base;
  }

  return new Vector2( x, y ).timesScalar( 1 / ( 6 * area ) );
};

class EdgeIdentifier {
  public constructor(
    public readonly start: VertexLocation,
    public readonly end: VertexLocation
  ) {}

  public isCanonicalHalfEdge(): boolean {
    return this.start.x < this.end.x || ( this.start.x === this.end.x && this.start.y < this.end.y );
  }
}

class EdgeIdentifierLookup {

  public readonly identifiers: EdgeIdentifier[] = [];
  public readonly canonicalIdentifiers: EdgeIdentifier[] = [];
  private readonly map: Map<VertexLocation, Map<VertexLocation, EdgeIdentifier>> = new Map();

  public add( a: VertexLocation, b: VertexLocation ): void {
    assertEnabled() && assert( a.x !== b.x || a.y !== b.y );

    // Don't add duplicates
    if ( this.lookupAttempt( a, b ) !== null ) {
      return;
    }

    const add = ( a: VertexLocation, b: VertexLocation ) => {
      let map: Map<VertexLocation, EdgeIdentifier>;
      if ( this.map.has( a ) ) {
        map = this.map.get( a )!;
      }
      else {
        map = new Map();
        this.map.set( a, map );
      }
      const identifier = new EdgeIdentifier( a, b );
      map.set( b, identifier );

      this.identifiers.push( identifier );
      if ( identifier.isCanonicalHalfEdge() ) {
        this.canonicalIdentifiers.push( identifier );
      }
    };

    add( a, b );
    add( b, a );
  }

  public getAdjacentLocations( location: VertexLocation ): VertexLocation[] {
    const map = this.map.get( location );
    return map ? Array.from( map.keys() ) : [];
  }

  public lookupAttempt( a: VertexLocation, b: VertexLocation ): EdgeIdentifier | null {
    const map = this.map.get( a );
    return map ? ( map.get( b ) ?? null ) : null;
  }

  public lookup( a: VertexLocation, b: VertexLocation ): EdgeIdentifier {
    const value = this.lookupAttempt( a, b );
    assertEnabled() && assert( value );
    return value!;
  }

  public lookupCanonical( a: VertexLocation, b: VertexLocation ): EdgeIdentifier {
    const value = this.lookup( a, b );
    return value.isCanonicalHalfEdge() ? value : this.lookup( b, a );
  }
}

type Vertex = BaseVertex<TStructure>;
type Face = BaseFace<TStructure>;
type Edge = BaseEdge<TStructure>;
type HalfEdge = BaseHalfEdge<TStructure>;

// NOTE: We do NOT support edges that are not part of a face (no bridges)
export const createBoardDescriptor = ( vertexDescriptors: TVertexDescriptor[], faceDescriptors: TFaceDescriptor[] ): TBoardDescriptor => {

  // FIX orientation of faces (so that they have positive signed area, and are in mathematical-CCW order).
  faceDescriptors = faceDescriptors.map( descriptor => getSignedArea( descriptor.vertices.map( v => v.viewCoordinates ) ) > 0 ? descriptor : {
    logicalCoordinates: descriptor.logicalCoordinates,
    vertices: descriptor.vertices.slice().reverse()
  } );

  // Create unique objects for edges
  const edgeIdentifierLookup = new EdgeIdentifierLookup();
  faceDescriptors.forEach( face => {
    for ( let i = 0; i < face.vertices.length; i++ ) {
      const a = face.vertices[ i ].logicalCoordinates;
      const b = face.vertices[ ( i + 1 ) % face.vertices.length ].logicalCoordinates;
      edgeIdentifierLookup.add( a, b );
    }
  } );

  const vertexMap = new Map<VertexLocation, Vertex>();
  const faceMap = new Map<FaceLocation, Face>();
  const edgeMap = new Map<EdgeIdentifier, Edge>();
  const halfEdgeMap = new Map<EdgeIdentifier, HalfEdge>();

  const getVertex = ( location: VertexLocation ): Vertex | null => {
    return vertexMap.get( location ) ?? null;
  };
  const getFace = ( location: FaceLocation ): Face | null => {
    return faceMap.get( location ) ?? null;
  };
  // const getEdge = ( a: VertexLocation, b: VertexLocation ): Edge | null => {
  //   const identifier = edgeIdentifierLookup.lookupCanonical( a, b );
  //   return edgeMap.get( identifier ) ?? null;
  // };
  const getHalfEdge = ( a: VertexLocation, b: VertexLocation ): HalfEdge | null => {
    const identifier = edgeIdentifierLookup.lookup( a, b );
    return halfEdgeMap.get( identifier ) ?? null;
  };

  // TODO: also create a board with information about the boundaries (1 outer, 0+ inner)

  // NOTE: We're going to use the objects from logicalCoordinates to map things

  const vertices = vertexDescriptors.map( descriptor => new BaseVertex<TStructure>(
    descriptor.logicalCoordinates,
    descriptor.viewCoordinates
  ) );
  vertices.forEach( vertex => vertexMap.set( vertex.logicalCoordinates, vertex ) );

  const faces = faceDescriptors.map( descriptor => new BaseFace<TStructure>(
    descriptor.logicalCoordinates,
    getCentroid( descriptor.vertices.map( v => v.viewCoordinates ) )
  ) );
  faces.forEach( face => faceMap.set( face.logicalCoordinates, face ) );

  const edges = edgeIdentifierLookup.canonicalIdentifiers.map( identifier => new BaseEdge<TStructure>(
    getVertex( identifier.start )!,
    getVertex( identifier.end )!
  ) );
  edges.forEach( edge => edgeMap.set( edgeIdentifierLookup.lookupCanonical( edge.start.logicalCoordinates, edge.end.logicalCoordinates ), edge ) );

  const halfEdges = edgeIdentifierLookup.identifiers.map( identifier => new BaseHalfEdge<TStructure>(
    getVertex( identifier.start )!,
    getVertex( identifier.end )!,
    !identifier.isCanonicalHalfEdge() // canonical is forward
  ) );
  halfEdges.forEach( halfEdge => halfEdgeMap.set( edgeIdentifierLookup.lookup( halfEdge.start.logicalCoordinates, halfEdge.end.logicalCoordinates ), halfEdge ) );

  // Hook up some edge-only relationships
  edges.forEach( edge => {
    const forwardHalf = getHalfEdge( edge.start.logicalCoordinates, edge.end.logicalCoordinates )!;
    const reversedHalf = getHalfEdge( edge.end.logicalCoordinates, edge.start.logicalCoordinates )!;

    assertEnabled() && assert( forwardHalf );
    assertEnabled() && assert( reversedHalf );

    forwardHalf.edge = edge;
    reversedHalf.edge = edge;

    forwardHalf.reversed = reversedHalf;
    reversedHalf.reversed = forwardHalf;

    edge.forwardHalf = forwardHalf;
    edge.reversedHalf = reversedHalf;

    edge.vertices = [ edge.start, edge.end ];
  } );

  // Mark face (and guaranteed next/previous) bits on half-edges
  faceDescriptors.forEach( faceDescriptor => {
    const face = getFace( faceDescriptor.logicalCoordinates )!;
    const facesVertices = faceDescriptor.vertices.map( vertexDescriptor => getVertex( vertexDescriptor.logicalCoordinates )! );

    const faceEdges: Edge[] = [];
    const faceHalfEdges: HalfEdge[] = [];

    for ( let i = 0; i < facesVertices.length; i++ ) {
      const startLocation = faceDescriptor.vertices[ i ].logicalCoordinates;
      const middleLocation = faceDescriptor.vertices[ ( i + 1 ) % facesVertices.length ].logicalCoordinates;
      const endLocation = faceDescriptor.vertices[ ( i + 2 ) % facesVertices.length ].logicalCoordinates;

      const firstHalf = getHalfEdge( startLocation, middleLocation )!;
      firstHalf.face = face;

      const secondHalf = getHalfEdge( middleLocation, endLocation )!;
      firstHalf.next = secondHalf;
      secondHalf.previous = firstHalf;

      faceHalfEdges.push( firstHalf );
      faceEdges.push( firstHalf.edge );
    }

    face.halfEdges = faceHalfEdges;
    face.edges = faceEdges;
    face.vertices = facesVertices;
  } );

  // handle undefined => null for faces in half edges
  halfEdges.forEach( halfEdge => {
    if ( halfEdge.face === undefined ) {
      halfEdge.face = null;
    }
  } );

  edges.forEach( edge => {
    edge.forwardFace = edge.forwardHalf.face;
    edge.reversedFace = edge.reversedHalf.face;
    edge.faces = [ edge.forwardFace, edge.reversedFace ].filter( face => face !== null ) as Face[];
  } );

  const boundaryHalfEdges = new Set( halfEdges.filter( halfEdge => halfEdge.face === null ) );
  const outerBoundaries: HalfEdge[][] = []; // TODO: make sure we only have one?
  const innerBoundaries: HalfEdge[][] = [];

  while ( boundaryHalfEdges.size ) {
    const firstHalfEdge = boundaryHalfEdges.values().next().value;
    boundaryHalfEdges.delete( firstHalfEdge );

    const getNext = ( halfEdge: HalfEdge ) => {
      assertEnabled() && assert( halfEdge.face === null );

      const nextStartLocation = halfEdge.end.logicalCoordinates;

      const adjacentLocations = edgeIdentifierLookup.getAdjacentLocations( nextStartLocation ).filter( location => location !== halfEdge.start.logicalCoordinates );
      const adjacentEdges = adjacentLocations.map( location => getHalfEdge( nextStartLocation, location )! );
      const emptyAdjacentEdges = adjacentEdges.filter( halfEdge => halfEdge.face === null );

      assertEnabled() && assert( emptyAdjacentEdges.length === 1 );

      return emptyAdjacentEdges[ 0 ];
    };

    const boundary: HalfEdge[] = [ firstHalfEdge ];
    let next = getNext( firstHalfEdge );

    firstHalfEdge.next = next;
    next.previous = firstHalfEdge;

    while ( next !== firstHalfEdge ) {
      boundary.push( next );
      boundaryHalfEdges.delete( next );
      const previous = next;
      next = getNext( next );

      // This should complete the next/previous info that we didn't otherwise fill out
      previous.next = next;
      next.previous = previous;
    }

    if ( getSignedArea( boundary.map( halfEdge => halfEdge.start.viewCoordinates ) ) < 0 ) {
      outerBoundaries.push( boundary );
    }
    else {
      innerBoundaries.push( boundary );
    }
  }

  assertEnabled() && assert( outerBoundaries.length === 1 );

  // Now that our halfEdge next/previous values are correct, we can use that to scan around vertices
  vertices.forEach( vertex => {
    // unordered(!), do not use
    const adjacentLocations = edgeIdentifierLookup.getAdjacentLocations( vertex.logicalCoordinates );

    // incoming
    const firstHalfEdge = getHalfEdge( adjacentLocations[ 0 ], vertex.logicalCoordinates )!;
    let currentHalfEdge = firstHalfEdge;
    const incomingHalfEdges: HalfEdge[] = [ firstHalfEdge ];

    // loop around to get incoming edges
    while ( currentHalfEdge.reversed.previous !== firstHalfEdge ) {
      assertEnabled() && assert( currentHalfEdge.reversed.previous );

      currentHalfEdge = currentHalfEdge.reversed.previous;
      incomingHalfEdges.push( currentHalfEdge );
    }

    vertex.incomingHalfEdges = incomingHalfEdges;
    vertex.outgoingHalfEdges = incomingHalfEdges.map( halfEdge => halfEdge.reversed );
    vertex.edges = incomingHalfEdges.map( halfEdge => halfEdge.edge );
    vertex.faces = incomingHalfEdges.map( halfEdge => halfEdge.face ).filter( face => face !== null ) as Face[];
  } );

  return {
    edges,
    vertices,
    faces,
    halfEdges,
    outerBoundary: outerBoundaries[ 0 ],
    innerBoundaries
  };
};
