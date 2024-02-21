import { BaseBoard } from '../core/BaseBoard.ts';
import { TStructure } from '../core/TStructure.ts';
import { TBoard } from '../core/TBoard.ts';
import _ from '../../../workarounds/_.ts';
import { BaseFace } from '../core/BaseFace.ts';
import { BaseVertex } from '../core/BaseVertex.ts';
import { BaseEdge } from '../core/BaseEdge.ts';
import { BaseHalfEdge } from '../core/BaseHalfEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { THalfEdge } from '../core/THalfEdge.ts';
import { Vector2 } from 'phet-lib/dot';
import { validateBoard } from '../core/validateBoard.ts';

export class HexagonalBoard extends BaseBoard<TStructure> implements TBoard {

  public readonly isHexagonal = true;

  public constructor(
    public readonly radius: number,
    public readonly scale: number,
    public readonly isPointyTop: boolean
  ) {

    // axial convention with https://www.redblobgames.com/grids/hexagons/
    let qBasis: Vector2;
    let rBasis: Vector2;

    // boo, no Matrix2
    if ( isPointyTop ) {
      qBasis = new Vector2( Math.sqrt( 3 ), 0 ).timesScalar( scale );
      rBasis = new Vector2( Math.sqrt( 3 ) / 2, 3 / 2 ).timesScalar( scale );
    }
    else {
      qBasis = new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 ).timesScalar( scale );
      rBasis = new Vector2( 0, Math.sqrt( 3 ) ).timesScalar( scale );
    }

    // The six axial directions in QR coordinates to move from one face to the next (in CCW direction)
    const axialNeighborDeltas = [
      new Vector2( 1, 0 ),
      new Vector2( 1, -1 ),
      new Vector2( 0, -1 ),
      new Vector2( -1, 0 ),
      new Vector2( -1, 1 ),
      new Vector2( 0, 1 )
    ];

    // The sum of adjacent axial directions, which when added to a face coordinate give the 1/3 of moving to its vertex.
    const vertexNeighborDeltas = _.range( 0, 6 ).map( i => axialNeighborDeltas[ i ].plus( axialNeighborDeltas[ ( i + 1 ) % 6 ] ) );

    // vertex coordinates will be the sum of all three adjacent faces
    const getVertexLocationsFromFace = ( f: Vector2 ): Vector2[] => vertexNeighborDeltas.map( delta => delta.plus( f.timesScalar( 3 ) ) );

    // adjacent face coordinates can be determined from a vertex
    const getFaceLocationsFromVertex = ( v: Vector2 ): Vector2[] => vertexNeighborDeltas.map( delta => v.minus( delta ) ).filter( f => f.x % 3 === 0 && f.y % 3 === 0 ).map( f => f.dividedScalar( 3 ) );

    // const getDistance = ( a: Vector2, b: Vector2 ) => {
    //   return ( Math.abs( a.x - b.x ) + Math.abs( a.x + a.y - b.x - b.y ) + Math.abs( a.y - b.y ) ) / 2;
    // };

    // Faces in the puzzle
    const faceLocations: Vector2[] = [];
    for ( let q = -radius; q <= radius; q++ ) {
      for ( let r = Math.max( -radius, -q - radius ); r <= Math.min( radius, -q + radius ); r++ ) {
        faceLocations.push( new Vector2( q, r ) );
      }
    }

    // Vertices in the puzzle
    const vertexLocations: Vector2[] = _.uniqWith( faceLocations.flatMap( getVertexLocationsFromFace ), ( a, b ) => a.equals( b ) );

    // Includes faces "out" of the puzzle, but have a vertex that is in the puzzle
    const expandedFaceLocations: Vector2[] = _.uniqWith( vertexLocations.flatMap( getFaceLocationsFromVertex ), ( a, b ) => a.equals( b ) );

    // TODO: see how it works where we don't provide a custom structure?
    // TODO: we should have the coordinate bit in a board anyway?
    const faces: BaseFace<TStructure>[] = [];
    const vertices: BaseVertex<TStructure>[] = [];
    const edges: BaseEdge<TStructure>[] = [];

    // TODO: more efficient mappings sometime?
    const getFace = ( f: Vector2 ) => faces.find( face => face.logicalCoordinates.equals( f ) );
    const getVertex = ( v: Vector2 ) => vertices.find( vertex => vertex.logicalCoordinates.equals( v ) );
    const getEdge = ( start: Vector2, end: Vector2 ) => edges.find( edge => {
      return ( edge.start.logicalCoordinates.equals( start ) && edge.end.logicalCoordinates.equals( end ) ) || ( edge.start.logicalCoordinates.equals( end ) && edge.end.logicalCoordinates.equals( start ) );
    } );
    const getHalfEdge = ( start: Vector2, end: Vector2 ) => {
      const edge = getEdge( start, end );
      if ( !edge ) {
        return edge;
      }
      else {
        return edge.forwardHalf.start.logicalCoordinates.equals( start ) ? edge.forwardHalf : edge.reversedHalf;
      }
    };

    const next = ( i: number ) => ( i + 1 ) % 6;
    // const previous = ( i: number ) => ( i + 5 ) % 6;
    const doubleNext = ( i: number ) => ( i + 2 ) % 6;

    // Create faces
    faceLocations.forEach( faceLocation => {
      faces.push( new BaseFace<TStructure>( faceLocation, qBasis.timesScalar( faceLocation.x ).plus( rBasis.timesScalar( faceLocation.y ) ) ) );
    } );

    // Create vertices
    vertexLocations.forEach( vertexLocation => {
      // Since we summed up the three face coordinates to get the vertex, we need to divide by 3 to get the "average" face coordinate
      vertices.push( new BaseVertex<TStructure>( vertexLocation, qBasis.timesScalar( vertexLocation.x ).plus( rBasis.timesScalar( vertexLocation.y ) ).timesScalar( 1 / 3 ) ) );
    } );

    // Create edges
    faces.forEach( face => {
      const vertexLocations = getVertexLocationsFromFace( face.logicalCoordinates );
      const vertices = vertexLocations.map( coord => getVertex( coord )! ); // should be guaranteed from above
      for ( let i = 0; i < vertices.length; i++ ) {
        const existingEdge = getEdge( vertexLocations[ i ], vertexLocations[ next( i ) ] );
        if ( !existingEdge ) {
          const startVertex = vertices[ i ];
          const endVertex = vertices[ next( i ) ];
          const edge = new BaseEdge<TStructure>( startVertex, endVertex );
          edge.forwardHalf = new BaseHalfEdge<TStructure>( startVertex, endVertex, false );
          edge.reversedHalf = new BaseHalfEdge<TStructure>( endVertex, startVertex, true );
          edge.forwardHalf.edge = edge;
          edge.reversedHalf.edge = edge;
          edge.forwardHalf.reversed = edge.reversedHalf;
          edge.reversedHalf.reversed = edge.forwardHalf;
          edge.vertices = [ startVertex, endVertex ];
          edge.faces = [];
          edges.push( edge );
        }
      }
    } );

    // At expanded locations
    expandedFaceLocations.forEach( faceLocation => {
      const vertexLocations = getVertexLocationsFromFace( faceLocation );
      const face = getFace( faceLocation ) || null;

      for ( let i = 0; i < 6; i++ ) {
        const startLocation = vertexLocations[ i ];
        const middleLocation = vertexLocations[ next( i ) ];
        const endLocation = vertexLocations[ doubleNext( i ) ];

        const start = getVertex( startLocation );
        const middle = getVertex( middleLocation );
        const end = getVertex( endLocation );

        // Connect halfEdge.face, edge.forwardFace, edge.reversedFace
        if ( start && middle ) {
          const halfEdge = getHalfEdge( startLocation, middleLocation );

          if ( halfEdge ) {
            const edge = halfEdge.edge;

            halfEdge.face = face;
            if ( face ) {
              edge.faces.push( face );
            }
            if ( halfEdge.isReversed ) {
              edge.reversedFace = face;
            }
            else {
              edge.forwardFace = face;
            }
          }
        }

        if ( start && middle && end ) {
          const firstHalf = getHalfEdge( startLocation, middleLocation );
          const secondHalf = getHalfEdge( middleLocation, endLocation );

          // sanity check
          if ( firstHalf && secondHalf ) {
            firstHalf.next = secondHalf;
            secondHalf.previous = firstHalf;
          }
        }
      }
    } );

    // Hook up things around the faces
    faces.forEach( face => {
      const vertexLocations = getVertexLocationsFromFace( face.logicalCoordinates );
      const vertices = vertexLocations.map( coord => getVertex( coord )! );
      const halfEdges = _.range( 0, 6 ).map( i => getHalfEdge( vertexLocations[ i ], vertexLocations[ next( i ) ] )! );
      const edges = halfEdges.map( halfEdge => halfEdge.edge );

      face.vertices = vertices;
      face.halfEdges = halfEdges;
      face.edges = edges;
    } );

    // Handle connecting next/previous for half-edges around vertices with only one face
    vertices.forEach( vertex => {
      const faceLocations = getFaceLocationsFromVertex( vertex.logicalCoordinates );
      const faces = faceLocations.map( coord => getFace( coord ) ).filter( _.identity ) as BaseFace<TStructure>[];

      if ( faces.length === 1 ) {
        const edgePair = edges.filter( edge => edge.vertices.includes( vertex ) );
        assertEnabled() && assert( edgePair.length === 2 );

        const otherVertices = edgePair.map( edge => edge.getOtherVertex( vertex ) );

        const first = getHalfEdge( otherVertices[ 0 ].logicalCoordinates, vertex.logicalCoordinates )!;
        const second = getHalfEdge( vertex.logicalCoordinates, otherVertices[ 1 ].logicalCoordinates )!;
        first.next = second;
        second.previous = first;

        first.reversed.previous = second.reversed;
        second.reversed.next = first.reversed;
      }
    } );

    // Now that our halfEdge next/previous values are correct, we can use that to scan
    vertices.forEach( vertex => {
      const faceLocations = getFaceLocationsFromVertex( vertex.logicalCoordinates );
      const faces = faceLocations.map( coord => getFace( coord ) ).filter( _.identity ) as BaseFace<TStructure>[];

      const someEdge = edges.find( edge => edge.vertices.includes( vertex ) )!;

      const firstHalfEdge = someEdge.forwardHalf.end === vertex ? someEdge.forwardHalf : someEdge.reversedHalf;
      let currentHalfEdge = firstHalfEdge;
      const incomingHalfEdges: THalfEdge[] = [ firstHalfEdge ];

      // loop around to get incoming edges
      while ( currentHalfEdge.reversed.previous !== firstHalfEdge ) {
        assertEnabled() && assert( currentHalfEdge.reversed.previous );

        currentHalfEdge = currentHalfEdge.reversed.previous;
        incomingHalfEdges.push( currentHalfEdge );
      }

      vertex.faces = faces;
      vertex.incomingHalfEdges = incomingHalfEdges;
      vertex.outgoingHalfEdges = incomingHalfEdges.map( halfEdge => halfEdge.reversed );
      vertex.edges = incomingHalfEdges.map( halfEdge => halfEdge.edge );
    } );

    super( edges, vertices, faces );

    assertEnabled() && validateBoard( this );
  }

  public static enumeratePointyFaceCoordinates( radius: number ): Vector2[] {
    const result: Vector2[] = [];

    for ( let r = -radius; r <= radius; r++ ) {
      for ( let q = Math.max( -radius, -r - radius ); q <= Math.min( radius, -r + radius ); q++ ) {
        result.push( new Vector2( q, r ) );
      }
    }

    return result;
  }
}