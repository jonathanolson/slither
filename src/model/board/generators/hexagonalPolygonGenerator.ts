import { PolygonGenerator } from '../PolygonGenerator.ts';
import { Range, Vector2 } from 'phet-lib/dot';
import _ from '../../../workarounds/_.ts';

export const hexagonalPolygonGenerator: PolygonGenerator = {
  name: 'Hexagonal',
  parameters: {
    radius: {
      label: 'Radius',
      type: 'integer',
      range: new Range( 1, 30 )
    },
    isPointyTop: {
      label: 'Pointy Top',
      type: 'boolean'
    },
    holeRadius: {
      label: 'Hole Radius',
      type: 'integer',
      range: new Range( 0, 25 ),
      advanced: true
    }
  },
  defaultParameterValues: {
    radius: 4,
    isPointyTop: true,
    holeRadius: 0
  },
  generate: ( parameters ) => {
    const radius = parameters.radius as number;
    const isPointyTop = parameters.isPointyTop as boolean;
    const holeRadius = parameters.holeRadius as number;

    // axial convention with https://www.redblobgames.com/grids/hexagons/
    let qBasis: Vector2;
    let rBasis: Vector2;

    // boo, no Matrix2
    if ( isPointyTop ) {
      qBasis = new Vector2( Math.sqrt( 3 ), 0 );
      rBasis = new Vector2( Math.sqrt( 3 ) / 2, 3 / 2 );
    }
    else {
      qBasis = new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 );
      rBasis = new Vector2( 0, Math.sqrt( 3 ) );
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

    const getDistance = ( a: Vector2, b: Vector2 ) => {
      return ( Math.abs( a.x - b.x ) + Math.abs( a.x + a.y - b.x - b.y ) + Math.abs( a.y - b.y ) ) / 2;
    };

    const polygons: Vector2[][] = [];

    // Faces in the puzzle
    for ( let q = -radius; q <= radius; q++ ) {
      for ( let r = Math.max( -radius, -q - radius ); r <= Math.min( radius, -q + radius ); r++ ) {
        const point = new Vector2( q, r );
        if ( getDistance( point, new Vector2( 0, 0 ) ) >= holeRadius ) {
          polygons.push( getVertexLocationsFromFace( point ).map( p => {
            return qBasis.timesScalar( p.x ).plus( rBasis.timesScalar( p.y ) ).timesScalar( 1 / 3 );
          } ) );
        }
      }
    }

    return polygons;
  }
};