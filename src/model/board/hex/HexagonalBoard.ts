import { BaseBoard } from '../core/BaseBoard.ts';
import { TStructure } from '../core/TStructure.ts';
import { TBoard } from '../core/TBoard.ts';
import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { Vector2 } from 'phet-lib/dot';
import { validateBoard } from '../core/validateBoard.ts';
import { createBoardDescriptor, TFaceDescriptor, TVertexDescriptor } from '../core/createBoardDescriptor.ts';

export class HexagonalBoard extends BaseBoard<TStructure> implements TBoard {

  public readonly isHexagonal = true;

  public constructor(
    public readonly radius: number,
    public readonly scale: number,
    public readonly isPointyTop: boolean,
    public readonly holeRadius: number = 0
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
    // const getFaceLocationsFromVertex = ( v: Vector2 ): Vector2[] => vertexNeighborDeltas.map( delta => v.minus( delta ) ).filter( f => f.x % 3 === 0 && f.y % 3 === 0 ).map( f => f.dividedScalar( 3 ) );

    const getDistance = ( a: Vector2, b: Vector2 ) => {
      return ( Math.abs( a.x - b.x ) + Math.abs( a.x + a.y - b.x - b.y ) + Math.abs( a.y - b.y ) ) / 2;
    };

    // Faces in the puzzle
    const faceLocations: Vector2[] = [];
    for ( let q = -radius; q <= radius; q++ ) {
      for ( let r = Math.max( -radius, -q - radius ); r <= Math.min( radius, -q + radius ); r++ ) {
        const point = new Vector2( q, r );
        if ( getDistance( point, new Vector2( 0, 0 ) ) >= holeRadius ) {
          faceLocations.push( point );
        }
      }
    }

    // Vertices in the puzzle
    const vertexLocations: Vector2[] = _.uniqWith( faceLocations.flatMap( getVertexLocationsFromFace ), ( a, b ) => a.equals( b ) );

    const vertexDescriptors: TVertexDescriptor[] = vertexLocations.map( vertexLocation => {
      return {
        logicalCoordinates: vertexLocation,
        viewCoordinates: qBasis.timesScalar( vertexLocation.x ).plus( rBasis.timesScalar( vertexLocation.y ) ).timesScalar( 1 / 3 )
      };
    } );
    const faceDescriptors: TFaceDescriptor[] = faceLocations.map( faceLocation => {
      return {
        logicalCoordinates: faceLocation,
        vertices: getVertexLocationsFromFace( faceLocation ).map( vertexLocation => {
          const descriptor = vertexDescriptors.find( vertexDescriptor => vertexDescriptor.logicalCoordinates.equals( vertexLocation ) );
          assertEnabled() && assert( descriptor );
          return descriptor!;
        } ),
      };
    } );

    super( createBoardDescriptor( vertexDescriptors, faceDescriptors ) );

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