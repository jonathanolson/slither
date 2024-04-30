// @ts-expect-error
import { IsohedralTiling, tilingTypes } from 'tactile-js'; // Note: EdgeShape from here
import { Shape } from 'phet-lib/kite';
import { Bounds2, Matrix3, Vector2 } from 'phet-lib/dot';
import { TBoard } from './TBoard.ts';
import { TStructure } from './TStructure.ts';
import { BaseBoard } from './BaseBoard.ts';
import { createBoardDescriptor, rescaleProtoDescriptorMinimum, TFaceDescriptor, TVertexDescriptor } from './createBoardDescriptor.ts';
import { getCoordinateClusteredMap } from '../../../util/getCoordinateClusteredMap.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

// console.log( EdgeShape );

// see https://observablehq.com/@mattdzugan/dithering-on-non-square-pixels for ideas

// 19, 25, 26, 28, 31

// http://localhost/tactile-js/demo/interactivedemo.html
// console.log( 'U', EdgeShape.U );
// console.log( 'S', EdgeShape.S );
// console.log( 'I', EdgeShape.I );
// console.log( 'J', EdgeShape.J );

export class PolygonalBoard extends BaseBoard<TStructure> implements TBoard {
  public constructor(
    public readonly polygons: Vector2[][],
    public readonly scale: number
  ) {

    const xValues = polygons.flatMap( polygon => polygon.map( vertex => vertex.x ) );
    const yValues = polygons.flatMap( polygon => polygon.map( vertex => vertex.y ) );

    // TODO: improve epsilon?
    const xMap = getCoordinateClusteredMap( xValues, 0.0001 );
    const yMap = getCoordinateClusteredMap( yValues, 0.0001 );

    const vertexDescriptors: TVertexDescriptor[] = [];
    const vertexDescriptorMap = new Map<string, TVertexDescriptor>();

    // Return vertex descriptors lazily
    const getVertexDescriptor = ( vertex: Vector2 ): TVertexDescriptor => {
      const x = xMap.get( vertex.x )!;
      const y = yMap.get( vertex.y )!;

      assertEnabled() && assert( x !== undefined && y !== undefined );

      const keyString = `${x},${y}`;
      if ( !vertexDescriptorMap.has( keyString ) ) {
        const vertexDescriptor: TVertexDescriptor = {
          // TODO: should we improve our logical coordinates somehow? (just number them for now)
          logicalCoordinates: new Vector2( 0, vertexDescriptorMap.size ),
          viewCoordinates: new Vector2( x, y ).timesScalar( scale )
        };
        vertexDescriptorMap.set( keyString, vertexDescriptor );
        vertexDescriptors.push( vertexDescriptor );
      }

      return vertexDescriptorMap.get( keyString )!;
    };

    const faceDescriptors: TFaceDescriptor[] = polygons.map( ( polygon, i ) => {
      return {
        // TODO: should we improve our logical coordinates somehow? (just number them for now)
        logicalCoordinates: new Vector2( i, 0 ),
        vertices: polygon.map( getVertexDescriptor )
      };
    } );

    super( createBoardDescriptor( rescaleProtoDescriptorMinimum( {
      vertices: vertexDescriptors,
      faces: faceDescriptors
    }, scale ) ) );
  }
}

const matrixFromT = ( T: number[] ) => Matrix3.rowMajor(
  T[ 0 ], T[ 1 ], T[ 2 ],
  T[ 3 ], T[ 4 ], T[ 5 ],
  0, 0, 1
);
const vertexFromV = ( V: { x: number; y: number } ) => new Vector2( V.x, V.y );

export interface PeriodicBoardTiling {
  name: string;
  basisA: Vector2;
  basisB: Vector2;
  polygons: Vector2[][];
  translation: Vector2;
  scale?: number;
}

export const squareTiling: PeriodicBoardTiling = {
  name: 'Square Tiling',
  basisA: new Vector2( 1, 0 ),
  basisB: new Vector2( 0, 1 ),
  polygons: [
    [
      new Vector2( 0, 0 ),
      new Vector2( 0, 1 ),
      new Vector2( 1, 1 ),
      new Vector2( 1, 0 )
    ]
  ],
  translation: new Vector2( 1, 1 )
};

export const hexagonalTiling: PeriodicBoardTiling = {
  name: 'Hexagonal Tiling',
  basisA: new Vector2( 1, 0 ),
  basisB: new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
  polygons: [
    [
      new Vector2( 0, 1 / Math.sqrt( 3 ) ),
      new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 1 / Math.sqrt( 3 ) ),
      new Vector2( 1, 0 ),
      new Vector2( 0.5, -( 1 / ( 2 * Math.sqrt( 3 ) ) ) ),
      new Vector2( 0, 0 )
    ]
  ],
  translation: new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 )
};

export const triangularTiling: PeriodicBoardTiling = {
  name: 'Triangular',
  basisA: new Vector2( 1, 0 ),
  basisB: new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
  polygons: [
    [
      new Vector2( 0, 0 ),
      new Vector2( 1, 0 ),
      new Vector2( 0.5, Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 0 )
    ]
  ],
  translation: new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 )
};

export const trihexagonalTiling: PeriodicBoardTiling = {
  name: 'Trihexagonal',
  basisA: new Vector2( 2, 0 ),
  basisB: new Vector2( 1, Math.sqrt( 3 ) ),
  polygons: [
    [
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -1, 0 ),
      new Vector2( -1 / 2, Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( 1, 0 ),
      new Vector2( 3 / 2, -( Math.sqrt( 3 ) / 2 ) )
    ]
  ],
  translation: new Vector2( 3, Math.sqrt( 3 ) )
};

export const smallRhombitrihexagonalTiling: PeriodicBoardTiling = {
  name: 'Rhombitrihexagonal',
  basisA: new Vector2( 0.5 * ( 3 + Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
  basisB: new Vector2( 0.5 * ( 3 + Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -1, 0 ),
      new Vector2( -1 / 2, Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( 1, 0 ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), -1 / 2 )
    ],
    [
      new Vector2( 1 + Math.sqrt( 3 ) / 2, 1 / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 1 + Math.sqrt( 3 ) / 2, -1 / 2 )
    ],
    [
      new Vector2( 1 + Math.sqrt( 3 ) / 2, 1 / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 2, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 2, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( -1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( -1 / 2, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) )
    ],
  ],
  translation: new Vector2( 3 + Math.sqrt( 3 ), 0.5 * ( -1 - Math.sqrt( 3 ) ) + 0.5 * ( 1 + Math.sqrt( 3 ) ) )
};

export const truncatedSquareTiling: PeriodicBoardTiling = {
  name: 'Truncated Square',
  basisA: new Vector2( 2 + Math.sqrt( 2 ), 0 ),
  basisB: new Vector2( 0.5 * ( 2 + Math.sqrt( 2 ) ), 1 + 1 / Math.sqrt( 2 ) ),
  polygons: [
    [
      new Vector2( 0.5, 0.5 * ( 1 + Math.sqrt( 2 ) ) ),
      new Vector2( 0.5 * ( 1 + Math.sqrt( 2 ) ), 0.5 ),
      new Vector2( 0.5 * ( 1 + Math.sqrt( 2 ) ), -0.5 ),
      new Vector2( 0.5, 0.5 * ( -1 - Math.sqrt( 2 ) ) ),
      new Vector2( -0.5, 0.5 * ( -1 - Math.sqrt( 2 ) ) ),
      new Vector2( 0.5 * ( -1 - Math.sqrt( 2 ) ), -0.5 ),
      new Vector2( 0.5 * ( -1 - Math.sqrt( 2 ) ), 0.5 ),
      new Vector2( -0.5, 0.5 * ( 1 + Math.sqrt( 2 ) ) )
    ],
    [
      new Vector2( 0.5 * ( 1 + Math.sqrt( 2 ) ), 0.5 ),
      new Vector2( 0.5 * ( 1 + Math.sqrt( 2 ) ), -0.5 ),
      new Vector2( 3 / 2 + 1 / Math.sqrt( 2 ), -0.5 ),
      new Vector2( 3 / 2 + 1 / Math.sqrt( 2 ), 0.5 )
    ]
  ],
  translation: new Vector2( 2 + Math.sqrt( 2 ) + 0.5 * ( 2 + Math.sqrt( 2 ) ), 1 + 1 / Math.sqrt( 2 ) )
};

export const snubSquareTiling: PeriodicBoardTiling = {
  name: 'Snub Square',
  basisA: new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
  basisB: new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 1 / 2, 0 ),
      new Vector2( 0, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -( 1 / 2 ), 0 )
    ],
    [
      new Vector2( 1 / 2, 0 ),
      new Vector2( 0, Math.sqrt( 3 ) / 2 ),
      new Vector2( -( 1 / 2 ), 0 )
    ],
    [
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 ),
      new Vector2( 1 / 2, 0 ),
      new Vector2( 0, Math.sqrt( 3 ) / 2 ),
      new Vector2( Math.sqrt( 3 ) / 2, 1 / 2 * ( 1 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( Math.sqrt( 3 ) / 2, 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0, Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( -( Math.sqrt( 3 ) / 2 ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0, Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ), 1 / 2 ),
      new Vector2( -( 1 / 2 ), 0 ),
      new Vector2( 0, Math.sqrt( 3 ) / 2 ),
      new Vector2( -( Math.sqrt( 3 ) / 2 ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) )
    ]
  ],
  translation: new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ) + 1 / 2 * ( 1 + Math.sqrt( 3 ) ), -1 - Math.sqrt( 3 ) )
};

export const truncatedHexagonalTiling: PeriodicBoardTiling = {
  name: 'Truncated Hexagonal',
  basisA: new Vector2( 2 + Math.sqrt( 3 ), 0 ),
  basisB: new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 3 / 2 + Math.sqrt( 3 ) ),
  polygons: [
    [
      new Vector2( 1 / 2, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), 1 / 2 ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2, 1 / 2 * ( -2 - Math.sqrt( 3 ) ) ),
      new Vector2( -( 1 / 2 ), 1 / 2 * ( -2 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( -2 - Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 1 / 2 * ( -2 - Math.sqrt( 3 ) ), 1 / 2 ),
      new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( -( 1 / 2 ), 1 / 2 * ( 2 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 3 + Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), 1 / 2 )
    ],
    [
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 3 + Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) )
    ]
  ],
  translation: new Vector2( 2 + Math.sqrt( 3 ) + 0.5 * ( 2 + Math.sqrt( 3 ) ), 3 / 2 + Math.sqrt( 3 ) )
};

export const elongatedTriangularTiling: PeriodicBoardTiling = {
  name: 'Elongated Triangular',
  basisA: new Vector2( 1, 0 ),
  basisB: new Vector2( 0.5, 0.5 * ( 2 + Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( -( 1 / 2 ), -( 1 / 2 ) ),
      new Vector2( -( 1 / 2 ), 1 / 2 ),
      new Vector2( 1 / 2, 1 / 2 ),
      new Vector2( 1 / 2, -( 1 / 2 ) )
    ],
    [
      new Vector2( 1 / 2, 1 / 2 ),
      new Vector2( 0, 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( -( 1 / 2 ), 1 / 2 )
    ],
    [
      new Vector2( 1 / 2, -( 1 / 2 ) ),
      new Vector2( 0, 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( -( 1 / 2 ), -( 1 / 2 ) )
    ]
  ],
  translation: new Vector2( 3 / 2, 0.5 * ( 2 + Math.sqrt( 3 ) ) )
};

export const greatRhombitrihexagonalTiling: PeriodicBoardTiling = {
  name: 'Great Rhombitrihexagonal',
  basisA: new Vector2( 3 + Math.sqrt( 3 ), 0 ),
  basisB: new Vector2( 0.5 * ( 3 + Math.sqrt( 3 ) ), 1.5 * ( 1 + Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 1 / 2, 1 / 2 * ( 2 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), 1 / 2 ),
      new Vector2( 1 / 2 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 1 / 2 * ( 1 + Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2, 1 / 2 * ( -2 - Math.sqrt( 3 ) ) ),
      new Vector2( -( 1 / 2 ), 1 / 2 * ( -2 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ), 1 / 2 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 2 * ( -2 - Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 1 / 2 * ( -2 - Math.sqrt( 3 ) ), 1 / 2 ),
      new Vector2( 1 / 2 * ( -1 - Math.sqrt( 3 ) ), 1 / 2 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( -( 1 / 2 ), 1 / 2 * ( 2 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1, 1 + Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 * ( 1 + 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 1 + Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0.5, 0.5 * ( 2 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.5 * ( 1 + Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 ),
      new Vector2( 1 + 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 ),
      new Vector2( 0.5 * ( 5 + Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 4 + Math.sqrt( 3 ) ), 0.5 * ( 1 + 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 * ( 1 + 2 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 + 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 ),
      new Vector2( 1 + 0.5 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 )
    ],
    [
      new Vector2( 0.5 * ( 1 + Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 1 + 0.5 * ( 2 + Math.sqrt( 3 ) ), -( 1 / 2 ) ),
      new Vector2( 0.5 * ( 5 + Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 4 + Math.sqrt( 3 ) ), 0.5 * ( -1 - 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 * ( -1 - 2 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 0.5 * ( -1 - 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 1, -1 - Math.sqrt( 3 ) ),
      new Vector2( 0.5, 0.5 * ( -2 - Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 1 + Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) )
    ]
  ],
  translation: new Vector2( 3 + Math.sqrt( 3 ) + 0.5 * ( 3 + Math.sqrt( 3 ) ), 1.5 * ( 1 + Math.sqrt( 3 ) ) )
};

export const snubHexagonalTiling: PeriodicBoardTiling = {
  name: 'Snub Hexagonal',
  basisA: new Vector2( 5 / 2, -Math.sqrt( 3 ) / 2 ),
  basisB: new Vector2( -1 / 2, 3 * Math.sqrt( 3 ) / 2 ),
  polygons: [
    [
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -( 1 / 2 ), -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -1, 0 ),
      new Vector2( -( 1 / 2 ), Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( -1, 0 ),
      new Vector2( -3 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -2, 0 )
    ],
    [
      new Vector2( -( 1 / 2 ), -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -1, 0 ),
      new Vector2( -3 / 2, -( Math.sqrt( 3 ) / 2 ) )
    ],
    [
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 0 ),
      new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( 1, 0 ),
      new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 2, 0 )
    ],
    [
      new Vector2( -1, 0 ),
      new Vector2( -( 1 / 2 ), Math.sqrt( 3 ) / 2 ),
      new Vector2( -( 3 / 2 ), Math.sqrt( 3 ) / 2 )
    ],
    [
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( -( 1 / 2 ), -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( 0, -Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 1, 0 ),
      new Vector2( 1 / 2, -( Math.sqrt( 3 ) / 2 ) ),
      new Vector2( 3 / 2, -( Math.sqrt( 3 ) / 2 ) )
    ],
    [
      new Vector2( -( 1 / 2 ), Math.sqrt( 3 ) / 2 ),
      new Vector2( 1 / 2, Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, Math.sqrt( 3 ) )
    ]
  ],
  translation: new Vector2( 2, Math.sqrt( 3 ) )
};

export const rhombilleTiling: PeriodicBoardTiling = {
  name: 'Rhombille',
  basisA: new Vector2( 2, 0 ),
  basisB: new Vector2( 1, Math.sqrt( 3 ) ),
  polygons: [
    [
      new Vector2( 5, 5 / Math.sqrt( 3 ) ),
      new Vector2( 4, 2 * Math.sqrt( 3 ) ),
      new Vector2( 5, 7 / Math.sqrt( 3 ) ),
      new Vector2( 6, 2 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 5, 5 / Math.sqrt( 3 ) ),
      new Vector2( 6, 2 * Math.sqrt( 3 ) ),
      new Vector2( 6, 4 / Math.sqrt( 3 ) ),
      new Vector2( 5, Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 5, 5 / Math.sqrt( 3 ) ),
      new Vector2( 5, Math.sqrt( 3 ) ),
      new Vector2( 4, 4 / Math.sqrt( 3 ) ),
      new Vector2( 4, 2 * Math.sqrt( 3 ) )
    ]
  ],
  translation: new Vector2( 3, Math.sqrt( 3 ) )
};

export const deltoidalTrihexagonalTiling: PeriodicBoardTiling = {
  name: 'Deltoidal Trihexagonal',
  basisA: new Vector2( 0.5 * ( 3 + Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
  basisB: new Vector2( 0.5 * ( 3 + Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 1 / 3 * ( 12 + 4 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 1 / 4 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.25 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 3 + Math.sqrt( 3 ), 0 ),
      new Vector2( 1 / 4 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.25 * ( 1 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 3 * ( 12 + 4 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 1 / 4 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.25 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0 )
    ],
    [
      new Vector2( 1 / 3 * ( 12 + 4 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 4 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.25 * ( -1 - Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 3 * ( 15 + 5 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 4 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( 1 + Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 3 * ( 15 + 5 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 1 / 4 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( 1 + Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 0 ),
      new Vector2( 1 / 4 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( -1 - Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 1 / 3 * ( 15 + 5 * Math.sqrt( 3 ) ), 0 ),
      new Vector2( 1 / 4 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0 )
    ]
  ],
  translation: new Vector2( 3 + Math.sqrt( 3 ), 0.5 * ( -1 - Math.sqrt( 3 ) ) + 0.5 * ( 1 + Math.sqrt( 3 ) ) )
};

export const tetrakisSquareTiling: PeriodicBoardTiling = {
  name: 'Tetrakis Square',
  basisA: new Vector2( 2 + Math.sqrt( 2 ), 0 ),
  basisB: new Vector2( 0.5 * ( 2 + Math.sqrt( 2 ) ), 1 + 1 / Math.sqrt( 2 ) ),
  polygons: [
    [
      new Vector2( 4 + 2 * Math.sqrt( 2 ), 0.5 * ( 2 + Math.sqrt( 2 ) ) ),
      new Vector2( 4 + 2 * Math.sqrt( 2 ), 2 + Math.sqrt( 2 ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 2 ) ), 0.5 * ( 2 + Math.sqrt( 2 ) ) )
    ],
    [
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 2 ) ), 2 + Math.sqrt( 2 ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 2 ) ), 0.5 * ( 2 + Math.sqrt( 2 ) ) ),
      new Vector2( 4 + 2 * Math.sqrt( 2 ), 2 + Math.sqrt( 2 ) )
    ],
    [
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 2 ) ), 2 + Math.sqrt( 2 ) ),
      new Vector2( 6 + 3 * Math.sqrt( 2 ), 2 + Math.sqrt( 2 ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 2 ) ), 0.5 * ( 2 + Math.sqrt( 2 ) ) )
    ],
    [
      new Vector2( 6 + 3 * Math.sqrt( 2 ), 2 + Math.sqrt( 2 ) ),
      new Vector2( 6 + 3 * Math.sqrt( 2 ), 0.5 * ( 2 + Math.sqrt( 2 ) ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 2 ) ), 0.5 * ( 2 + Math.sqrt( 2 ) ) )
    ]
  ],
  translation: new Vector2( 2 + Math.sqrt( 2 ) + 0.5 * ( 2 + Math.sqrt( 2 ) ), 1 + 1 / Math.sqrt( 2 ) )
};

export const cairoPentagonalTiling: PeriodicBoardTiling = {
  name: 'Cairo Pentagonal',
  basisA: new Vector2( 0.5 * ( 1 + Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
  basisB: new Vector2( 0.5 * ( -1 - Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 0, 1 / 6 * ( -6 - 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.25 * ( -1 - Math.sqrt( 3 ) ), 0.25 * ( -3 - 3 * Math.sqrt( 3 ) ) ),
      new Vector2( -1 / ( 2 * Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 1 / ( 2 * Math.sqrt( 3 ) ), 0.5 * ( -1 - Math.sqrt( 3 ) ) ),
      new Vector2( 0.25 * ( 1 + Math.sqrt( 3 ) ), 0.25 * ( -3 - 3 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0, 1 / 6 * ( -6 - 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.25 * ( 1 + Math.sqrt( 3 ) ), 0.25 * ( -3 - 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 6 * ( 3 + 2 * Math.sqrt( 3 ) ), -1 - Math.sqrt( 3 ) ),
      new Vector2( 0.25 * ( 1 + Math.sqrt( 3 ) ), 0.25 * ( -5 - 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 0, 1 / 6 * ( -6 - 7 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0, 1 / 6 * ( -6 - 7 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.25 * ( -1 - Math.sqrt( 3 ) ), 0.25 * ( -5 - 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 1 / 6 * ( -3 - 2 * Math.sqrt( 3 ) ), -1 - Math.sqrt( 3 ) ),
      new Vector2( 0.25 * ( -1 - Math.sqrt( 3 ) ), 0.25 * ( -3 - 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 0, 1 / 6 * ( -6 - 5 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0, 1 / 6 * ( -6 - 7 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.25 * ( 1 + Math.sqrt( 3 ) ), 0.25 * ( -5 - 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 1 / ( 2 * Math.sqrt( 3 ) ), 0.5 * ( -3 - 3 * Math.sqrt( 3 ) ) ),
      new Vector2( -1 / ( 2 * Math.sqrt( 3 ) ), 0.5 * ( -3 - 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.25 * ( -1 - Math.sqrt( 3 ) ), 0.25 * ( -5 - 5 * Math.sqrt( 3 ) ) )
    ]
  ],
  translation: new Vector2( 0.5 * ( -1 - Math.sqrt( 3 ) ) + 0.5 * ( 1 + Math.sqrt( 3 ) ), -1 - Math.sqrt( 3 ) )
};

export const triakisTriangularTiling: PeriodicBoardTiling = {
  name: 'Triakis Triangular',
  basisA: new Vector2( 2 + Math.sqrt( 3 ), 0 ),
  basisB: new Vector2( 0.5 * ( 2 + Math.sqrt( 3 ) ), 1.5 + Math.sqrt( 3 ) ),
  polygons: [
    [
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 1 / 3 * ( 6 + 4 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 6 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 2 * Math.sqrt( 3 ) )
      )
    ],
    [
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 1 / 3 * ( 6 + 4 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 6 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 3 + 2 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 1 / 3 * ( 6 + 4 * Math.sqrt( 3 ) ) ),
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 3 + 2 * Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 2 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 1 / 6 * ( 15 + 10 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 3 + 2 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 1 / 6 * ( 15 + 10 * Math.sqrt( 3 ) ) ),
      new Vector2( 4 + 2 * Math.sqrt( 3 ), 3 + 2 * Math.sqrt( 3 ) ),
      new Vector2( 6 + 3 * Math.sqrt( 3 ), 3 + 2 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 1 / 6 * ( 15 + 10 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 3 * Math.sqrt( 3 ), 3 + 2 * Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 10 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 2 * Math.sqrt( 3 ) ) )
    ]
  ],
  translation: new Vector2( 2 + Math.sqrt( 3 ) + 0.5 * ( 2 + Math.sqrt( 3 ) ), 1.5 + Math.sqrt( 3 ) )
};

export const prismaticPentagonalTiling: PeriodicBoardTiling = {
  name: 'Prismatic Pentagonal',
  basisA: new Vector2( 1, 0 ),
  basisB: new Vector2( 0.5, 0.5 * ( 2 + Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 2, 1 / 6 * ( 9 + 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 2.5, 1 / 6 * ( 9 + 4 * Math.sqrt( 3 ) ) ),
      new Vector2( 2.5, 0.5 * ( 2 + Math.sqrt( 3 ) ) ),
      new Vector2( 1.5, 0.5 * ( 2 + Math.sqrt( 3 ) ) ),
      new Vector2( 1.5, 1 / 6 * ( 9 + 4 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 2.5, 1 / 6 * ( 9 + 4 * Math.sqrt( 3 ) ) ),
      new Vector2( 2, 1 / 6 * ( 9 + 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 2, 2 + Math.sqrt( 3 ) ),
      new Vector2( 3, 2 + Math.sqrt( 3 ) ),
      new Vector2( 3, 1 / 6 * ( 9 + 5 * Math.sqrt( 3 ) ) )
    ]
  ],
  translation: new Vector2( 1.5, 0.5 * ( 2 + Math.sqrt( 3 ) ) )
};

export const bisectedHexagonalTiling: PeriodicBoardTiling = {
  name: 'Bisected Hexagonal',
  basisA: new Vector2( 3 + Math.sqrt( 3 ), 0 ),
  basisB: new Vector2( 0.5 * ( 3 + Math.sqrt( 3 ) ), 1.5 * ( 1 + Math.sqrt( 3 ) ) ),
  polygons: [
    [
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 2 + 2 * Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 1 + Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 1 + Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 2 + 2 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 0.25 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 2 + 2 * Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.25 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 5 + 5 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.25 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 9 + 3 * Math.sqrt( 3 ) ), 0.5 * ( 5 + 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 3 + 3 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 0.25 * ( 21 + 7 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 3 + 3 * Math.sqrt( 3 ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 2 + 2 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 0.25 * ( 27 + 9 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 2 + 2 * Math.sqrt( 3 ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 3 + 3 * Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 0.25 * ( 27 + 9 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 3 + 3 * Math.sqrt( 3 ) ),
      new Vector2( 0.5 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 5 + 5 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.25 * ( 27 + 9 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 5 + 5 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( 0.25 * ( 27 + 9 * Math.sqrt( 3 ) ), 0.25 * ( 9 + 9 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5 * ( 15 + 5 * Math.sqrt( 3 ) ), 0.5 * ( 3 + 3 * Math.sqrt( 3 ) ) ),
      new Vector2( 6 + 2 * Math.sqrt( 3 ), 2 + 2 * Math.sqrt( 3 ) )
    ]
  ],
  translation: new Vector2( 3 + Math.sqrt( 3 ) + 0.5 * ( 3 + Math.sqrt( 3 ) ), 1.5 * ( 1 + Math.sqrt( 3 ) ) )
};

export const floretPentagonalTiling: PeriodicBoardTiling = {
  name: 'Floret Pentagonal',
  basisA: new Vector2( 2.5, -Math.sqrt( 3 ) / 2 ),
  basisB: new Vector2( -0.5, 3 * Math.sqrt( 3 ) / 2 ),
  polygons: [
    [
      new Vector2( 2, Math.sqrt( 3 ) ),
      new Vector2( 3, 4 / Math.sqrt( 3 ) ),
      new Vector2( 3.5, 7 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 3.5, 5 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 3, 2 / Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 2, Math.sqrt( 3 ) ),
      new Vector2( 3, 2 / Math.sqrt( 3 ) ),
      new Vector2( 3, 1 / Math.sqrt( 3 ) ),
      new Vector2( 2.5, 1 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 2, 1 / Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 2, Math.sqrt( 3 ) ),
      new Vector2( 2, 1 / Math.sqrt( 3 ) ),
      new Vector2( 1.5, 1 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 1, 1 / Math.sqrt( 3 ) ),
      new Vector2( 1, 2 / Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 2, Math.sqrt( 3 ) ),
      new Vector2( 1, 2 / Math.sqrt( 3 ) ),
      new Vector2( 0.5, 5 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5, 7 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 1, 4 / Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 2, Math.sqrt( 3 ) ),
      new Vector2( 1, 4 / Math.sqrt( 3 ) ),
      new Vector2( 1, 5 / Math.sqrt( 3 ) ),
      new Vector2( 1.5, 11 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 2, 5 / Math.sqrt( 3 ) )
    ],
    [
      new Vector2( 2, Math.sqrt( 3 ) ),
      new Vector2( 2, 5 / Math.sqrt( 3 ) ),
      new Vector2( 2.5, 11 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 3, 5 / Math.sqrt( 3 ) ),
      new Vector2( 3, 4 / Math.sqrt( 3 ) )
    ]
  ],
  translation: new Vector2( 2, Math.sqrt( 3 ) )
};

export const portugalTiling: PeriodicBoardTiling = {
  name: 'Portugal',
  basisA: new Vector2( 2, 2 ),
  basisB: new Vector2( -2, 2 ),
  polygons: [
    [
      new Vector2( 0, 0 ),
      new Vector2( 1, 0 ),
      new Vector2( 2, 1 ),
      new Vector2( 2, 2 ),
      new Vector2( 1, 2 ),
      new Vector2( 0, 1 )
    ],
    [
      new Vector2( 2, 2 ),
      new Vector2( 3, 2 ),
      new Vector2( 4, 1 ),
      new Vector2( 4, 0 ),
      new Vector2( 3, 0 ),
      new Vector2( 2, 1 )
    ],
    [
      new Vector2( 1, 0 ),
      new Vector2( 2, 1 ),
      new Vector2( 3, 0 ),
      new Vector2( 2, -1 )
    ]
  ],
  translation: new Vector2( 0, 4 )
};

export const falseCubicTiling: PeriodicBoardTiling = {
  name: 'False Cubic',
  basisA: new Vector2( 1.5, Math.sqrt( 3 ) / 2 ),
  basisB: new Vector2( 0, Math.sqrt( 3 ) ),
  polygons: [
    [
      new Vector2( -1, 0 ),
      new Vector2( -1, 1 / Math.sqrt( 3 ) ),
      new Vector2( -0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, 1 / Math.sqrt( 3 ) ),
      new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 1 / Math.sqrt( 3 ) ),
      new Vector2( 1, 0 ),
      new Vector2( 0.5, -1 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5, -Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, -2 / Math.sqrt( 3 ) ),
      new Vector2( -0.5, -Math.sqrt( 3 ) / 2 ),
      new Vector2( -0.5, -1 / ( 2 * Math.sqrt( 3 ) ) )
    ]
  ],
  translation: new Vector2( 1.5, 1.5 * Math.sqrt( 3 ) ),
  scale: 2
};

export const trihexAndHexTiling: PeriodicBoardTiling = {
  name: 'Trihex and Hex',
  basisA: new Vector2( 2, 0 ),
  basisB: new Vector2( 1, Math.sqrt( 3 ) ),
  polygons: [
    [
      new Vector2( -1, 0 ),
      new Vector2( -1, 1 / Math.sqrt( 3 ) ),
      new Vector2( -0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, 1 / Math.sqrt( 3 ) ),
      new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 1, 1 / Math.sqrt( 3 ) ),
      new Vector2( 1, 0 ),
      new Vector2( 0.5, -1 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5, -Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, -2 / Math.sqrt( 3 ) ),
      new Vector2( -0.5, -Math.sqrt( 3 ) / 2 ),
      new Vector2( -0.5, -1 / ( 2 * Math.sqrt( 3 ) ) )
    ],
    [
      new Vector2( -0.5, 5 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0, Math.sqrt( 3 ) ),
      new Vector2( 0.5, 5 / ( 2 * Math.sqrt( 3 ) ) ),
      new Vector2( 0.5, Math.sqrt( 3 ) / 2 ),
      new Vector2( 0, 1 / Math.sqrt( 3 ) ),
      new Vector2( -0.5, Math.sqrt( 3 ) / 2 )
    ]
  ],
  translation: new Vector2( 3, Math.sqrt( 3 ) )
};

export const periodicTilings: PeriodicBoardTiling[] = [
  squareTiling,
  hexagonalTiling,
  triangularTiling,
  trihexagonalTiling,
  smallRhombitrihexagonalTiling,
  truncatedSquareTiling,
  snubSquareTiling,
  truncatedHexagonalTiling,
  elongatedTriangularTiling,
  greatRhombitrihexagonalTiling,
  snubHexagonalTiling,
  rhombilleTiling,
  deltoidalTrihexagonalTiling,
  tetrakisSquareTiling,
  cairoPentagonalTiling,
  triakisTriangularTiling,
  prismaticPentagonalTiling,
  bisectedHexagonalTiling,
  floretPentagonalTiling,
  portugalTiling,
  falseCubicTiling,
  trihexAndHexTiling
];

export interface PenroseTiling {
  name: string;
  thinShape: Shape;
  thickShape: Shape;
}

export const penrose6: PenroseTiling = {
  name: 'Penrose6',
  thinShape: new Shape( 'M726,577 L759,475 L672,538 L640,640 Z M726,702 L640,640 L672,741 L759,804 Z M500,538 L414,475 L447,577 L533,640 Z M500,538 L533,437 L566,538 L533,640 Z M500,741 L533,640 L566,741 L533,842 Z M500,741 L533,640 L447,702 L414,804 Z M619,374 L726,374 L640,437 L533,437 Z M619,374 L726,374 L640,311 L533,311 Z M447,374 L360,311 L327,210 L414,272 Z M447,374 L340,374 L254,311 L360,311 Z M726,374 L759,272 L845,210 L812,311 Z M726,374 L832,374 L919,311 L812,311 Z M1005,374 L919,311 L952,413 L1038,475 Z M1005,374 L1038,272 L1071,374 L1038,475 Z M845,210 L759,147 L726,46 L812,108 Z M812,108 L919,108 L832,46 L726,46 Z M533,108 L639,108 L726,46 L619,46 Z M533,311 L566,210 L533,108 L500,210 Z M414,147 L447,46 L360,108 L327,210 Z M134,475 L167,374 L134,272 L101,374 Z M221,413 L254,311 L167,374 L134,475 Z M101,577 L134,475 L48,538 L15,640 Z M188,640 L221,538 L254,640 L221,741 Z M101,702 L15,640 L48,741 L134,804 Z M134,804 L101,905 L134,1007 L167,905 Z M221,866 L134,804 L167,905 L254,968 Z M414,1132 L327,1069 L360,1171 L447,1233 Z M447,905 L414,1007 L327,1069 L360,968 Z M447,905 L340,905 L254,968 L360,968 Z M414,804 L307,804 L221,741 L327,741 Z M533,968 L500,1069 L533,1171 L566,1069 Z M619,905 L726,905 L640,968 L533,968 Z M619,905 L726,905 L640,842 L533,842 Z M726,905 L812,968 L845,1069 L759,1007 Z M726,905 L832,905 L919,968 L812,968 Z M1038,804 L1071,702 L1157,639 L1124,741 Z M1038,804 L1145,804 L1231,741 L1124,741 Z M1005,905 L1038,804 L1071,905 L1038,1007 Z M1005,905 L1038,804 L952,866 L919,968 Z M1038,475 L1124,538 L1157,639 L1071,577 Z M1038,475 L1145,475 L1231,538 L1124,538 Z M919,640 L952,538 L985,640 L952,741 Z M845,538 L952,538 L865,475 L759,475 Z M845,741 L952,741 L865,804 L759,804 Z M845,1069 L812,1171 L726,1233 L759,1132 Z M812,1171 L919,1171 L832,1233 L726,1233 Z M533,1171 L640,1171 L726,1233 L619,1233 Z M414,475 L307,475 L221,538 L327,538 Z ' ),
  thickShape: new Shape( 'M533,640 L447,577 L360,640 L447,702 Z M533,640 L640,640 L672,741 L566,741 Z M533,640 L640,640 L672,538 L566,538 Z M500,538 L533,437 L447,374 L414,475 Z M500,741 L414,804 L447,905 L533,842 Z M533,437 L640,437 L672,538 L566,538 Z M619,374 L533,311 L447,374 L533,437 Z M726,374 L640,437 L672,538 L759,475 Z M726,374 L759,272 L672,210 L640,311 Z M726,374 L832,374 L865,475 L759,475 Z M812,311 L919,311 L952,210 L845,210 Z M759,272 L672,210 L759,147 L845,210 Z M832,374 L919,311 L952,413 L865,475 Z M1005,374 L1038,272 L952,210 L919,311 Z M1038,272 L1145,272 L1178,374 L1071,374 Z M845,210 L952,210 L919,108 L812,108 Z M672,210 L759,147 L726,46 L639,108 Z M566,210 L672,210 L639,108 L533,108 Z M533,311 L447,374 L414,272 L500,210 Z M533,311 L640,311 L672,210 L566,210 Z M500,210 L414,147 L327,210 L414,272 Z M500,210 L533,108 L447,46 L414,147 Z M360,311 L254,311 L221,210 L327,210 Z M254,311 L167,374 L134,272 L221,210 Z M188,640 L101,702 L134,804 L221,741 Z M188,640 L101,577 L15,640 L101,702 Z M188,640 L221,538 L134,475 L101,577 Z M254,968 L221,1069 L134,1007 L167,905 Z M360,968 L254,968 L221,1069 L327,1069 Z M414,804 L447,702 L360,640 L327,741 Z M414,804 L307,804 L340,905 L447,905 Z M533,842 L640,842 L672,741 L566,741 Z M533,968 L500,1069 L414,1007 L447,905 Z M533,968 L640,968 L672,1069 L566,1069 Z M307,804 L221,866 L254,968 L340,905 Z M307,804 L221,741 L134,804 L221,866 Z M566,1069 L672,1069 L640,1171 L533,1171 Z M619,905 L533,842 L447,905 L533,968 Z M500,1069 L414,1132 L447,1233 L533,1171 Z M500,1069 L414,1007 L327,1069 L414,1132 Z M672,1069 L640,1171 L726,1233 L759,1132 Z M726,905 L640,968 L672,1069 L759,1007 Z M726,905 L759,804 L672,741 L640,842 Z M726,905 L832,905 L865,804 L759,804 Z M759,1007 L845,1069 L759,1132 L672,1069 Z M812,968 L919,968 L952,1069 L845,1069 Z M832,905 L865,804 L952,866 L919,968 Z M952,741 L1038,804 L952,866 L865,804 Z M952,741 L985,640 L1071,702 L1038,804 Z M1038,804 L1145,804 L1178,905 L1071,905 Z M1124,741 L1231,741 L1264,639 L1157,639 Z M1005,905 L919,968 L952,1069 L1038,1007 Z M1124,538 L1231,538 L1264,639 L1157,639 Z M1038,475 L1145,475 L1178,374 L1071,374 Z M985,640 L1071,702 L1157,639 L1071,577 Z M952,538 L1038,475 L1071,577 L985,640 Z M952,538 L865,475 L952,413 L1038,475 Z M812,640 L726,702 L759,804 L845,741 Z M812,640 L726,577 L640,640 L726,702 Z M812,640 L845,538 L759,475 L726,577 Z M812,640 L919,640 L952,741 L845,741 Z M812,640 L919,640 L952,538 L845,538 Z M1038,1007 L1145,1007 L1178,905 L1071,905 Z M845,1069 L952,1069 L919,1171 L812,1171 Z M327,741 L221,741 L254,640 L360,640 Z M327,538 L221,538 L254,640 L360,640 Z M414,475 L327,538 L360,640 L447,577 Z M414,475 L307,475 L340,374 L447,374 Z M307,475 L221,413 L134,475 L221,538 Z M307,475 L340,374 L254,311 L221,413 Z ' )
};

export const penrose10: PenroseTiling = {
  name: 'Penrose10',
  thinShape: new Shape( 'M691,602 L711,541 L659,579 L640,640 Z M691,677 L640,640 L659,700 L711,738 Z M556,579 L504,541 L524,602 L576,640 Z M556,579 L576,518 L595,579 L576,640 Z M556,700 L576,640 L595,700 L576,761 Z M556,700 L576,640 L524,677 L504,738 Z M627,480 L691,480 L640,518 L576,518 Z M627,480 L691,480 L640,443 L576,443 Z M524,480 L472,443 L452,382 L504,419 Z M524,480 L460,480 L408,443 L472,443 Z M691,480 L711,419 L763,382 L743,443 Z M691,480 L755,480 L807,443 L743,443 Z M859,480 L807,443 L827,503 L879,541 Z M859,480 L879,419 L898,480 L879,541 Z M807,321 L827,260 L879,222 L859,283 Z M879,344 L898,283 L879,222 L859,283 Z M879,419 L943,419 L994,382 L930,382 Z M763,382 L711,344 L691,283 L743,321 Z M743,321 L807,321 L755,283 L691,283 Z M576,321 L640,321 L691,283 L627,283 Z M576,443 L595,382 L576,321 L556,382 Z M504,344 L524,283 L472,321 L452,382 Z M524,283 L460,283 L408,321 L472,321 Z M504,222 L524,161 L575,124 L556,185 Z M504,222 L440,222 L388,185 L452,185 Z M576,246 L595,185 L575,124 L556,185 Z M408,321 L356,283 L336,222 L388,260 Z M336,419 L272,419 L221,382 L285,382 Z M336,344 L356,283 L336,222 L317,283 Z M336,344 L272,344 L221,382 L285,382 Z M253,283 L272,222 L221,260 L201,321 Z M221,382 L157,382 L105,419 L169,419 Z M201,443 L221,382 L169,419 L149,480 Z M65,541 L85,480 L33,518 L14,579 Z M221,579 L169,541 L149,480 L201,518 Z M336,541 L356,480 L336,419 L317,480 Z M336,541 L272,541 L221,579 L285,579 Z M388,503 L408,443 L356,480 L336,541 Z M317,602 L336,541 L285,579 L265,640 Z M368,640 L388,579 L408,640 L388,700 Z M317,677 L265,640 L285,700 L336,738 Z M336,738 L317,799 L336,860 L356,799 Z M336,738 L272,738 L221,700 L285,700 Z M388,776 L336,738 L356,799 L408,836 Z M221,700 L201,761 L149,799 L169,738 Z M201,836 L149,799 L169,860 L221,897 Z M65,738 L14,700 L33,761 L85,799 Z M85,677 L65,738 L85,799 L105,738 Z M201,640 L137,640 L85,677 L149,677 Z M201,640 L137,640 L85,602 L149,602 Z M85,602 L105,541 L85,480 L65,541 Z M253,996 L201,958 L221,1019 L272,1057 Z M221,897 L157,897 L105,860 L169,860 Z M336,860 L272,860 L221,897 L285,897 Z M336,935 L317,996 L336,1057 L356,996 Z M336,935 L272,935 L221,897 L285,897 Z M388,1094 L368,1155 L388,1216 L408,1155 Z M368,1155 L317,1118 L336,1178 L388,1216 Z M576,1155 L556,1216 L504,1254 L524,1193 Z M640,1155 L691,1193 L711,1254 L659,1216 Z M711,1057 L691,1118 L640,1155 L659,1094 Z M711,1057 L775,1057 L827,1094 L763,1094 Z M827,1094 L807,1155 L827,1216 L847,1155 Z M763,1216 L827,1216 L775,1254 L711,1254 Z M898,1118 L879,1178 L827,1216 L847,1155 Z M898,1118 L962,1118 L1014,1155 L950,1155 Z M943,1057 L994,1094 L1014,1155 L962,1118 Z M1014,958 L994,1019 L943,1057 L962,996 Z M1014,958 L1078,958 L1130,996 L1066,996 Z M994,897 L1014,836 L1066,799 L1046,860 Z M994,897 L1058,897 L1110,860 L1046,860 Z M879,935 L859,996 L879,1057 L898,996 Z M930,897 L994,897 L943,935 L879,935 Z M807,958 L859,996 L879,1057 L827,1019 Z M743,958 L807,958 L755,996 L691,996 Z M763,897 L743,958 L691,996 L711,935 Z M691,799 L743,836 L763,897 L711,860 Z M691,799 L755,799 L807,836 L743,836 Z M576,836 L556,897 L576,958 L595,897 Z M576,958 L640,958 L691,996 L627,996 Z M524,996 L460,996 L408,958 L472,958 Z M627,996 L691,996 L640,1033 L576,1033 Z M576,1033 L556,1094 L576,1155 L595,1094 Z M504,935 L452,897 L472,958 L524,996 Z M504,1057 L556,1094 L576,1155 L524,1118 Z M504,1057 L440,1057 L388,1094 L452,1094 Z M408,958 L388,1019 L336,1057 L356,996 Z M524,799 L504,860 L452,897 L472,836 Z M524,799 L460,799 L408,836 L472,836 Z M504,738 L440,738 L388,700 L452,700 Z M504,541 L440,541 L388,579 L452,579 Z M627,799 L691,799 L640,836 L576,836 Z M627,799 L691,799 L640,761 L576,761 Z M879,738 L898,677 L950,640 L930,700 Z M879,738 L943,738 L994,700 L930,700 Z M859,799 L879,738 L898,799 L879,860 Z M859,799 L879,738 L827,776 L807,836 Z M994,700 L1046,738 L1066,799 L1014,761 Z M1014,640 L1078,640 L1130,602 L1066,602 Z M1014,640 L1078,640 L1130,677 L1066,677 Z M994,579 L1014,518 L1066,480 L1046,541 Z M1110,738 L1130,677 L1150,738 L1130,799 Z M1130,799 L1150,738 L1201,700 L1182,761 Z M1110,860 L1162,897 L1182,958 L1130,921 Z M1162,897 L1182,836 L1201,897 L1182,958 Z M1130,480 L1182,518 L1201,579 L1150,541 Z M1110,419 L1130,358 L1182,321 L1162,382 Z M1110,541 L1130,480 L1150,541 L1130,602 Z M994,382 L1046,419 L1066,480 L1014,443 Z M994,382 L1058,382 L1110,419 L1046,419 Z M879,541 L930,579 L950,640 L898,602 Z M879,541 L943,541 L994,579 L930,579 Z M807,640 L827,579 L847,640 L827,700 Z M763,579 L827,579 L775,541 L711,541 Z M763,700 L827,700 L775,738 L711,738 Z M1014,321 L962,283 L943,222 L994,260 Z M1014,321 L1078,321 L1130,283 L1066,283 Z M930,382 L994,382 L943,344 L879,344 Z M1162,382 L1182,321 L1201,382 L1182,443 Z M943,222 L962,161 L1014,124 L994,185 Z M898,161 L847,124 L827,63 L879,101 Z M898,161 L962,161 L1014,124 L950,124 Z M827,185 L847,124 L827,63 L807,124 Z M711,222 L659,185 L639,124 L691,161 Z M711,222 L775,222 L827,185 L763,185 Z M639,124 L659,63 L711,25 L691,86 Z M575,124 L524,86 L504,25 L556,63 Z M763,63 L827,63 L775,25 L711,25 Z M388,185 L408,124 L388,63 L368,124 Z M368,124 L388,63 L336,101 L317,161 Z M879,860 L943,860 L994,897 L930,897 Z M627,283 L691,283 L640,246 L576,246 Z ' ),
  thickShape: new Shape( 'M576,640 L524,602 L472,640 L524,677 Z M576,640 L640,640 L659,700 L595,700 Z M576,640 L640,640 L659,579 L595,579 Z M556,579 L576,518 L524,480 L504,541 Z M556,700 L504,738 L524,799 L576,761 Z M576,518 L640,518 L659,579 L595,579 Z M627,480 L576,443 L524,480 L576,518 Z M691,480 L640,518 L659,579 L711,541 Z M691,480 L711,419 L659,382 L640,443 Z M691,480 L755,480 L775,541 L711,541 Z M743,443 L807,443 L827,382 L763,382 Z M711,419 L659,382 L711,344 L763,382 Z M755,480 L807,443 L827,503 L775,541 Z M859,480 L879,419 L827,382 L807,443 Z M827,382 L879,344 L859,283 L807,321 Z M807,321 L827,260 L775,222 L755,283 Z M879,344 L943,344 L962,283 L898,283 Z M879,419 L827,382 L879,344 L930,382 Z M879,419 L943,419 L962,480 L898,480 Z M763,382 L827,382 L807,321 L743,321 Z M691,283 L711,222 L659,185 L640,246 Z M691,283 L755,283 L775,222 L711,222 Z M659,382 L711,344 L691,283 L640,321 Z M595,382 L659,382 L640,321 L576,321 Z M576,321 L524,283 L576,246 L627,283 Z M576,443 L524,480 L504,419 L556,382 Z M576,443 L640,443 L659,382 L595,382 Z M556,382 L504,344 L452,382 L504,419 Z M556,382 L576,321 L524,283 L504,344 Z M452,382 L388,382 L408,321 L472,321 Z M524,283 L576,246 L556,185 L504,222 Z M524,283 L460,283 L440,222 L504,222 Z M504,222 L524,161 L472,124 L452,185 Z M576,246 L640,246 L659,185 L595,185 Z M460,283 L408,321 L388,260 L440,222 Z M440,222 L388,185 L336,222 L388,260 Z M388,382 L336,344 L285,382 L336,419 Z M388,382 L408,321 L356,283 L336,344 Z M408,443 L356,480 L336,419 L388,382 Z M336,344 L272,344 L253,283 L317,283 Z M317,283 L253,283 L272,222 L336,222 Z M272,344 L221,382 L201,321 L253,283 Z M221,382 L157,382 L137,321 L201,321 Z M201,321 L221,260 L169,222 L149,283 Z M157,382 L105,419 L85,358 L137,321 Z M149,480 L85,480 L105,419 L169,419 Z M169,541 L105,541 L85,480 L149,480 Z M253,480 L201,443 L149,480 L201,518 Z M253,480 L272,419 L221,382 L201,443 Z M272,541 L221,579 L201,518 L253,480 Z M317,480 L253,480 L272,419 L336,419 Z M336,541 L272,541 L253,480 L317,480 Z M265,640 L201,640 L221,700 L285,700 Z M265,640 L201,640 L221,579 L285,579 Z M368,640 L317,677 L336,738 L388,700 Z M368,640 L317,602 L265,640 L317,677 Z M368,640 L388,579 L336,541 L317,602 Z M336,738 L272,738 L253,799 L317,799 Z M317,799 L253,799 L272,860 L336,860 Z M272,738 L253,799 L201,761 L221,700 Z M253,799 L201,836 L221,897 L272,860 Z M253,799 L201,761 L149,799 L201,836 Z M149,799 L85,799 L105,860 L169,860 Z M169,738 L105,738 L85,799 L149,799 Z M85,677 L65,738 L14,700 L33,640 Z M137,640 L85,602 L33,640 L85,677 Z M149,677 L85,677 L105,738 L169,738 Z M201,640 L149,677 L169,738 L221,700 Z M201,640 L221,579 L169,541 L149,602 Z M149,602 L85,602 L105,541 L169,541 Z M85,602 L33,640 L14,579 L65,541 Z M157,897 L137,958 L85,921 L105,860 Z M201,958 L149,996 L169,1057 L221,1019 Z M221,897 L157,897 L137,958 L201,958 Z M272,935 L253,996 L201,958 L221,897 Z M336,935 L272,935 L253,996 L317,996 Z M388,897 L336,935 L356,996 L408,958 Z M388,897 L336,860 L285,897 L336,935 Z M317,996 L253,996 L272,1057 L336,1057 Z M336,1057 L272,1057 L253,1118 L317,1118 Z M388,1094 L368,1155 L317,1118 L336,1057 Z M272,1057 L221,1019 L169,1057 L221,1094 Z M472,1155 L452,1216 L504,1254 L524,1193 Z M472,1155 L408,1155 L388,1216 L452,1216 Z M452,1094 L388,1094 L408,1155 L472,1155 Z M524,1118 L576,1155 L524,1193 L472,1155 Z M576,1155 L640,1155 L659,1216 L595,1216 Z M595,1094 L659,1094 L640,1155 L576,1155 Z M691,1118 L743,1155 L691,1193 L640,1155 Z M711,1057 L691,1118 L743,1155 L763,1094 Z M691,996 L640,1033 L659,1094 L711,1057 Z M691,996 L755,996 L775,1057 L711,1057 Z M763,1094 L827,1094 L807,1155 L743,1155 Z M827,1019 L879,1057 L827,1094 L775,1057 Z M879,1057 L827,1094 L847,1155 L898,1118 Z M879,1057 L943,1057 L962,1118 L898,1118 Z M743,1155 L691,1193 L711,1254 L763,1216 Z M743,1155 L807,1155 L827,1216 L763,1216 Z M994,1019 L1046,1057 L994,1094 L943,1057 Z M1066,996 L1130,996 L1110,1057 L1046,1057 Z M1078,958 L1130,996 L1182,958 L1130,921 Z M1058,897 L1110,860 L1130,921 L1078,958 Z M1014,958 L994,1019 L1046,1057 L1066,996 Z M994,897 L943,935 L962,996 L1014,958 Z M994,897 L1058,897 L1078,958 L1014,958 Z M898,996 L962,996 L943,1057 L879,1057 Z M879,935 L943,935 L962,996 L898,996 Z M827,897 L807,958 L859,996 L879,935 Z M807,958 L755,996 L775,1057 L827,1019 Z M763,897 L827,897 L807,958 L743,958 Z M743,836 L807,836 L827,897 L763,897 Z M711,860 L763,897 L711,935 L659,897 Z M691,799 L640,836 L659,897 L711,860 Z M691,799 L711,738 L659,700 L640,761 Z M691,799 L755,799 L775,738 L711,738 Z M659,897 L640,958 L691,996 L711,935 Z M595,897 L659,897 L640,958 L576,958 Z M576,836 L556,897 L504,860 L524,799 Z M576,836 L640,836 L659,897 L595,897 Z M576,958 L627,996 L576,1033 L524,996 Z M556,897 L504,935 L524,996 L576,958 Z M556,897 L504,860 L452,897 L504,935 Z M524,996 L504,1057 L556,1094 L576,1033 Z M524,996 L460,996 L440,1057 L504,1057 Z M576,1033 L640,1033 L659,1094 L595,1094 Z M504,1057 L452,1094 L472,1155 L524,1118 Z M460,996 L440,1057 L388,1019 L408,958 Z M440,1057 L388,1019 L336,1057 L388,1094 Z M452,897 L388,897 L408,958 L472,958 Z M472,836 L408,836 L388,897 L452,897 Z M408,836 L388,897 L336,860 L356,799 Z M440,738 L388,776 L408,836 L460,799 Z M440,738 L388,700 L336,738 L388,776 Z M504,738 L524,677 L472,640 L452,700 Z M504,738 L440,738 L460,799 L524,799 Z M452,700 L388,700 L408,640 L472,640 Z M452,579 L388,579 L408,640 L472,640 Z M504,541 L452,579 L472,640 L524,602 Z M504,541 L440,541 L460,480 L524,480 Z M440,541 L388,503 L336,541 L388,579 Z M440,541 L460,480 L408,443 L388,503 Z M576,761 L640,761 L659,700 L595,700 Z M627,799 L576,761 L524,799 L576,836 Z M755,799 L775,738 L827,776 L807,836 Z M827,700 L879,738 L827,776 L775,738 Z M827,700 L847,640 L898,677 L879,738 Z M879,738 L943,738 L962,799 L898,799 Z M930,700 L994,700 L1014,640 L950,640 Z M859,799 L807,836 L827,897 L879,860 Z M943,738 L994,700 L1014,761 L962,799 Z M962,799 L1014,836 L1066,799 L1014,761 Z M994,700 L1014,640 L1066,677 L1046,738 Z M1046,738 L1110,738 L1130,799 L1066,799 Z M1046,738 L1110,738 L1130,677 L1066,677 Z M994,579 L1046,541 L1066,602 L1014,640 Z M1078,640 L1130,677 L1182,640 L1130,602 Z M1130,602 L1150,541 L1201,579 L1182,640 Z M1130,677 L1182,640 L1201,700 L1150,738 Z M1182,640 L1246,640 L1265,700 L1201,700 Z M1182,640 L1246,640 L1265,579 L1201,579 Z M1130,799 L1182,836 L1233,799 L1182,761 Z M1182,761 L1201,700 L1253,738 L1233,799 Z M1110,860 L1130,799 L1182,836 L1162,897 Z M1046,860 L1110,860 L1130,799 L1066,799 Z M1182,518 L1233,480 L1253,541 L1201,579 Z M1130,480 L1182,518 L1233,480 L1182,443 Z M1110,419 L1162,382 L1182,443 L1130,480 Z M1046,419 L1110,419 L1130,480 L1066,480 Z M1046,541 L1110,541 L1130,602 L1066,602 Z M1046,541 L1110,541 L1130,480 L1066,480 Z M994,382 L1014,321 L962,283 L943,344 Z M994,382 L1058,382 L1078,321 L1014,321 Z M962,480 L1014,518 L1066,480 L1014,443 Z M943,419 L994,382 L1014,443 L962,480 Z M943,541 L962,480 L1014,518 L994,579 Z M879,541 L943,541 L962,480 L898,480 Z M827,579 L879,541 L898,602 L847,640 Z M827,579 L775,541 L827,503 L879,541 Z M930,579 L994,579 L1014,640 L950,640 Z M847,640 L898,677 L950,640 L898,602 Z M743,640 L691,677 L711,738 L763,700 Z M743,640 L691,602 L640,640 L691,677 Z M743,640 L763,579 L711,541 L691,602 Z M743,640 L807,640 L827,700 L763,700 Z M743,640 L807,640 L827,579 L763,579 Z M1014,321 L1066,283 L1046,222 L994,260 Z M1058,382 L1078,321 L1130,358 L1110,419 Z M1078,321 L1130,358 L1182,321 L1130,283 Z M1066,283 L1130,283 L1110,222 L1046,222 Z M994,260 L943,222 L994,185 L1046,222 Z M879,222 L898,161 L847,124 L827,185 Z M879,222 L943,222 L962,161 L898,161 Z M898,283 L962,283 L943,222 L879,222 Z M827,260 L775,222 L827,185 L879,222 Z M763,185 L827,185 L807,124 L743,124 Z M743,124 L763,63 L711,25 L691,86 Z M743,124 L807,124 L827,63 L763,63 Z M711,222 L763,185 L743,124 L691,161 Z M691,161 L639,124 L691,86 L743,124 Z M595,185 L659,185 L639,124 L575,124 Z M575,124 L639,124 L659,63 L595,63 Z M524,161 L472,124 L524,86 L575,124 Z M472,124 L524,86 L504,25 L452,63 Z M472,124 L408,124 L388,63 L452,63 Z M452,185 L388,185 L408,124 L472,124 Z M388,185 L336,222 L317,161 L368,124 Z M336,222 L272,222 L253,161 L317,161 Z M272,222 L221,185 L169,222 L221,260 Z M943,860 L962,799 L1014,836 L994,897 Z M879,860 L930,897 L879,935 L827,897 Z M879,860 L943,860 L962,799 L898,799 Z M472,443 L408,443 L388,382 L452,382 Z ' )
};

export const penrose11: PenroseTiling = {
  name: 'Penrose11',
  thinShape: new Shape( 'M687,605 L705,550 L657,584 L640,640 Z M687,674 L640,640 L657,695 L705,729 Z M563,584 L516,550 L534,605 L581,640 Z M563,584 L581,529 L599,584 L581,640 Z M563,695 L581,640 L599,695 L581,750 Z M563,695 L581,640 L534,674 L516,729 Z M628,495 L687,495 L640,529 L581,529 Z M628,495 L687,495 L640,460 L581,460 Z M534,495 L487,460 L469,405 L516,439 Z M534,495 L476,495 L429,460 L487,460 Z M687,495 L705,439 L752,405 L734,460 Z M687,495 L745,495 L792,460 L734,460 Z M839,495 L792,460 L810,516 L857,550 Z M839,495 L857,439 L875,495 L857,550 Z M792,350 L810,294 L857,260 L839,316 Z M857,371 L875,316 L857,260 L839,316 Z M857,439 L915,439 L962,405 L904,405 Z M752,405 L705,371 L687,316 L734,350 Z M734,350 L792,350 L745,316 L687,316 Z M581,350 L640,350 L687,316 L628,316 Z M581,460 L599,405 L581,350 L563,405 Z M516,371 L534,316 L487,350 L469,405 Z M534,316 L476,316 L429,350 L487,350 Z M516,260 L534,205 L581,171 L563,226 Z M516,260 L458,260 L411,226 L469,226 Z M581,281 L599,226 L581,171 L563,226 Z M429,350 L382,316 L364,260 L411,294 Z M364,439 L306,439 L259,405 L317,405 Z M364,371 L382,316 L364,260 L346,316 Z M364,371 L306,371 L259,405 L317,405 Z M288,316 L306,260 L259,294 L241,350 Z M259,405 L201,405 L153,439 L212,439 Z M241,350 L183,350 L135,316 L194,316 Z M241,460 L259,405 L212,439 L194,495 Z M153,439 L106,405 L88,350 L135,384 Z M88,460 L106,405 L88,350 L70,405 Z M117,550 L135,495 L88,529 L70,584 Z M259,584 L212,550 L194,495 L241,529 Z M364,550 L382,495 L364,439 L346,495 Z M364,550 L306,550 L259,584 L317,584 Z M411,516 L429,460 L382,495 L364,550 Z M346,605 L364,550 L317,584 L299,640 Z M393,640 L411,584 L429,640 L411,695 Z M346,674 L299,640 L317,695 L364,729 Z M364,729 L346,784 L364,840 L382,784 Z M364,729 L306,729 L259,695 L317,695 Z M411,763 L364,729 L382,784 L429,819 Z M259,695 L241,750 L194,784 L212,729 Z M241,819 L194,784 L212,840 L259,874 Z M117,729 L70,695 L88,750 L135,784 Z M153,840 L135,895 L88,929 L106,874 Z M88,819 L70,874 L88,929 L106,874 Z M135,674 L117,729 L135,784 L153,729 Z M241,640 L183,640 L135,674 L194,674 Z M241,640 L183,640 L135,605 L194,605 Z M135,605 L153,550 L135,495 L117,550 Z M241,929 L183,929 L135,963 L194,963 Z M288,963 L241,929 L259,985 L306,1019 Z M259,874 L201,874 L153,840 L212,840 Z M364,840 L306,840 L259,874 L317,874 Z M364,908 L346,963 L364,1019 L382,963 Z M364,908 L306,908 L259,874 L317,874 Z M411,1053 L393,1108 L411,1164 L429,1108 Z M346,1074 L288,1074 L241,1108 L299,1108 Z M306,1019 L288,1074 L241,1108 L259,1053 Z M411,1164 L458,1198 L476,1253 L429,1219 Z M393,1108 L346,1074 L364,1129 L411,1164 Z M469,1164 L411,1164 L458,1198 L516,1198 Z M581,1108 L563,1164 L581,1219 L599,1164 Z M581,1108 L563,1164 L516,1198 L534,1142 Z M640,1108 L687,1142 L705,1198 L657,1164 Z M705,1019 L687,1074 L640,1108 L657,1053 Z M705,1019 L763,1019 L810,1053 L752,1053 Z M810,1053 L792,1108 L810,1164 L828,1108 Z M810,1164 L792,1219 L745,1253 L763,1198 Z M752,1164 L810,1164 L763,1198 L705,1198 Z M581,1219 L640,1219 L687,1253 L628,1253 Z M904,1164 L962,1164 L915,1198 L857,1198 Z M1027,1074 L1085,1074 L1038,1108 L980,1108 Z M1085,963 L1067,1019 L1085,1074 L1103,1019 Z M1114,874 L1132,819 L1150,874 L1132,929 Z M1132,819 L1191,819 L1238,784 L1179,784 Z M1085,784 L1103,729 L1150,695 L1132,750 Z M1067,729 L1085,674 L1103,729 L1085,784 Z M1067,840 L1114,874 L1132,929 L1085,895 Z M962,874 L980,819 L1027,784 L1009,840 Z M962,874 L1020,874 L1067,840 L1009,840 Z M980,929 L962,985 L915,1019 L933,963 Z M980,929 L1038,929 L1085,963 L1027,963 Z M904,874 L962,874 L915,908 L857,908 Z M857,908 L839,963 L857,1019 L875,963 Z M857,840 L915,840 L962,874 L904,874 Z M839,784 L857,729 L875,784 L857,840 Z M839,784 L857,729 L810,763 L792,819 Z M857,729 L875,674 L922,640 L904,695 Z M857,729 L915,729 L962,695 L904,695 Z M962,695 L1009,729 L1027,784 L980,750 Z M980,640 L1038,640 L1085,605 L1027,605 Z M980,640 L1038,640 L1085,674 L1027,674 Z M857,550 L904,584 L922,640 L875,605 Z M857,550 L915,550 L962,584 L904,584 Z M792,640 L810,584 L828,640 L810,695 Z M752,695 L810,695 L763,729 L705,729 Z M687,784 L734,819 L752,874 L705,840 Z M687,784 L745,784 L792,819 L734,819 Z M628,784 L687,784 L640,819 L581,819 Z M628,784 L687,784 L640,750 L581,750 Z M581,819 L563,874 L581,929 L599,874 Z M534,784 L516,840 L469,874 L487,819 Z M534,784 L476,784 L429,819 L487,819 Z M516,729 L458,729 L411,695 L469,695 Z M581,929 L640,929 L687,963 L628,963 Z M516,908 L469,874 L487,929 L534,963 Z M534,963 L476,963 L429,929 L487,929 Z M581,998 L563,1053 L581,1108 L599,1053 Z M516,1019 L563,1053 L581,1108 L534,1074 Z M516,1019 L458,1019 L411,1053 L469,1053 Z M429,929 L411,985 L364,1019 L382,963 Z M628,963 L687,963 L640,998 L581,998 Z M752,874 L734,929 L687,963 L705,908 Z M734,929 L792,929 L745,963 L687,963 Z M792,929 L839,963 L857,1019 L810,985 Z M516,550 L458,550 L411,584 L469,584 Z M752,584 L810,584 L763,550 L705,550 Z M962,584 L980,529 L1027,495 L1009,550 Z M1085,495 L1132,529 L1150,584 L1103,550 Z M1067,439 L1085,384 L1132,350 L1114,405 Z M1132,460 L1191,460 L1238,495 L1179,495 Z M1067,550 L1085,495 L1103,550 L1085,605 Z M1150,695 L1209,695 L1256,729 L1197,729 Z M1150,584 L1209,584 L1256,550 L1197,550 Z M1191,640 L1238,674 L1256,729 L1209,695 Z M1191,640 L1209,584 L1256,550 L1238,605 Z M1085,316 L1103,260 L1085,205 L1067,260 Z M1114,405 L1132,350 L1150,405 L1132,460 Z M1027,205 L1085,205 L1038,171 L980,171 Z M915,260 L933,205 L980,171 L962,226 Z M810,226 L828,171 L810,115 L792,171 Z M875,205 L828,171 L810,115 L857,150 Z M875,205 L933,205 L980,171 L922,171 Z M810,115 L763,81 L745,26 L792,60 Z M752,115 L810,115 L763,81 L705,81 Z M639,171 L657,115 L705,81 L687,137 Z M581,171 L534,137 L516,81 L563,115 Z M581,171 L599,115 L581,60 L563,115 Z M581,60 L639,60 L687,26 L628,26 Z M411,115 L429,60 L476,26 L458,81 Z M393,171 L411,115 L364,150 L346,205 Z M469,115 L411,115 L458,81 L516,81 Z M411,226 L429,171 L411,115 L393,171 Z M346,205 L288,205 L241,171 L299,171 Z M306,260 L259,226 L241,171 L288,205 Z M705,260 L657,226 L639,171 L687,205 Z M705,260 L763,260 L810,226 L752,226 Z M904,115 L962,115 L915,81 L857,81 Z M980,350 L933,316 L915,260 L962,294 Z M980,350 L1038,350 L1085,316 L1027,316 Z M962,405 L1009,439 L1027,495 L980,460 Z M962,405 L1020,405 L1067,439 L1009,439 Z M904,405 L962,405 L915,371 L857,371 Z M915,1019 L962,1053 L980,1108 L933,1074 Z M875,1074 L857,1129 L810,1164 L828,1108 Z M875,1074 L933,1074 L980,1108 L922,1108 Z M628,316 L687,316 L640,281 L581,281 Z ' ),
  thickShape: new Shape( 'M581,640 L534,605 L487,640 L534,674 Z M581,640 L640,640 L657,695 L599,695 Z M581,640 L640,640 L657,584 L599,584 Z M563,584 L581,529 L534,495 L516,550 Z M563,695 L516,729 L534,784 L581,750 Z M581,529 L640,529 L657,584 L599,584 Z M628,495 L581,460 L534,495 L581,529 Z M687,495 L640,529 L657,584 L705,550 Z M687,495 L705,439 L657,405 L640,460 Z M687,495 L745,495 L763,550 L705,550 Z M734,460 L792,460 L810,405 L752,405 Z M705,439 L657,405 L705,371 L752,405 Z M745,495 L792,460 L810,516 L763,550 Z M839,495 L857,439 L810,405 L792,460 Z M810,405 L857,371 L839,316 L792,350 Z M792,350 L810,294 L763,260 L745,316 Z M857,371 L915,371 L933,316 L875,316 Z M857,439 L810,405 L857,371 L904,405 Z M857,439 L915,439 L933,495 L875,495 Z M752,405 L810,405 L792,350 L734,350 Z M687,316 L705,260 L657,226 L640,281 Z M687,316 L745,316 L763,260 L705,260 Z M657,405 L705,371 L687,316 L640,350 Z M599,405 L657,405 L640,350 L581,350 Z M581,350 L534,316 L581,281 L628,316 Z M581,460 L534,495 L516,439 L563,405 Z M581,460 L640,460 L657,405 L599,405 Z M563,405 L516,371 L469,405 L516,439 Z M563,405 L581,350 L534,316 L516,371 Z M469,405 L411,405 L429,350 L487,350 Z M534,316 L581,281 L563,226 L516,260 Z M534,316 L476,316 L458,260 L516,260 Z M516,260 L534,205 L487,171 L469,226 Z M581,281 L640,281 L657,226 L599,226 Z M476,316 L429,350 L411,294 L458,260 Z M458,260 L411,226 L364,260 L411,294 Z M411,405 L364,371 L317,405 L364,439 Z M411,405 L429,350 L382,316 L364,371 Z M429,460 L382,495 L364,439 L411,405 Z M364,371 L306,371 L288,316 L346,316 Z M346,316 L288,316 L306,260 L364,260 Z M306,371 L259,405 L241,350 L288,316 Z M259,405 L201,405 L183,350 L241,350 Z M241,350 L259,294 L212,260 L194,316 Z M201,405 L153,439 L135,384 L183,350 Z M183,350 L135,316 L88,350 L135,384 Z M135,495 L88,460 L41,495 L88,529 Z M135,495 L153,439 L106,405 L88,460 Z M194,495 L135,495 L153,439 L212,439 Z M212,550 L153,550 L135,495 L194,495 Z M288,495 L241,460 L194,495 L241,529 Z M288,495 L306,439 L259,405 L241,460 Z M306,550 L259,584 L241,529 L288,495 Z M346,495 L288,495 L306,439 L364,439 Z M364,550 L306,550 L288,495 L346,495 Z M299,640 L241,640 L259,695 L317,695 Z M299,640 L241,640 L259,584 L317,584 Z M393,640 L346,674 L364,729 L411,695 Z M393,640 L346,605 L299,640 L346,674 Z M393,640 L411,584 L364,550 L346,605 Z M364,729 L306,729 L288,784 L346,784 Z M346,784 L288,784 L306,840 L364,840 Z M306,729 L288,784 L241,750 L259,695 Z M288,784 L241,819 L259,874 L306,840 Z M288,784 L241,750 L194,784 L241,819 Z M194,784 L135,784 L153,840 L212,840 Z M212,729 L153,729 L135,784 L194,784 Z M135,784 L88,819 L106,874 L153,840 Z M135,784 L88,750 L41,784 L88,819 Z M135,674 L117,729 L70,695 L88,640 Z M183,640 L135,605 L88,640 L135,674 Z M88,640 L30,640 L12,584 L70,584 Z M88,640 L30,640 L12,695 L70,695 Z M194,674 L135,674 L153,729 L212,729 Z M241,640 L194,674 L212,729 L259,695 Z M241,640 L259,584 L212,550 L194,605 Z M194,605 L135,605 L153,550 L212,550 Z M135,605 L88,640 L70,584 L117,550 Z M70,584 L88,529 L41,495 L23,550 Z M70,695 L23,729 L41,784 L88,750 Z M183,929 L135,895 L88,929 L135,963 Z M194,963 L135,963 L153,1019 L212,1019 Z M241,929 L194,963 L212,1019 L259,985 Z M259,874 L201,874 L183,929 L241,929 Z M306,908 L288,963 L241,929 L259,874 Z M201,874 L183,929 L135,895 L153,840 Z M364,908 L306,908 L288,963 L346,963 Z M411,874 L364,908 L382,963 L429,929 Z M411,874 L364,840 L317,874 L364,908 Z M346,963 L288,963 L306,1019 L364,1019 Z M364,1019 L306,1019 L288,1074 L346,1074 Z M411,1053 L393,1108 L346,1074 L364,1019 Z M346,1074 L299,1108 L317,1164 L364,1129 Z M306,1019 L259,985 L212,1019 L259,1053 Z M259,1053 L241,1108 L194,1074 L212,1019 Z M411,1164 L364,1129 L317,1164 L364,1198 Z M516,1198 L458,1198 L476,1253 L534,1253 Z M487,1108 L469,1164 L516,1198 L534,1142 Z M487,1108 L429,1108 L411,1164 L469,1164 Z M469,1053 L411,1053 L429,1108 L487,1108 Z M534,1074 L581,1108 L534,1142 L487,1108 Z M581,1108 L640,1108 L657,1164 L599,1164 Z M599,1164 L657,1164 L640,1219 L581,1219 Z M563,1164 L516,1198 L534,1253 L581,1219 Z M599,1053 L657,1053 L640,1108 L581,1108 Z M657,1164 L640,1219 L687,1253 L705,1198 Z M687,1074 L734,1108 L687,1142 L640,1108 Z M705,1019 L687,1074 L734,1108 L752,1053 Z M687,963 L640,998 L657,1053 L705,1019 Z M687,963 L745,963 L763,1019 L705,1019 Z M752,1053 L810,1053 L792,1108 L734,1108 Z M810,985 L857,1019 L810,1053 L763,1019 Z M857,1019 L810,1053 L828,1108 L875,1074 Z M857,1019 L915,1019 L933,1074 L875,1074 Z M734,1108 L687,1142 L705,1198 L752,1164 Z M734,1108 L792,1108 L810,1164 L752,1164 Z M705,1198 L763,1198 L745,1253 L687,1253 Z M857,1129 L904,1164 L857,1198 L810,1164 Z M922,1108 L980,1108 L962,1164 L904,1164 Z M1085,963 L1132,929 L1150,985 L1103,1019 Z M1132,929 L1191,929 L1209,874 L1150,874 Z M1132,819 L1191,819 L1209,874 L1150,874 Z M1179,784 L1238,784 L1256,729 L1197,729 Z M1085,784 L1132,819 L1179,784 L1132,750 Z M1132,750 L1150,695 L1197,729 L1179,784 Z M1067,840 L1085,784 L1132,819 L1114,874 Z M1009,729 L1067,729 L1085,784 L1027,784 Z M1009,729 L1067,729 L1085,674 L1027,674 Z M1009,840 L1067,840 L1085,784 L1027,784 Z M962,874 L915,908 L933,963 L980,929 Z M962,874 L1020,874 L1038,929 L980,929 Z M980,929 L962,985 L1009,1019 L1027,963 Z M915,840 L933,784 L980,819 L962,874 Z M1020,874 L1067,840 L1085,895 L1038,929 Z M1038,929 L1085,963 L1132,929 L1085,895 Z M857,908 L915,908 L933,963 L875,963 Z M857,840 L904,874 L857,908 L810,874 Z M857,840 L915,840 L933,784 L875,784 Z M839,784 L792,819 L810,874 L857,840 Z M810,874 L792,929 L839,963 L857,908 Z M857,729 L915,729 L933,784 L875,784 Z M933,784 L980,819 L1027,784 L980,750 Z M915,729 L962,695 L980,750 L933,784 Z M962,695 L980,640 L1027,674 L1009,729 Z M904,695 L962,695 L980,640 L922,640 Z M904,584 L962,584 L980,640 L922,640 Z M857,550 L915,550 L933,495 L875,495 Z M828,640 L875,674 L922,640 L875,605 Z M810,584 L857,550 L875,605 L828,640 Z M810,584 L763,550 L810,516 L857,550 Z M810,695 L857,729 L810,763 L763,729 Z M810,695 L828,640 L875,674 L857,729 Z M734,640 L687,674 L705,729 L752,695 Z M734,640 L687,605 L640,640 L687,674 Z M734,640 L752,584 L705,550 L687,605 Z M734,640 L792,640 L810,695 L752,695 Z M734,640 L792,640 L810,584 L752,584 Z M687,784 L640,819 L657,874 L705,840 Z M687,784 L705,729 L657,695 L640,750 Z M687,784 L745,784 L763,729 L705,729 Z M705,840 L752,874 L705,908 L657,874 Z M734,819 L792,819 L810,874 L752,874 Z M628,784 L581,750 L534,784 L581,819 Z M745,784 L763,729 L810,763 L792,819 Z M581,819 L563,874 L516,840 L534,784 Z M581,819 L640,819 L657,874 L599,874 Z M581,750 L640,750 L657,695 L599,695 Z M516,729 L534,674 L487,640 L469,695 Z M516,729 L458,729 L476,784 L534,784 Z M487,819 L429,819 L411,874 L469,874 Z M458,729 L411,763 L429,819 L476,784 Z M458,729 L411,695 L364,729 L411,763 Z M429,819 L411,874 L364,840 L382,784 Z M469,874 L411,874 L429,929 L487,929 Z M563,874 L516,908 L534,963 L581,929 Z M563,874 L516,840 L469,874 L516,908 Z M581,929 L628,963 L581,998 L534,963 Z M534,963 L516,1019 L563,1053 L581,998 Z M534,963 L476,963 L458,1019 L516,1019 Z M581,998 L640,998 L657,1053 L599,1053 Z M516,1019 L469,1053 L487,1108 L534,1074 Z M476,963 L458,1019 L411,985 L429,929 Z M458,1019 L411,985 L364,1019 L411,1053 Z M599,874 L657,874 L640,929 L581,929 Z M657,874 L640,929 L687,963 L705,908 Z M752,874 L810,874 L792,929 L734,929 Z M792,929 L745,963 L763,1019 L810,985 Z M469,695 L411,695 L429,640 L487,640 Z M469,584 L411,584 L429,640 L487,640 Z M516,550 L469,584 L487,640 L534,605 Z M516,550 L458,550 L476,495 L534,495 Z M458,550 L411,516 L364,550 L411,584 Z M458,550 L476,495 L429,460 L411,516 Z M915,550 L933,495 L980,529 L962,584 Z M962,584 L1009,550 L1027,605 L980,640 Z M933,495 L980,529 L1027,495 L980,460 Z M915,439 L962,405 L980,460 L933,495 Z M1009,439 L1067,439 L1085,495 L1027,495 Z M1009,550 L1067,550 L1085,605 L1027,605 Z M1009,550 L1067,550 L1085,495 L1027,495 Z M1085,495 L1132,529 L1179,495 L1132,460 Z M1067,439 L1114,405 L1132,460 L1085,495 Z M1132,460 L1191,460 L1209,405 L1150,405 Z M1132,529 L1179,495 L1197,550 L1150,584 Z M1085,605 L1103,550 L1150,584 L1132,640 Z M1038,640 L1085,674 L1132,640 L1085,605 Z M1132,640 L1191,640 L1209,695 L1150,695 Z M1132,640 L1191,640 L1209,584 L1150,584 Z M1085,674 L1132,640 L1150,695 L1103,729 Z M1179,495 L1238,495 L1256,550 L1197,550 Z M1132,350 L1191,350 L1209,405 L1150,405 Z M1085,316 L1103,260 L1150,294 L1132,350 Z M1009,260 L1027,205 L980,171 L962,226 Z M1009,260 L1067,260 L1085,205 L1027,205 Z M1027,316 L1085,316 L1067,260 L1009,260 Z M962,294 L915,260 L962,226 L1009,260 Z M857,260 L875,205 L828,171 L810,226 Z M857,260 L915,260 L933,205 L875,205 Z M875,316 L933,316 L915,260 L857,260 Z M810,294 L763,260 L810,226 L857,260 Z M875,205 L922,171 L904,115 L857,150 Z M857,150 L810,115 L857,81 L904,115 Z M922,171 L980,171 L962,115 L904,115 Z M705,81 L763,81 L745,26 L687,26 Z M734,171 L752,115 L705,81 L687,137 Z M734,171 L792,171 L810,115 L752,115 Z M752,226 L810,226 L792,171 L734,171 Z M687,205 L639,171 L687,137 L734,171 Z M657,115 L705,81 L687,26 L639,60 Z M581,171 L639,171 L657,115 L599,115 Z M563,115 L581,60 L534,26 L516,81 Z M599,226 L657,226 L639,171 L581,171 Z M534,205 L487,171 L534,137 L581,171 Z M599,115 L657,115 L639,60 L581,60 Z M516,81 L458,81 L476,26 L534,26 Z M411,115 L364,81 L317,115 L364,150 Z M487,171 L534,137 L516,81 L469,115 Z M487,171 L429,171 L411,115 L469,115 Z M469,226 L411,226 L429,171 L487,171 Z M411,226 L364,260 L346,205 L393,171 Z M364,260 L306,260 L288,205 L346,205 Z M346,205 L364,150 L317,115 L299,171 Z M306,260 L259,226 L212,260 L259,294 Z M259,226 L212,260 L194,205 L241,171 Z M194,316 L135,316 L153,260 L212,260 Z M705,260 L752,226 L734,171 L687,205 Z M980,350 L1027,316 L1009,260 L962,294 Z M962,405 L980,350 L933,316 L915,371 Z M962,405 L1020,405 L1038,350 L980,350 Z M1020,405 L1038,350 L1085,384 L1067,439 Z M1038,350 L1085,384 L1132,350 L1085,316 Z M875,963 L933,963 L915,1019 L857,1019 Z M962,985 L1009,1019 L962,1053 L915,1019 Z M1009,1019 L962,1053 L980,1108 L1027,1074 Z M1009,1019 L1067,1019 L1085,1074 L1027,1074 Z M1027,963 L1085,963 L1067,1019 L1009,1019 Z M875,1074 L857,1129 L904,1164 L922,1108 Z M487,460 L429,460 L411,405 L469,405 Z ' )
};

export const penrose13: PenroseTiling = {
  name: 'Penrose13',
  thinShape: new Shape( 'M679,611 L695,564 L655,593 L640,640 Z M679,668 L640,640 L655,686 L695,715 Z M575,593 L535,564 L550,611 L590,640 Z M575,593 L590,546 L605,593 L590,640 Z M575,686 L590,640 L605,686 L590,733 Z M575,686 L590,640 L550,668 L535,715 Z M630,517 L679,517 L640,546 L590,546 Z M630,517 L679,517 L640,488 L590,488 Z M550,517 L511,488 L495,441 L535,470 Z M550,517 L501,517 L461,488 L511,488 Z M679,517 L695,470 L734,441 L719,488 Z M679,517 L729,517 L768,488 L719,488 Z M808,517 L768,488 L784,535 L823,564 Z M808,517 L823,470 L839,517 L823,564 Z M768,394 L784,348 L823,319 L808,365 Z M823,412 L839,365 L823,319 L808,365 Z M823,470 L873,470 L912,441 L863,441 Z M734,441 L695,412 L679,365 L719,394 Z M719,394 L768,394 L729,365 L679,365 Z M590,394 L640,394 L679,365 L630,365 Z M590,488 L605,441 L590,394 L575,441 Z M535,412 L550,365 L511,394 L495,441 Z M550,365 L501,365 L461,394 L511,394 Z M535,319 L550,272 L590,243 L575,290 Z M535,319 L486,319 L446,290 L495,290 Z M590,336 L605,290 L590,243 L575,290 Z M461,394 L422,365 L406,319 L446,348 Z M406,470 L357,470 L317,441 L367,441 Z M406,412 L422,365 L406,319 L391,365 Z M406,412 L357,412 L317,441 L367,441 Z M342,365 L357,319 L317,348 L302,394 Z M317,441 L268,441 L228,470 L277,470 Z M302,394 L253,394 L213,365 L262,365 Z M302,488 L317,441 L277,470 L262,517 Z M228,470 L188,441 L173,394 L213,423 Z M173,488 L188,441 L173,394 L158,441 Z M173,488 L124,488 L84,517 L133,517 Z M198,564 L213,517 L173,546 L158,593 Z M317,593 L277,564 L262,517 L302,546 Z M406,564 L422,517 L406,470 L391,517 Z M406,564 L357,564 L317,593 L367,593 Z M446,535 L461,488 L422,517 L406,564 Z M391,611 L406,564 L367,593 L351,640 Z M431,640 L446,593 L461,640 L446,686 Z M391,668 L351,640 L367,686 L406,715 Z M406,715 L391,762 L406,809 L422,762 Z M406,715 L357,715 L317,686 L367,686 Z M446,744 L406,715 L422,762 L461,791 Z M317,686 L302,733 L262,762 L277,715 Z M302,791 L262,762 L277,809 L317,838 Z M198,715 L158,686 L173,733 L213,762 Z M228,809 L213,856 L173,885 L188,838 Z M173,791 L158,838 L173,885 L188,838 Z M173,791 L124,791 L84,762 L133,762 Z M213,668 L198,715 L213,762 L228,715 Z M302,640 L253,640 L213,668 L262,668 Z M302,640 L253,640 L213,611 L262,611 Z M213,611 L228,564 L213,517 L198,564 Z M158,593 L109,593 L69,564 L118,564 Z M158,686 L109,686 L69,715 L118,715 Z M124,640 L84,611 L69,564 L109,593 Z M124,640 L109,686 L69,715 L84,668 Z M44,640 L29,686 L14,640 L29,593 Z M173,394 L133,365 L118,319 L158,348 Z M173,394 L124,394 L84,365 L133,365 Z M213,365 L228,319 L213,272 L198,319 Z M158,290 L173,243 L133,272 L118,319 Z M302,243 L253,243 L213,272 L262,272 Z M302,243 L253,243 L213,214 L262,214 Z M391,272 L342,272 L302,243 L351,243 Z M406,167 L422,120 L406,73 L391,120 Z M406,167 L357,167 L317,196 L367,196 Z M446,196 L461,149 L501,120 L486,167 Z M431,243 L446,196 L406,225 L391,272 Z M495,196 L446,196 L486,167 L535,167 Z M535,73 L486,73 L446,44 L495,44 Z M590,149 L639,149 L679,120 L630,120 Z M501,120 L461,91 L446,44 L486,73 Z M630,120 L679,120 L639,91 L590,91 Z M695,73 L744,73 L784,44 L734,44 Z M729,120 L744,73 L784,44 L768,91 Z M912,196 L928,149 L968,120 L952,167 Z M823,167 L839,120 L823,73 L808,120 Z M784,196 L744,167 L729,120 L768,149 Z M863,196 L912,196 L873,167 L823,167 Z M839,272 L799,243 L784,196 L823,225 Z M839,272 L888,272 L928,243 L878,243 Z M928,243 L977,243 L1017,214 L968,214 Z M873,319 L888,272 L928,243 L912,290 Z M928,394 L888,365 L873,319 L912,348 Z M928,394 L977,394 L1017,365 L968,365 Z M968,272 L1017,272 L977,243 L928,243 Z M1017,365 L1032,319 L1017,272 L1002,319 Z M1057,243 L1106,243 L1146,272 L1096,272 Z M1072,290 L1112,319 L1096,272 L1057,243 Z M1146,365 L1185,394 L1201,441 L1161,412 Z M1057,394 L1072,348 L1112,319 L1096,365 Z M1057,394 L1106,394 L1146,365 L1096,365 Z M1041,441 L1057,394 L1072,441 L1057,488 Z M1146,517 L1161,470 L1201,441 L1185,488 Z M1057,488 L1106,488 L1146,517 L1096,517 Z M1017,517 L1057,546 L1072,593 L1032,564 Z M1072,593 L1121,593 L1161,564 L1112,564 Z M1106,640 L1146,668 L1161,715 L1121,686 Z M1106,640 L1121,593 L1161,564 L1146,611 Z M1185,640 L1201,593 L1216,640 L1201,686 Z M1185,488 L1201,441 L1216,488 L1201,535 Z M1185,394 L1201,348 L1216,394 L1201,441 Z M1185,791 L1201,744 L1216,791 L1201,838 Z M1146,762 L1185,791 L1201,838 L1161,809 Z M1057,791 L1106,791 L1146,762 L1096,762 Z M1072,686 L1121,686 L1161,715 L1112,715 Z M1017,762 L1032,715 L1072,686 L1057,733 Z M1002,715 L1017,668 L1032,715 L1017,762 Z M1002,809 L1041,838 L1057,885 L1017,856 Z M912,838 L928,791 L968,762 L952,809 Z M912,838 L962,838 L1002,809 L952,809 Z M928,885 L912,931 L873,960 L888,914 Z M928,885 L977,885 L1017,914 L968,914 Z M863,838 L912,838 L873,867 L823,867 Z M1017,914 L1002,960 L1017,1007 L1032,960 Z M1057,885 L1096,914 L1112,960 L1072,931 Z M1057,885 L1106,885 L1146,914 L1096,914 Z M968,1007 L1017,1007 L977,1036 L928,1036 Z M873,960 L912,989 L928,1036 L888,1007 Z M839,1007 L823,1054 L784,1083 L799,1036 Z M839,1007 L888,1007 L928,1036 L878,1036 Z M784,989 L768,1036 L784,1083 L799,1036 Z M823,867 L808,914 L823,960 L839,914 Z M823,809 L873,809 L912,838 L863,838 Z M768,885 L808,914 L823,960 L784,931 Z M734,838 L719,885 L679,914 L695,867 Z M719,885 L768,885 L729,914 L679,914 Z M695,960 L679,1007 L640,1036 L655,989 Z M695,960 L744,960 L784,989 L734,989 Z M630,914 L679,914 L640,943 L590,943 Z M590,943 L575,989 L590,1036 L605,989 Z M590,885 L640,885 L679,914 L630,914 Z M550,914 L501,914 L461,885 L511,885 Z M590,791 L575,838 L590,885 L605,838 Z M679,762 L719,791 L734,838 L695,809 Z M679,762 L729,762 L768,791 L719,791 Z M630,762 L679,762 L640,791 L590,791 Z M630,762 L679,762 L640,733 L590,733 Z M823,715 L839,668 L878,640 L863,686 Z M823,715 L873,715 L912,686 L863,686 Z M808,762 L823,715 L839,762 L823,809 Z M808,762 L823,715 L784,744 L768,791 Z M912,686 L952,715 L968,762 L928,733 Z M928,640 L977,640 L1017,611 L968,611 Z M928,640 L977,640 L1017,668 L968,668 Z M912,593 L928,546 L968,517 L952,564 Z M1002,564 L1017,517 L1032,564 L1017,611 Z M912,441 L952,470 L968,517 L928,488 Z M912,441 L962,441 L1002,470 L952,470 Z M823,564 L863,593 L878,640 L839,611 Z M823,564 L873,564 L912,593 L863,593 Z M768,640 L784,593 L799,640 L784,686 Z M734,593 L784,593 L744,564 L695,564 Z M734,686 L784,686 L744,715 L695,715 Z M863,441 L912,441 L873,412 L823,412 Z M1002,470 L1017,423 L1057,394 L1041,441 Z M550,762 L535,809 L495,838 L511,791 Z M550,762 L501,762 L461,791 L511,791 Z M535,715 L486,715 L446,686 L495,686 Z M461,885 L446,931 L406,960 L422,914 Z M406,867 L391,914 L406,960 L422,914 Z M406,867 L357,867 L317,838 L367,838 Z M406,809 L357,809 L317,838 L367,838 Z M535,867 L495,838 L511,885 L550,914 Z M317,838 L268,838 L228,809 L277,809 Z M302,885 L253,885 L213,914 L262,914 Z M213,914 L198,960 L213,1007 L228,960 Z M173,885 L158,931 L118,960 L133,914 Z M173,885 L124,885 L84,914 L133,914 Z M158,989 L118,960 L133,1007 L173,1036 Z M302,1036 L253,1036 L213,1065 L262,1065 Z M302,1036 L253,1036 L213,1007 L262,1007 Z M391,1007 L342,1007 L302,1036 L351,1036 Z M431,1036 L391,1007 L406,1054 L446,1083 Z M446,989 L431,1036 L446,1083 L461,1036 Z M357,960 L342,1007 L302,1036 L317,989 Z M342,914 L302,885 L317,931 L357,960 Z M535,960 L575,989 L590,1036 L550,1007 Z M535,960 L486,960 L446,989 L495,989 Z M590,1036 L575,1083 L590,1130 L605,1083 Z M590,1036 L575,1083 L535,1112 L550,1065 Z M640,1036 L679,1065 L695,1112 L655,1083 Z M734,1083 L784,1083 L744,1112 L695,1112 Z M784,1083 L768,1130 L729,1159 L744,1112 Z M823,1112 L808,1159 L823,1206 L839,1159 Z M729,1159 L768,1188 L784,1235 L744,1206 Z M695,1206 L744,1206 L784,1235 L734,1235 Z M630,1159 L679,1159 L640,1188 L590,1188 Z M535,1206 L486,1206 L446,1235 L495,1235 Z M501,1159 L486,1206 L446,1235 L461,1188 Z M446,1083 L486,1112 L501,1159 L461,1130 Z M406,1112 L391,1159 L406,1206 L422,1159 Z M406,1112 L357,1112 L317,1083 L367,1083 Z M495,1083 L446,1083 L486,1112 L535,1112 Z M590,1130 L640,1130 L679,1159 L630,1159 Z M912,1083 L952,1112 L968,1159 L928,1130 Z M1057,1036 L1106,1036 L1146,1007 L1096,1007 Z M928,1036 L977,1036 L1017,1065 L968,1065 Z M863,1083 L912,1083 L873,1112 L823,1112 Z M1072,989 L1057,1036 L1096,1007 L1112,960 Z M1146,914 L1161,867 L1201,838 L1185,885 Z M1185,885 L1201,838 L1216,885 L1201,931 Z M535,564 L486,564 L446,593 L495,593 Z M1041,838 L1057,791 L1072,838 L1057,885 Z M784,290 L799,243 L784,196 L768,243 Z M695,319 L655,290 L640,243 L679,272 Z M695,319 L744,319 L784,290 L734,290 Z M640,243 L655,196 L695,167 L679,214 Z M590,243 L550,214 L535,167 L575,196 Z M590,243 L605,196 L590,149 L575,196 Z M734,196 L784,196 L744,167 L695,167 Z M446,290 L461,243 L446,196 L431,243 Z M357,319 L317,290 L302,243 L342,272 Z M630,365 L679,365 L640,336 L590,336 Z ' ),
  thickShape: new Shape( 'M590,640 L550,611 L511,640 L550,668 Z M590,640 L640,640 L655,686 L605,686 Z M590,640 L640,640 L655,593 L605,593 Z M575,593 L590,546 L550,517 L535,564 Z M575,686 L535,715 L550,762 L590,733 Z M590,546 L640,546 L655,593 L605,593 Z M630,517 L590,488 L550,517 L590,546 Z M679,517 L640,546 L655,593 L695,564 Z M679,517 L695,470 L655,441 L640,488 Z M679,517 L729,517 L744,564 L695,564 Z M719,488 L768,488 L784,441 L734,441 Z M695,470 L655,441 L695,412 L734,441 Z M729,517 L768,488 L784,535 L744,564 Z M808,517 L823,470 L784,441 L768,488 Z M784,441 L823,412 L808,365 L768,394 Z M768,394 L784,348 L744,319 L729,365 Z M823,412 L873,412 L888,365 L839,365 Z M823,470 L784,441 L823,412 L863,441 Z M823,470 L873,470 L888,517 L839,517 Z M734,441 L784,441 L768,394 L719,394 Z M679,365 L695,319 L655,290 L640,336 Z M679,365 L729,365 L744,319 L695,319 Z M655,441 L695,412 L679,365 L640,394 Z M605,441 L655,441 L640,394 L590,394 Z M590,394 L550,365 L590,336 L630,365 Z M590,488 L550,517 L535,470 L575,441 Z M590,488 L640,488 L655,441 L605,441 Z M575,441 L535,412 L495,441 L535,470 Z M575,441 L590,394 L550,365 L535,412 Z M495,441 L446,441 L461,394 L511,394 Z M550,365 L590,336 L575,290 L535,319 Z M550,365 L501,365 L486,319 L535,319 Z M535,319 L550,272 L511,243 L495,290 Z M590,336 L640,336 L655,290 L605,290 Z M501,365 L461,394 L446,348 L486,319 Z M486,319 L446,290 L406,319 L446,348 Z M446,441 L406,412 L367,441 L406,470 Z M446,441 L461,394 L422,365 L406,412 Z M461,488 L422,517 L406,470 L446,441 Z M406,412 L357,412 L342,365 L391,365 Z M391,365 L342,365 L357,319 L406,319 Z M357,412 L317,441 L302,394 L342,365 Z M317,441 L268,441 L253,394 L302,394 Z M302,394 L317,348 L277,319 L262,365 Z M268,441 L228,470 L213,423 L253,394 Z M253,394 L213,365 L173,394 L213,423 Z M213,517 L173,488 L133,517 L173,546 Z M213,517 L228,470 L188,441 L173,488 Z M173,488 L124,488 L109,441 L158,441 Z M262,517 L213,517 L228,470 L277,470 Z M277,564 L228,564 L213,517 L262,517 Z M342,517 L302,488 L262,517 L302,546 Z M342,517 L357,470 L317,441 L302,488 Z M357,564 L317,593 L302,546 L342,517 Z M391,517 L342,517 L357,470 L406,470 Z M406,564 L357,564 L342,517 L391,517 Z M351,640 L302,640 L317,686 L367,686 Z M351,640 L302,640 L317,593 L367,593 Z M431,640 L391,668 L406,715 L446,686 Z M431,640 L391,611 L351,640 L391,668 Z M431,640 L446,593 L406,564 L391,611 Z M406,715 L357,715 L342,762 L391,762 Z M391,762 L342,762 L357,809 L406,809 Z M357,715 L342,762 L302,733 L317,686 Z M342,762 L302,791 L317,838 L357,809 Z M342,762 L302,733 L262,762 L302,791 Z M262,762 L213,762 L228,809 L277,809 Z M277,715 L228,715 L213,762 L262,762 Z M213,762 L173,791 L188,838 L228,809 Z M213,762 L173,733 L133,762 L173,791 Z M173,791 L124,791 L109,838 L158,838 Z M213,668 L198,715 L158,686 L173,640 Z M253,640 L213,611 L173,640 L213,668 Z M173,640 L124,640 L109,593 L158,593 Z M173,640 L124,640 L109,686 L158,686 Z M262,668 L213,668 L228,715 L277,715 Z M302,640 L262,668 L277,715 L317,686 Z M302,640 L317,593 L277,564 L262,611 Z M262,611 L213,611 L228,564 L277,564 Z M213,611 L173,640 L158,593 L198,564 Z M158,593 L173,546 L133,517 L118,564 Z M158,686 L118,715 L133,762 L173,733 Z M124,640 L84,611 L44,640 L84,668 Z M84,668 L69,715 L29,686 L44,640 Z M84,611 L44,640 L29,593 L69,564 Z M69,715 L29,744 L44,791 L84,762 Z M118,715 L69,715 L84,762 L133,762 Z M69,564 L84,517 L44,488 L29,535 Z M118,564 L69,564 L84,517 L133,517 Z M124,488 L84,517 L69,470 L109,441 Z M109,441 L124,394 L84,365 L69,412 Z M158,441 L109,441 L124,394 L173,394 Z M213,365 L173,394 L158,348 L198,319 Z M253,243 L213,214 L173,243 L213,272 Z M198,319 L158,290 L118,319 L158,348 Z M198,319 L213,272 L173,243 L158,290 Z M277,319 L228,319 L213,272 L262,272 Z M302,243 L317,196 L277,167 L262,214 Z M317,290 L277,319 L262,272 L302,243 Z M262,214 L213,214 L228,167 L277,167 Z M351,243 L302,243 L317,196 L367,196 Z M391,272 L406,225 L367,196 L351,243 Z M406,167 L357,167 L342,120 L391,120 Z M446,196 L406,167 L367,196 L406,225 Z M446,196 L461,149 L422,120 L406,167 Z M461,149 L422,120 L461,91 L501,120 Z M511,243 L550,214 L535,167 L495,196 Z M511,243 L461,243 L446,196 L495,196 Z M535,167 L486,167 L501,120 L550,120 Z M575,196 L590,149 L550,120 L535,167 Z M550,120 L590,91 L575,44 L535,73 Z M550,120 L501,120 L486,73 L535,73 Z M590,91 L639,91 L655,44 L605,44 Z M590,149 L550,120 L590,91 L630,120 Z M422,120 L461,91 L446,44 L406,73 Z M391,120 L342,120 L357,73 L406,73 Z M357,167 L317,196 L302,149 L342,120 Z M605,196 L655,196 L639,149 L590,149 Z M655,196 L695,167 L679,120 L639,149 Z M679,120 L695,73 L655,44 L639,91 Z M679,120 L729,120 L744,73 L695,73 Z M695,167 L744,167 L729,120 L679,120 Z M768,149 L729,120 L768,91 L808,120 Z M839,120 L888,120 L873,73 L823,73 Z M808,120 L823,73 L784,44 L768,91 Z M928,149 L888,120 L928,91 L968,120 Z M912,196 L928,149 L888,120 L873,167 Z M823,167 L873,167 L888,120 L839,120 Z M784,196 L823,167 L808,120 L768,149 Z M878,243 L928,243 L912,196 L863,196 Z M823,225 L784,196 L823,167 L863,196 Z M839,272 L878,243 L863,196 L823,225 Z M823,319 L839,272 L799,243 L784,290 Z M823,319 L873,319 L888,272 L839,272 Z M928,243 L968,214 L952,167 L912,196 Z M912,348 L873,319 L912,290 L952,319 Z M928,394 L968,365 L952,319 L912,348 Z M952,319 L968,272 L928,243 L912,290 Z M952,319 L1002,319 L1017,272 L968,272 Z M968,365 L1017,365 L1002,319 L952,319 Z M1017,365 L1032,319 L1072,348 L1057,394 Z M1017,272 L977,243 L1017,214 L1057,243 Z M1032,319 L1072,290 L1057,243 L1017,272 Z M1032,319 L1072,348 L1112,319 L1072,290 Z M1057,243 L1072,196 L1032,167 L1017,214 Z M968,214 L1017,214 L1002,167 L952,167 Z M1146,365 L1161,319 L1201,348 L1185,394 Z M1112,319 L1161,319 L1146,272 L1096,272 Z M1096,365 L1146,365 L1161,319 L1112,319 Z M1057,394 L1106,394 L1121,441 L1072,441 Z M1106,394 L1146,365 L1161,412 L1121,441 Z M1121,441 L1161,470 L1201,441 L1161,412 Z M1106,488 L1121,441 L1161,470 L1146,517 Z M1146,517 L1185,488 L1201,535 L1161,564 Z M1057,488 L1106,488 L1121,441 L1072,441 Z M1017,517 L1057,546 L1096,517 L1057,488 Z M1096,517 L1146,517 L1161,564 L1112,564 Z M1057,546 L1096,517 L1112,564 L1072,593 Z M1057,640 L1106,640 L1121,686 L1072,686 Z M1057,640 L1106,640 L1121,593 L1072,593 Z M1161,564 L1201,593 L1241,564 L1201,535 Z M1106,640 L1146,668 L1185,640 L1146,611 Z M1146,611 L1161,564 L1201,593 L1185,640 Z M1146,668 L1185,640 L1201,686 L1161,715 Z M1161,715 L1201,744 L1241,715 L1201,686 Z M1201,686 L1250,686 L1265,640 L1216,640 Z M1201,593 L1250,593 L1265,640 L1216,640 Z M1146,762 L1161,715 L1201,744 L1185,791 Z M1106,791 L1146,762 L1161,809 L1121,838 Z M1096,762 L1146,762 L1161,715 L1112,715 Z M1057,791 L1106,791 L1121,838 L1072,838 Z M1057,733 L1072,686 L1112,715 L1096,762 Z M1017,668 L1057,640 L1072,686 L1032,715 Z M1017,762 L1057,791 L1096,762 L1057,733 Z M1002,809 L1017,762 L1057,791 L1041,838 Z M952,715 L1002,715 L1017,762 L968,762 Z M952,715 L1002,715 L1017,668 L968,668 Z M952,809 L1002,809 L1017,762 L968,762 Z M912,838 L873,867 L888,914 L928,885 Z M912,838 L962,838 L977,885 L928,885 Z M928,885 L912,931 L952,960 L968,914 Z M873,809 L888,762 L928,791 L912,838 Z M962,838 L1002,809 L1017,856 L977,885 Z M977,885 L1017,914 L1057,885 L1017,856 Z M1017,914 L1057,885 L1072,931 L1032,960 Z M1032,960 L1072,989 L1112,960 L1072,931 Z M1032,960 L1017,1007 L1057,1036 L1072,989 Z M1057,885 L1106,885 L1121,838 L1072,838 Z M968,914 L1017,914 L1002,960 L952,960 Z M952,960 L912,989 L928,1036 L968,1007 Z M952,960 L1002,960 L1017,1007 L968,1007 Z M912,931 L952,960 L912,989 L873,960 Z M823,960 L784,989 L799,1036 L839,1007 Z M823,960 L873,960 L888,1007 L839,1007 Z M839,1007 L823,1054 L863,1083 L878,1036 Z M784,931 L823,960 L784,989 L744,960 Z M839,914 L888,914 L873,960 L823,960 Z M823,867 L873,867 L888,914 L839,914 Z M784,838 L768,885 L808,914 L823,867 Z M823,809 L863,838 L823,867 L784,838 Z M823,809 L873,809 L888,762 L839,762 Z M768,885 L729,914 L744,960 L784,931 Z M734,838 L784,838 L768,885 L719,885 Z M719,791 L768,791 L784,838 L734,838 Z M695,809 L734,838 L695,867 L655,838 Z M679,914 L640,943 L655,989 L695,960 Z M679,914 L729,914 L744,960 L695,960 Z M695,960 L679,1007 L719,1036 L734,989 Z M590,943 L640,943 L655,989 L605,989 Z M590,885 L630,914 L590,943 L550,914 Z M575,838 L535,867 L550,914 L590,885 Z M575,838 L535,809 L495,838 L535,867 Z M550,914 L535,960 L575,989 L590,943 Z M550,914 L501,914 L486,960 L535,960 Z M605,838 L655,838 L640,885 L590,885 Z M590,791 L575,838 L535,809 L550,762 Z M590,791 L640,791 L655,838 L605,838 Z M655,838 L640,885 L679,914 L695,867 Z M679,762 L640,791 L655,838 L695,809 Z M679,762 L695,715 L655,686 L640,733 Z M679,762 L729,762 L744,715 L695,715 Z M630,762 L590,733 L550,762 L590,791 Z M729,762 L744,715 L784,744 L768,791 Z M784,686 L823,715 L784,744 L744,715 Z M784,686 L799,640 L839,668 L823,715 Z M823,715 L873,715 L888,762 L839,762 Z M863,686 L912,686 L928,640 L878,640 Z M808,762 L768,791 L784,838 L823,809 Z M873,715 L912,686 L928,733 L888,762 Z M888,762 L928,791 L968,762 L928,733 Z M912,686 L928,640 L968,668 L952,715 Z M912,593 L952,564 L968,611 L928,640 Z M977,640 L1017,668 L1057,640 L1017,611 Z M1017,611 L1032,564 L1072,593 L1057,640 Z M952,564 L1002,564 L1017,611 L968,611 Z M952,564 L1002,564 L1017,517 L968,517 Z M952,470 L1002,470 L1017,517 L968,517 Z M912,441 L928,394 L888,365 L873,412 Z M912,441 L962,441 L977,394 L928,394 Z M888,517 L928,546 L968,517 L928,488 Z M873,470 L912,441 L928,488 L888,517 Z M873,564 L888,517 L928,546 L912,593 Z M823,564 L873,564 L888,517 L839,517 Z M784,593 L823,564 L839,611 L799,640 Z M784,593 L744,564 L784,535 L823,564 Z M863,593 L912,593 L928,640 L878,640 Z M799,640 L839,668 L878,640 L839,611 Z M719,640 L679,668 L695,715 L734,686 Z M719,640 L679,611 L640,640 L679,668 Z M719,640 L734,593 L695,564 L679,611 Z M719,640 L768,640 L784,686 L734,686 Z M719,640 L768,640 L784,593 L734,593 Z M962,441 L977,394 L1017,423 L1002,470 Z M1002,470 L1041,441 L1057,488 L1017,517 Z M977,394 L1017,423 L1057,394 L1017,365 Z M590,733 L640,733 L655,686 L605,686 Z M535,715 L550,668 L511,640 L495,686 Z M535,715 L486,715 L501,762 L550,762 Z M511,791 L461,791 L446,838 L495,838 Z M486,715 L446,744 L461,791 L501,762 Z M486,715 L446,686 L406,715 L446,744 Z M461,791 L446,838 L406,809 L422,762 Z M446,838 L406,867 L422,914 L461,885 Z M446,838 L406,809 L367,838 L406,867 Z M406,867 L357,867 L342,914 L391,914 Z M495,838 L446,838 L461,885 L511,885 Z M317,838 L268,838 L253,885 L302,885 Z M357,867 L342,914 L302,885 L317,838 Z M302,885 L262,914 L277,960 L317,931 Z M268,838 L253,885 L213,856 L228,809 Z M253,885 L213,856 L173,885 L213,914 Z M213,914 L198,960 L158,931 L173,885 Z M158,838 L109,838 L124,885 L173,885 Z M109,838 L69,867 L84,914 L124,885 Z M124,791 L109,838 L69,809 L84,762 Z M198,960 L158,989 L173,1036 L213,1007 Z M198,960 L158,931 L118,960 L158,989 Z M253,1036 L213,1007 L173,1036 L213,1065 Z M262,1065 L213,1065 L228,1112 L277,1112 Z M302,1036 L262,1065 L277,1112 L317,1083 Z M317,989 L302,1036 L262,1007 L277,960 Z M351,1036 L302,1036 L317,1083 L367,1083 Z M391,1007 L351,1036 L367,1083 L406,1054 Z M406,960 L357,960 L342,1007 L391,1007 Z M391,914 L342,914 L357,960 L406,960 Z M446,989 L431,1036 L391,1007 L406,960 Z M357,960 L317,931 L277,960 L317,989 Z M277,960 L228,960 L213,1007 L262,1007 Z M262,914 L213,914 L228,960 L277,960 Z M486,960 L446,931 L406,960 L446,989 Z M495,989 L446,989 L461,1036 L511,1036 Z M511,1036 L495,1083 L535,1112 L550,1065 Z M511,1036 L461,1036 L446,1083 L495,1083 Z M535,960 L495,989 L511,1036 L550,1007 Z M550,1007 L590,1036 L550,1065 L511,1036 Z M590,1036 L640,1036 L655,1083 L605,1083 Z M605,1083 L655,1083 L640,1130 L590,1130 Z M575,1083 L535,1112 L550,1159 L590,1130 Z M605,989 L655,989 L640,1036 L590,1036 Z M655,1083 L640,1130 L679,1159 L695,1112 Z M679,1007 L719,1036 L679,1065 L640,1036 Z M695,1112 L744,1112 L729,1159 L679,1159 Z M719,1036 L679,1065 L695,1112 L734,1083 Z M719,1036 L768,1036 L784,1083 L734,1083 Z M734,989 L784,989 L768,1036 L719,1036 Z M784,1083 L768,1130 L808,1159 L823,1112 Z M823,1054 L863,1083 L823,1112 L784,1083 Z M823,1112 L873,1112 L888,1159 L839,1159 Z M768,1130 L808,1159 L768,1188 L729,1159 Z M808,1159 L768,1188 L784,1235 L823,1206 Z M679,1159 L640,1188 L655,1235 L695,1206 Z M679,1159 L729,1159 L744,1206 L695,1206 Z M590,1188 L640,1188 L655,1235 L605,1235 Z M550,1159 L535,1206 L575,1235 L590,1188 Z M550,1159 L501,1159 L486,1206 L535,1206 Z M461,1130 L501,1159 L461,1188 L422,1159 Z M446,1083 L406,1112 L422,1159 L461,1130 Z M446,1083 L406,1054 L367,1083 L406,1112 Z M422,1159 L406,1206 L446,1235 L461,1188 Z M406,1112 L357,1112 L342,1159 L391,1159 Z M391,1159 L342,1159 L357,1206 L406,1206 Z M357,1112 L342,1159 L302,1130 L317,1083 Z M535,1112 L486,1112 L501,1159 L550,1159 Z M590,1130 L630,1159 L590,1188 L550,1159 Z M839,1159 L888,1159 L873,1206 L823,1206 Z M928,1130 L968,1159 L928,1188 L888,1159 Z M912,1083 L873,1112 L888,1159 L928,1130 Z M968,1065 L1017,1065 L1002,1112 L952,1112 Z M1057,1036 L1017,1065 L1032,1112 L1072,1083 Z M1017,1007 L1057,1036 L1017,1065 L977,1036 Z M928,1036 L912,1083 L952,1112 L968,1065 Z M878,1036 L928,1036 L912,1083 L863,1083 Z M1146,914 L1185,885 L1201,931 L1161,960 Z M1112,960 L1161,960 L1146,1007 L1096,1007 Z M1096,914 L1146,914 L1161,960 L1112,960 Z M1106,885 L1121,838 L1161,867 L1146,914 Z M1121,838 L1161,867 L1201,838 L1161,809 Z M501,914 L486,960 L446,931 L461,885 Z M495,686 L446,686 L461,640 L511,640 Z M495,593 L446,593 L461,640 L511,640 Z M535,564 L495,593 L511,640 L550,611 Z M535,564 L486,564 L501,517 L550,517 Z M486,564 L446,535 L406,564 L446,593 Z M486,564 L501,517 L461,488 L446,535 Z M839,365 L888,365 L873,319 L823,319 Z M784,348 L744,319 L784,290 L823,319 Z M734,290 L784,290 L768,243 L719,243 Z M719,243 L734,196 L695,167 L679,214 Z M719,243 L768,243 L784,196 L734,196 Z M695,319 L734,290 L719,243 L679,272 Z M679,272 L640,243 L679,214 L719,243 Z M605,290 L655,290 L640,243 L590,243 Z M590,243 L640,243 L655,196 L605,196 Z M550,272 L511,243 L550,214 L590,243 Z M495,290 L446,290 L461,243 L511,243 Z M446,290 L406,319 L391,272 L431,243 Z M406,319 L357,319 L342,272 L391,272 Z M357,319 L317,290 L277,319 L317,348 Z M262,365 L213,365 L228,319 L277,319 Z M511,488 L461,488 L446,441 L495,441 Z ' )
};

export const penrose14: PenroseTiling = {
  name: 'Penrose14',
  thinShape: new Shape( 'M676,613 L691,569 L654,596 L640,640 Z M676,666 L640,640 L654,683 L691,710 Z M580,596 L543,569 L557,613 L594,640 Z M580,596 L594,553 L608,596 L594,640 Z M580,683 L594,640 L608,683 L594,726 Z M580,683 L594,640 L557,666 L543,710 Z M631,526 L676,526 L640,553 L594,553 Z M631,526 L676,526 L640,499 L594,499 Z M557,526 L520,499 L506,455 L543,482 Z M557,526 L511,526 L474,499 L520,499 Z M676,526 L691,482 L728,455 L713,499 Z M676,526 L722,526 L759,499 L713,499 Z M796,526 L759,499 L773,542 L810,569 Z M796,526 L810,482 L824,526 L810,569 Z M759,412 L773,368 L810,342 L796,385 Z M810,428 L824,385 L810,342 L796,385 Z M810,482 L856,482 L893,455 L847,455 Z M728,455 L691,428 L676,385 L713,412 Z M713,412 L759,412 L722,385 L676,385 Z M594,412 L640,412 L676,385 L631,385 Z M594,499 L608,455 L594,412 L580,455 Z M543,428 L557,385 L520,412 L506,455 Z M557,385 L511,385 L474,412 L520,412 Z M543,342 L557,298 L594,271 L580,315 Z M543,342 L497,342 L460,315 L506,315 Z M594,358 L608,315 L594,271 L580,315 Z M474,412 L437,385 L423,342 L460,368 Z M423,482 L377,482 L340,455 L386,455 Z M423,428 L437,385 L423,342 L409,385 Z M423,428 L377,428 L340,455 L386,455 Z M363,385 L377,342 L340,368 L326,412 Z M340,455 L295,455 L258,482 L303,482 Z M326,412 L280,412 L243,385 L289,385 Z M326,499 L340,455 L303,482 L289,526 Z M258,482 L221,455 L206,412 L243,439 Z M206,499 L221,455 L206,412 L192,455 Z M206,499 L161,499 L124,526 L170,526 Z M229,569 L243,526 L206,553 L192,596 Z M340,596 L303,569 L289,526 L326,553 Z M423,569 L437,526 L423,482 L409,526 Z M423,569 L377,569 L340,596 L386,596 Z M460,542 L474,499 L437,526 L423,569 Z M409,613 L423,569 L386,596 L372,640 Z M446,640 L460,596 L474,640 L460,683 Z M409,666 L372,640 L386,683 L423,710 Z M423,710 L409,753 L423,797 L437,753 Z M423,710 L377,710 L340,683 L386,683 Z M460,737 L423,710 L437,753 L474,780 Z M340,683 L326,726 L289,753 L303,710 Z M326,780 L289,753 L303,797 L340,824 Z M229,710 L192,683 L206,726 L243,753 Z M258,797 L243,840 L206,867 L221,824 Z M206,780 L192,824 L206,867 L221,824 Z M206,780 L161,780 L124,753 L170,753 Z M243,666 L229,710 L243,753 L258,710 Z M326,640 L280,640 L243,666 L289,666 Z M326,640 L280,640 L243,613 L289,613 Z M243,613 L258,569 L243,526 L229,569 Z M192,596 L147,596 L110,569 L155,569 Z M192,683 L147,683 L110,710 L155,710 Z M161,640 L124,613 L110,569 L147,596 Z M161,640 L147,683 L110,710 L124,666 Z M124,753 L110,797 L73,824 L87,780 Z M73,737 L59,780 L73,824 L87,780 Z M87,640 L73,683 L59,640 L73,596 Z M73,542 L87,499 L73,455 L59,499 Z M73,455 L87,412 L73,368 L59,412 Z M124,526 L87,499 L73,455 L110,482 Z M110,428 L124,385 L87,412 L73,455 Z M206,412 L170,385 L155,342 L192,368 Z M206,412 L161,412 L124,385 L170,385 Z M243,385 L258,342 L243,298 L229,342 Z M206,271 L161,271 L124,298 L170,298 Z M243,244 L258,201 L243,157 L229,201 Z M192,315 L206,271 L170,298 L155,342 Z M326,271 L280,271 L243,298 L289,298 Z M326,271 L280,271 L243,244 L289,244 Z M340,228 L303,201 L289,157 L326,184 Z M409,298 L363,298 L326,271 L372,271 Z M423,201 L437,157 L423,114 L409,157 Z M423,201 L377,201 L340,228 L386,228 Z M460,228 L474,184 L511,157 L497,201 Z M446,271 L460,228 L423,255 L409,298 Z M506,228 L460,228 L497,201 L543,201 Z M543,114 L557,70 L594,44 L580,87 Z M543,114 L497,114 L460,87 L506,87 Z M594,130 L608,87 L594,44 L580,87 Z M594,184 L639,184 L676,157 L631,157 Z M511,157 L474,130 L460,87 L497,114 Z M423,114 L377,114 L340,87 L386,87 Z M326,130 L340,87 L303,114 L289,157 Z M229,201 L243,157 L206,184 L192,228 Z M691,114 L654,87 L639,44 L676,70 Z M691,114 L736,114 L773,87 L728,87 Z M810,114 L856,114 L893,87 L847,87 Z M722,157 L736,114 L773,87 L759,130 Z M810,201 L824,157 L810,114 L796,157 Z M773,228 L736,201 L722,157 L759,184 Z M728,228 L773,228 L736,201 L691,201 Z M640,271 L654,228 L691,201 L676,244 Z M594,271 L557,244 L543,201 L580,228 Z M594,271 L608,228 L594,184 L580,228 Z M631,157 L676,157 L639,130 L594,130 Z M691,342 L654,315 L640,271 L676,298 Z M691,342 L736,342 L773,315 L728,315 Z M773,315 L787,271 L773,228 L759,271 Z M824,298 L787,271 L773,228 L810,255 Z M824,298 L870,298 L907,271 L861,271 Z M856,342 L870,298 L907,271 L893,315 Z M907,271 L953,271 L990,244 L944,244 Z M893,228 L907,184 L944,157 L930,201 Z M944,298 L990,298 L953,271 L907,271 Z M990,244 L1004,201 L990,157 L976,201 Z M1027,271 L1073,271 L1109,298 L1064,298 Z M990,385 L1004,342 L990,298 L976,342 Z M907,412 L870,385 L856,342 L893,368 Z M907,412 L953,412 L990,385 L944,385 Z M893,455 L930,482 L944,526 L907,499 Z M893,455 L939,455 L976,482 L930,482 Z M976,482 L990,439 L1027,412 L1013,455 Z M990,526 L1027,553 L1041,596 L1004,569 Z M1013,455 L1027,412 L1041,455 L1027,499 Z M893,596 L907,553 L944,526 L930,569 Z M976,569 L990,526 L1004,569 L990,613 Z M1041,596 L1087,596 L1124,569 L1078,569 Z M1073,640 L1109,666 L1124,710 L1087,683 Z M1073,640 L1087,596 L1124,569 L1109,613 Z M1146,640 L1161,596 L1175,640 L1161,683 Z M1161,683 L1206,683 L1243,710 L1198,710 Z M1161,596 L1206,596 L1243,569 L1198,569 Z M1206,455 L1243,482 L1257,526 L1220,499 Z M1161,542 L1206,542 L1243,569 L1198,569 Z M1146,499 L1161,455 L1175,499 L1161,542 Z M1109,526 L1124,482 L1161,455 L1146,499 Z M1027,499 L1073,499 L1109,526 L1064,526 Z M1027,412 L1041,368 L1078,342 L1064,385 Z M1027,412 L1073,412 L1109,385 L1064,385 Z M1109,385 L1146,412 L1161,455 L1124,428 Z M1146,412 L1161,368 L1175,412 L1161,455 Z M1041,315 L1078,342 L1064,298 L1027,271 Z M1041,228 L1004,201 L990,157 L1027,184 Z M944,157 L907,130 L893,87 L930,114 Z M1161,737 L1206,737 L1243,710 L1198,710 Z M1146,780 L1161,737 L1175,780 L1161,824 Z M1109,753 L1146,780 L1161,824 L1124,797 Z M1027,780 L1073,780 L1109,753 L1064,753 Z M1041,683 L1087,683 L1124,710 L1078,710 Z M990,753 L1004,710 L1041,683 L1027,726 Z M976,710 L990,666 L1004,710 L990,753 Z M976,797 L1013,824 L1027,867 L990,840 Z M893,824 L907,780 L944,753 L930,797 Z M893,824 L939,824 L976,797 L930,797 Z M907,867 L893,911 L856,937 L870,894 Z M907,867 L953,867 L990,894 L944,894 Z M847,824 L893,824 L856,851 L810,851 Z M990,894 L976,937 L990,981 L1004,937 Z M1027,867 L1064,894 L1078,937 L1041,911 Z M1027,867 L1073,867 L1109,894 L1064,894 Z M944,981 L990,981 L953,1008 L907,1008 Z M856,937 L893,964 L907,1008 L870,981 Z M824,981 L810,1024 L773,1051 L787,1008 Z M824,981 L870,981 L907,1008 L861,1008 Z M773,964 L759,1008 L773,1051 L787,1008 Z M810,851 L796,894 L810,937 L824,894 Z M810,797 L856,797 L893,824 L847,824 Z M759,867 L796,894 L810,937 L773,911 Z M728,824 L713,867 L676,894 L691,851 Z M713,867 L759,867 L722,894 L676,894 Z M691,937 L676,981 L640,1008 L654,964 Z M691,937 L736,937 L773,964 L728,964 Z M631,894 L676,894 L640,921 L594,921 Z M594,921 L580,964 L594,1008 L608,964 Z M594,867 L640,867 L676,894 L631,894 Z M557,894 L511,894 L474,867 L520,867 Z M594,780 L580,824 L594,867 L608,824 Z M676,753 L713,780 L728,824 L691,797 Z M676,753 L722,753 L759,780 L713,780 Z M631,753 L676,753 L640,780 L594,780 Z M631,753 L676,753 L640,726 L594,726 Z M810,710 L824,666 L861,640 L847,683 Z M810,710 L856,710 L893,683 L847,683 Z M796,753 L810,710 L824,753 L810,797 Z M796,753 L810,710 L773,737 L759,780 Z M893,683 L930,710 L944,753 L907,726 Z M907,640 L953,640 L990,613 L944,613 Z M907,640 L953,640 L990,666 L944,666 Z M810,569 L847,596 L861,640 L824,613 Z M810,569 L856,569 L893,596 L847,596 Z M759,640 L773,596 L787,640 L773,683 Z M728,596 L773,596 L736,569 L691,569 Z M728,683 L773,683 L736,710 L691,710 Z M557,753 L543,797 L506,824 L520,780 Z M557,753 L511,753 L474,780 L520,780 Z M543,710 L497,710 L460,683 L506,683 Z M474,867 L460,911 L423,937 L437,894 Z M423,851 L409,894 L423,937 L437,894 Z M423,851 L377,851 L340,824 L386,824 Z M423,797 L377,797 L340,824 L386,824 Z M543,851 L506,824 L520,867 L557,894 Z M340,824 L295,824 L258,797 L303,797 Z M326,867 L280,867 L243,894 L289,894 Z M243,894 L229,937 L243,981 L258,937 Z M206,867 L192,911 L155,937 L170,894 Z M206,867 L161,867 L124,894 L170,894 Z M110,851 L73,824 L87,867 L124,894 Z M192,964 L155,937 L170,981 L206,1008 Z M206,1008 L161,1008 L124,981 L170,981 Z M326,1008 L280,1008 L243,1035 L289,1035 Z M326,1008 L280,1008 L243,981 L289,981 Z M377,937 L363,981 L326,1008 L340,964 Z M363,894 L326,867 L340,911 L377,937 Z M460,964 L446,1008 L460,1051 L474,1008 Z M409,981 L363,981 L326,1008 L372,1008 Z M446,1008 L409,981 L423,1024 L460,1051 Z M460,1051 L497,1078 L511,1122 L474,1095 Z M423,1078 L409,1122 L423,1165 L437,1122 Z M423,1078 L377,1078 L340,1051 L386,1051 Z M506,1051 L460,1051 L497,1078 L543,1078 Z M594,1008 L580,1051 L594,1095 L608,1051 Z M594,1008 L580,1051 L543,1078 L557,1035 Z M640,1008 L676,1035 L691,1078 L654,1051 Z M728,1051 L773,1051 L736,1078 L691,1078 Z M773,1051 L759,1095 L722,1122 L736,1078 Z M810,1078 L796,1122 L810,1165 L824,1122 Z M722,1122 L759,1149 L773,1192 L736,1165 Z M810,1165 L856,1165 L893,1192 L847,1192 Z M691,1165 L676,1209 L640,1235 L654,1192 Z M691,1165 L736,1165 L773,1192 L728,1192 Z M594,1149 L580,1192 L594,1235 L608,1192 Z M631,1122 L676,1122 L640,1149 L594,1149 Z M594,1095 L640,1095 L676,1122 L631,1122 Z M543,1165 L580,1192 L594,1235 L557,1209 Z M543,1165 L497,1165 L460,1192 L506,1192 Z M511,1122 L497,1165 L460,1192 L474,1149 Z M423,1165 L377,1165 L340,1192 L386,1192 Z M326,1149 L289,1122 L303,1165 L340,1192 Z M229,1078 L192,1051 L206,1095 L243,1122 Z M243,1035 L229,1078 L243,1122 L258,1078 Z M340,1051 L326,1095 L289,1122 L303,1078 Z M944,1122 L930,1165 L893,1192 L907,1149 Z M893,1051 L930,1078 L944,1122 L907,1095 Z M907,1008 L953,1008 L990,1035 L944,1035 Z M847,1051 L893,1051 L856,1078 L810,1078 Z M990,1035 L976,1078 L990,1122 L1004,1078 Z M1027,1008 L1073,1008 L1109,981 L1064,981 Z M1041,1051 L1027,1095 L990,1122 L1004,1078 Z M1041,964 L1027,1008 L1064,981 L1078,937 Z M1109,894 L1124,851 L1161,824 L1146,867 Z M1146,867 L1161,824 L1175,867 L1161,911 Z M1206,824 L1220,780 L1257,753 L1243,797 Z M543,937 L580,964 L594,1008 L557,981 Z M543,937 L497,937 L460,964 L506,964 Z M73,824 L59,867 L73,911 L87,867 Z M543,569 L497,569 L460,596 L506,596 Z M1013,824 L1027,780 L1041,824 L1027,867 Z M847,455 L893,455 L856,428 L810,428 Z M847,228 L893,228 L856,201 L810,201 Z M460,315 L474,271 L460,228 L446,271 Z M377,342 L340,315 L326,271 L363,298 Z M631,385 L676,385 L640,358 L594,358 Z ' ),
  thickShape: new Shape( 'M594,640 L557,613 L520,640 L557,666 Z M594,640 L640,640 L654,683 L608,683 Z M594,640 L640,640 L654,596 L608,596 Z M580,596 L594,553 L557,526 L543,569 Z M580,683 L543,710 L557,753 L594,726 Z M594,553 L640,553 L654,596 L608,596 Z M631,526 L594,499 L557,526 L594,553 Z M676,526 L640,553 L654,596 L691,569 Z M676,526 L691,482 L654,455 L640,499 Z M676,526 L722,526 L736,569 L691,569 Z M713,499 L759,499 L773,455 L728,455 Z M691,482 L654,455 L691,428 L728,455 Z M722,526 L759,499 L773,542 L736,569 Z M796,526 L810,482 L773,455 L759,499 Z M773,455 L810,428 L796,385 L759,412 Z M759,412 L773,368 L736,342 L722,385 Z M810,428 L856,428 L870,385 L824,385 Z M810,482 L773,455 L810,428 L847,455 Z M810,482 L856,482 L870,526 L824,526 Z M728,455 L773,455 L759,412 L713,412 Z M676,385 L691,342 L654,315 L640,358 Z M676,385 L722,385 L736,342 L691,342 Z M654,455 L691,428 L676,385 L640,412 Z M608,455 L654,455 L640,412 L594,412 Z M594,412 L557,385 L594,358 L631,385 Z M594,499 L557,526 L543,482 L580,455 Z M594,499 L640,499 L654,455 L608,455 Z M580,455 L543,428 L506,455 L543,482 Z M580,455 L594,412 L557,385 L543,428 Z M506,455 L460,455 L474,412 L520,412 Z M557,385 L594,358 L580,315 L543,342 Z M557,385 L511,385 L497,342 L543,342 Z M543,342 L557,298 L520,271 L506,315 Z M594,358 L640,358 L654,315 L608,315 Z M511,385 L474,412 L460,368 L497,342 Z M497,342 L460,315 L423,342 L460,368 Z M460,455 L423,428 L386,455 L423,482 Z M460,455 L474,412 L437,385 L423,428 Z M474,499 L437,526 L423,482 L460,455 Z M423,428 L377,428 L363,385 L409,385 Z M409,385 L363,385 L377,342 L423,342 Z M377,428 L340,455 L326,412 L363,385 Z M340,455 L295,455 L280,412 L326,412 Z M326,412 L340,368 L303,342 L289,385 Z M295,455 L258,482 L243,439 L280,412 Z M280,412 L243,385 L206,412 L243,439 Z M243,526 L206,499 L170,526 L206,553 Z M243,526 L258,482 L221,455 L206,499 Z M206,499 L161,499 L147,455 L192,455 Z M289,526 L243,526 L258,482 L303,482 Z M303,569 L258,569 L243,526 L289,526 Z M363,526 L326,499 L289,526 L326,553 Z M363,526 L377,482 L340,455 L326,499 Z M377,569 L340,596 L326,553 L363,526 Z M409,526 L363,526 L377,482 L423,482 Z M423,569 L377,569 L363,526 L409,526 Z M372,640 L326,640 L340,683 L386,683 Z M372,640 L326,640 L340,596 L386,596 Z M446,640 L409,666 L423,710 L460,683 Z M446,640 L409,613 L372,640 L409,666 Z M446,640 L460,596 L423,569 L409,613 Z M423,710 L377,710 L363,753 L409,753 Z M409,753 L363,753 L377,797 L423,797 Z M377,710 L363,753 L326,726 L340,683 Z M363,753 L326,780 L340,824 L377,797 Z M363,753 L326,726 L289,753 L326,780 Z M289,753 L243,753 L258,797 L303,797 Z M303,710 L258,710 L243,753 L289,753 Z M243,753 L206,780 L221,824 L258,797 Z M243,753 L206,726 L170,753 L206,780 Z M206,780 L161,780 L147,824 L192,824 Z M243,666 L229,710 L192,683 L206,640 Z M280,640 L243,613 L206,640 L243,666 Z M206,640 L161,640 L147,596 L192,596 Z M206,640 L161,640 L147,683 L192,683 Z M289,666 L243,666 L258,710 L303,710 Z M326,640 L289,666 L303,710 L340,683 Z M326,640 L340,596 L303,569 L289,613 Z M289,613 L243,613 L258,569 L303,569 Z M243,613 L206,640 L192,596 L229,569 Z M192,596 L206,553 L170,526 L155,569 Z M192,683 L155,710 L170,753 L206,726 Z M161,640 L124,613 L87,640 L124,666 Z M124,666 L110,710 L73,683 L87,640 Z M124,613 L87,640 L73,596 L110,569 Z M110,710 L73,737 L87,780 L124,753 Z M110,710 L73,683 L36,710 L73,737 Z M73,683 L27,683 L13,640 L59,640 Z M155,710 L110,710 L124,753 L170,753 Z M73,596 L27,596 L13,640 L59,640 Z M110,569 L73,542 L36,569 L73,596 Z M110,569 L124,526 L87,499 L73,542 Z M161,499 L124,526 L110,482 L147,455 Z M155,569 L110,569 L124,526 L170,526 Z M147,455 L110,428 L73,455 L110,482 Z M147,455 L161,412 L124,385 L110,428 Z M192,455 L147,455 L161,412 L206,412 Z M243,385 L206,412 L192,368 L229,342 Z M170,385 L124,385 L110,342 L155,342 Z M155,342 L110,342 L124,298 L170,298 Z M124,385 L87,412 L73,368 L110,342 Z M243,244 L206,271 L192,228 L229,201 Z M229,342 L192,315 L155,342 L192,368 Z M229,342 L243,298 L206,271 L192,315 Z M280,271 L243,244 L206,271 L243,298 Z M303,342 L258,342 L243,298 L289,298 Z M326,271 L340,228 L303,201 L289,244 Z M340,315 L303,342 L289,298 L326,271 Z M289,244 L243,244 L258,201 L303,201 Z M372,271 L326,271 L340,228 L386,228 Z M409,298 L423,255 L386,228 L372,271 Z M423,201 L377,201 L363,157 L409,157 Z M460,228 L423,201 L386,228 L423,255 Z M460,228 L474,184 L437,157 L423,201 Z M474,184 L437,157 L474,130 L511,157 Z M520,271 L557,244 L543,201 L506,228 Z M520,271 L474,271 L460,228 L506,228 Z M543,201 L497,201 L511,157 L557,157 Z M580,228 L594,184 L557,157 L543,201 Z M557,157 L594,130 L580,87 L543,114 Z M557,157 L511,157 L497,114 L543,114 Z M543,114 L557,70 L520,44 L506,87 Z M594,130 L639,130 L654,87 L608,87 Z M594,184 L557,157 L594,130 L631,157 Z M437,157 L474,130 L460,87 L423,114 Z M423,114 L386,87 L423,60 L460,87 Z M409,157 L363,157 L377,114 L423,114 Z M363,157 L326,130 L289,157 L326,184 Z M363,157 L377,114 L340,87 L326,130 Z M377,201 L340,228 L326,184 L363,157 Z M303,201 L258,201 L243,157 L289,157 Z M506,87 L460,87 L474,44 L520,44 Z M557,70 L520,44 L557,17 L594,44 Z M608,87 L654,87 L639,44 L594,44 Z M676,70 L639,44 L676,17 L713,44 Z M691,114 L728,87 L713,44 L676,70 Z M728,87 L773,87 L759,44 L713,44 Z M810,114 L773,87 L810,60 L847,87 Z M796,157 L810,114 L773,87 L759,130 Z M810,201 L856,201 L870,157 L824,157 Z M759,184 L722,157 L759,130 L796,157 Z M773,228 L810,201 L796,157 L759,184 Z M810,255 L773,228 L810,201 L847,228 Z M691,201 L736,201 L722,157 L676,157 Z M713,271 L728,228 L691,201 L676,244 Z M713,271 L759,271 L773,228 L728,228 Z M728,315 L773,315 L759,271 L713,271 Z M676,298 L640,271 L676,244 L713,271 Z M654,228 L691,201 L676,157 L639,184 Z M594,271 L640,271 L654,228 L608,228 Z M608,315 L654,315 L640,271 L594,271 Z M557,298 L520,271 L557,244 L594,271 Z M608,228 L654,228 L639,184 L594,184 Z M676,157 L691,114 L654,87 L639,130 Z M676,157 L722,157 L736,114 L691,114 Z M691,342 L728,315 L713,271 L676,298 Z M773,368 L736,342 L773,315 L810,342 Z M810,342 L824,298 L787,271 L773,315 Z M810,342 L856,342 L870,298 L824,298 Z M824,385 L870,385 L856,342 L810,342 Z M824,298 L861,271 L847,228 L810,255 Z M893,368 L856,342 L893,315 L930,342 Z M907,271 L944,244 L930,201 L893,228 Z M893,228 L907,184 L870,157 L856,201 Z M944,244 L990,244 L976,201 L930,201 Z M861,271 L907,271 L893,228 L847,228 Z M990,298 L953,271 L990,244 L1027,271 Z M1004,342 L1041,315 L1027,271 L990,298 Z M1004,342 L1041,368 L1078,342 L1041,315 Z M1027,271 L1041,228 L1004,201 L990,244 Z M1027,271 L1073,271 L1087,228 L1041,228 Z M990,385 L1004,342 L1041,368 L1027,412 Z M930,342 L944,298 L907,271 L893,315 Z M930,342 L976,342 L990,298 L944,298 Z M944,385 L990,385 L976,342 L930,342 Z M907,412 L944,385 L930,342 L893,368 Z M893,455 L907,412 L870,385 L856,428 Z M893,455 L939,455 L953,412 L907,412 Z M953,412 L990,439 L1027,412 L990,385 Z M939,455 L953,412 L990,439 L976,482 Z M976,482 L1013,455 L1027,499 L990,526 Z M990,526 L1027,553 L1064,526 L1027,499 Z M930,482 L976,482 L990,526 L944,526 Z M930,569 L976,569 L990,613 L944,613 Z M930,569 L976,569 L990,526 L944,526 Z M893,596 L930,569 L944,613 L907,640 Z M990,613 L1004,569 L1041,596 L1027,640 Z M953,640 L990,666 L1027,640 L990,613 Z M1027,640 L1073,640 L1087,683 L1041,683 Z M1027,640 L1073,640 L1087,596 L1041,596 Z M1027,553 L1064,526 L1078,569 L1041,596 Z M1124,569 L1161,596 L1198,569 L1161,542 Z M1073,640 L1109,666 L1146,640 L1109,613 Z M1109,613 L1124,569 L1161,596 L1146,640 Z M1109,666 L1146,640 L1161,683 L1124,710 Z M1124,710 L1161,737 L1198,710 L1161,683 Z M1161,683 L1206,683 L1220,640 L1175,640 Z M1161,596 L1206,596 L1220,640 L1175,640 Z M1206,596 L1243,569 L1257,613 L1220,640 Z M1206,542 L1220,499 L1257,526 L1243,569 Z M1161,455 L1206,455 L1220,499 L1175,499 Z M1161,455 L1206,455 L1220,412 L1175,412 Z M1161,542 L1206,542 L1220,499 L1175,499 Z M1109,526 L1146,499 L1161,542 L1124,569 Z M1073,499 L1087,455 L1124,482 L1109,526 Z M1064,526 L1109,526 L1124,569 L1078,569 Z M1027,499 L1073,499 L1087,455 L1041,455 Z M1027,412 L1073,412 L1087,455 L1041,455 Z M1087,455 L1124,482 L1161,455 L1124,428 Z M1073,412 L1109,385 L1124,428 L1087,455 Z M1109,385 L1124,342 L1161,368 L1146,412 Z M1124,342 L1161,315 L1146,271 L1109,298 Z M1124,342 L1161,368 L1198,342 L1161,315 Z M1064,385 L1109,385 L1124,342 L1078,342 Z M1078,342 L1124,342 L1109,298 L1064,298 Z M1073,271 L1087,228 L1124,255 L1109,298 Z M944,157 L990,157 L976,114 L930,114 Z M907,184 L870,157 L907,130 L944,157 Z M930,201 L976,201 L990,157 L944,157 Z M870,157 L907,130 L893,87 L856,114 Z M824,157 L870,157 L856,114 L810,114 Z M1161,368 L1206,368 L1220,412 L1175,412 Z M1206,683 L1220,640 L1257,666 L1243,710 Z M1206,737 L1243,710 L1257,753 L1220,780 Z M1161,737 L1206,737 L1220,780 L1175,780 Z M1161,824 L1206,824 L1220,867 L1175,867 Z M1161,824 L1206,824 L1220,780 L1175,780 Z M1109,753 L1124,710 L1161,737 L1146,780 Z M1073,780 L1109,753 L1124,797 L1087,824 Z M1064,753 L1109,753 L1124,710 L1078,710 Z M1027,780 L1073,780 L1087,824 L1041,824 Z M1027,726 L1041,683 L1078,710 L1064,753 Z M990,666 L1027,640 L1041,683 L1004,710 Z M990,753 L1027,780 L1064,753 L1027,726 Z M976,797 L990,753 L1027,780 L1013,824 Z M930,710 L976,710 L990,753 L944,753 Z M930,710 L976,710 L990,666 L944,666 Z M930,797 L976,797 L990,753 L944,753 Z M893,824 L856,851 L870,894 L907,867 Z M893,824 L939,824 L953,867 L907,867 Z M907,867 L893,911 L930,937 L944,894 Z M856,797 L870,753 L907,780 L893,824 Z M939,824 L976,797 L990,840 L953,867 Z M953,867 L990,894 L1027,867 L990,840 Z M990,894 L1027,867 L1041,911 L1004,937 Z M1004,937 L1041,964 L1078,937 L1041,911 Z M1004,937 L990,981 L1027,1008 L1041,964 Z M1027,867 L1073,867 L1087,824 L1041,824 Z M944,894 L990,894 L976,937 L930,937 Z M930,937 L893,964 L907,1008 L944,981 Z M930,937 L976,937 L990,981 L944,981 Z M893,911 L930,937 L893,964 L856,937 Z M810,937 L773,964 L787,1008 L824,981 Z M810,937 L856,937 L870,981 L824,981 Z M824,981 L810,1024 L847,1051 L861,1008 Z M773,911 L810,937 L773,964 L736,937 Z M824,894 L870,894 L856,937 L810,937 Z M810,851 L856,851 L870,894 L824,894 Z M773,824 L759,867 L796,894 L810,851 Z M810,797 L847,824 L810,851 L773,824 Z M810,797 L856,797 L870,753 L824,753 Z M759,867 L722,894 L736,937 L773,911 Z M728,824 L773,824 L759,867 L713,867 Z M713,780 L759,780 L773,824 L728,824 Z M691,797 L728,824 L691,851 L654,824 Z M676,894 L640,921 L654,964 L691,937 Z M676,894 L722,894 L736,937 L691,937 Z M691,937 L676,981 L713,1008 L728,964 Z M594,921 L640,921 L654,964 L608,964 Z M594,867 L631,894 L594,921 L557,894 Z M580,824 L543,851 L557,894 L594,867 Z M580,824 L543,797 L506,824 L543,851 Z M557,894 L543,937 L580,964 L594,921 Z M557,894 L511,894 L497,937 L543,937 Z M608,824 L654,824 L640,867 L594,867 Z M594,780 L580,824 L543,797 L557,753 Z M594,780 L640,780 L654,824 L608,824 Z M654,824 L640,867 L676,894 L691,851 Z M676,753 L640,780 L654,824 L691,797 Z M676,753 L691,710 L654,683 L640,726 Z M676,753 L722,753 L736,710 L691,710 Z M631,753 L594,726 L557,753 L594,780 Z M722,753 L736,710 L773,737 L759,780 Z M773,683 L810,710 L773,737 L736,710 Z M773,683 L787,640 L824,666 L810,710 Z M810,710 L856,710 L870,753 L824,753 Z M847,683 L893,683 L907,640 L861,640 Z M796,753 L759,780 L773,824 L810,797 Z M856,710 L893,683 L907,726 L870,753 Z M870,753 L907,780 L944,753 L907,726 Z M893,683 L907,640 L944,666 L930,710 Z M847,596 L893,596 L907,640 L861,640 Z M810,569 L856,569 L870,526 L824,526 Z M787,640 L824,666 L861,640 L824,613 Z M773,596 L810,569 L824,613 L787,640 Z M773,596 L736,569 L773,542 L810,569 Z M713,640 L676,666 L691,710 L728,683 Z M713,640 L676,613 L640,640 L676,666 Z M713,640 L728,596 L691,569 L676,613 Z M713,640 L759,640 L773,683 L728,683 Z M713,640 L759,640 L773,596 L728,596 Z M856,569 L870,526 L907,553 L893,596 Z M870,526 L907,553 L944,526 L907,499 Z M856,482 L893,455 L907,499 L870,526 Z M594,726 L640,726 L654,683 L608,683 Z M543,710 L557,666 L520,640 L506,683 Z M543,710 L497,710 L511,753 L557,753 Z M520,780 L474,780 L460,824 L506,824 Z M497,710 L460,737 L474,780 L511,753 Z M497,710 L460,683 L423,710 L460,737 Z M474,780 L460,824 L423,797 L437,753 Z M460,824 L423,851 L437,894 L474,867 Z M460,824 L423,797 L386,824 L423,851 Z M423,851 L377,851 L363,894 L409,894 Z M506,824 L460,824 L474,867 L520,867 Z M340,824 L295,824 L280,867 L326,867 Z M377,851 L363,894 L326,867 L340,824 Z M326,867 L289,894 L303,937 L340,911 Z M295,824 L280,867 L243,840 L258,797 Z M280,867 L243,840 L206,867 L243,894 Z M243,894 L229,937 L192,911 L206,867 Z M192,824 L147,824 L161,867 L206,867 Z M170,894 L124,894 L110,937 L155,937 Z M147,824 L110,851 L124,894 L161,867 Z M147,824 L110,797 L73,824 L110,851 Z M124,894 L110,937 L73,911 L87,867 Z M155,937 L110,937 L124,981 L170,981 Z M229,937 L192,964 L206,1008 L243,981 Z M229,937 L192,911 L155,937 L192,964 Z M280,1008 L243,981 L206,1008 L243,1035 Z M326,1008 L289,1035 L303,1078 L340,1051 Z M303,937 L258,937 L243,981 L289,981 Z M289,894 L243,894 L258,937 L303,937 Z M340,964 L326,1008 L289,981 L303,937 Z M377,937 L340,911 L303,937 L340,964 Z M423,937 L377,937 L363,981 L409,981 Z M409,894 L363,894 L377,937 L423,937 Z M460,964 L446,1008 L409,981 L423,937 Z M409,981 L372,1008 L386,1051 L423,1024 Z M372,1008 L326,1008 L340,1051 L386,1051 Z M460,1051 L423,1078 L437,1122 L474,1095 Z M460,1051 L423,1024 L386,1051 L423,1078 Z M474,1095 L511,1122 L474,1149 L437,1122 Z M423,1078 L377,1078 L363,1122 L409,1122 Z M543,1078 L497,1078 L511,1122 L557,1122 Z M520,1008 L506,1051 L543,1078 L557,1035 Z M520,1008 L474,1008 L460,1051 L506,1051 Z M506,964 L460,964 L474,1008 L520,1008 Z M557,981 L594,1008 L557,1035 L520,1008 Z M594,1008 L640,1008 L654,1051 L608,1051 Z M608,1051 L654,1051 L640,1095 L594,1095 Z M580,1051 L543,1078 L557,1122 L594,1095 Z M608,964 L654,964 L640,1008 L594,1008 Z M654,1051 L640,1095 L676,1122 L691,1078 Z M676,981 L713,1008 L676,1035 L640,1008 Z M691,1078 L736,1078 L722,1122 L676,1122 Z M713,1008 L676,1035 L691,1078 L728,1051 Z M713,1008 L759,1008 L773,1051 L728,1051 Z M728,964 L773,964 L759,1008 L713,1008 Z M773,1051 L759,1095 L796,1122 L810,1078 Z M810,1024 L847,1051 L810,1078 L773,1051 Z M810,1078 L856,1078 L870,1122 L824,1122 Z M759,1095 L796,1122 L759,1149 L722,1122 Z M796,1122 L759,1149 L773,1192 L810,1165 Z M810,1165 L847,1192 L810,1219 L773,1192 Z M728,1192 L773,1192 L759,1235 L713,1235 Z M691,1165 L676,1209 L713,1235 L728,1192 Z M676,1209 L713,1235 L676,1262 L640,1235 Z M557,1209 L594,1235 L557,1262 L520,1235 Z M608,1192 L654,1192 L640,1235 L594,1235 Z M594,1149 L640,1149 L654,1192 L608,1192 Z M557,1122 L543,1165 L580,1192 L594,1149 Z M557,1122 L511,1122 L497,1165 L543,1165 Z M676,1122 L640,1149 L654,1192 L691,1165 Z M676,1122 L722,1122 L736,1165 L691,1165 Z M594,1095 L631,1122 L594,1149 L557,1122 Z M543,1165 L506,1192 L520,1235 L557,1209 Z M423,1165 L460,1192 L423,1219 L386,1192 Z M506,1192 L460,1192 L474,1235 L520,1235 Z M409,1122 L363,1122 L377,1165 L423,1165 Z M437,1122 L423,1165 L460,1192 L474,1149 Z M363,1122 L326,1149 L340,1192 L377,1165 Z M363,1122 L326,1095 L289,1122 L326,1149 Z M303,1078 L258,1078 L243,1122 L289,1122 Z M243,1035 L229,1078 L192,1051 L206,1008 Z M289,1035 L243,1035 L258,1078 L303,1078 Z M377,1078 L363,1122 L326,1095 L340,1051 Z M944,1122 L990,1122 L976,1165 L930,1165 Z M870,1122 L856,1165 L893,1192 L907,1149 Z M907,1095 L944,1122 L907,1149 L870,1122 Z M824,1122 L870,1122 L856,1165 L810,1165 Z M893,1051 L856,1078 L870,1122 L907,1095 Z M930,1078 L976,1078 L990,1122 L944,1122 Z M907,1008 L893,1051 L930,1078 L944,1035 Z M861,1008 L907,1008 L893,1051 L847,1051 Z M944,1035 L990,1035 L976,1078 L930,1078 Z M990,981 L1027,1008 L990,1035 L953,1008 Z M1027,1008 L990,1035 L1004,1078 L1041,1051 Z M1027,1008 L1073,1008 L1087,1051 L1041,1051 Z M1073,1008 L1109,981 L1124,1024 L1087,1051 Z M1124,937 L1161,964 L1198,937 L1161,911 Z M1124,937 L1109,981 L1146,1008 L1161,964 Z M1078,937 L1124,937 L1109,981 L1064,981 Z M1064,894 L1109,894 L1124,937 L1078,937 Z M1109,894 L1146,867 L1161,911 L1124,937 Z M1073,867 L1087,824 L1124,851 L1109,894 Z M1087,824 L1124,851 L1161,824 L1124,797 Z M1161,911 L1206,911 L1220,867 L1175,867 Z M543,937 L506,964 L520,1008 L557,981 Z M497,937 L460,911 L423,937 L460,964 Z M511,894 L497,937 L460,911 L474,867 Z M161,780 L147,824 L110,797 L124,753 Z M506,683 L460,683 L474,640 L520,640 Z M506,596 L460,596 L474,640 L520,640 Z M543,569 L506,596 L520,640 L557,613 Z M543,569 L497,569 L511,526 L557,526 Z M497,569 L460,542 L423,569 L460,596 Z M497,569 L511,526 L474,499 L460,542 Z M506,315 L460,315 L474,271 L520,271 Z M460,315 L423,342 L409,298 L446,271 Z M423,342 L377,342 L363,298 L409,298 Z M377,342 L340,315 L303,342 L340,368 Z M289,385 L243,385 L258,342 L303,342 Z M520,499 L474,499 L460,455 L506,455 Z ' )
};

export const penrose20: PenroseTiling = {
  name: 'Penrose20',
  thinShape: new Shape( 'M665,621 L675,590 L649,609 L640,640 Z M665,658 L640,640 L649,670 L675,689 Z M598,609 L572,590 L582,621 L608,640 Z M598,609 L608,579 L617,609 L608,640 Z M598,670 L608,640 L617,670 L608,700 Z M598,670 L608,640 L582,658 L572,689 Z M633,560 L665,560 L640,579 L608,579 Z M633,560 L665,560 L640,541 L608,541 Z M582,560 L556,541 L546,511 L572,529 Z M582,560 L550,560 L524,541 L556,541 Z M665,560 L675,529 L701,511 L691,541 Z M665,560 L697,560 L723,541 L691,541 Z M749,560 L723,541 L733,571 L759,590 Z M749,560 L759,529 L769,560 L759,590 Z M723,480 L733,450 L759,431 L749,461 Z M759,492 L769,461 L759,431 L749,461 Z M759,529 L791,529 L817,511 L785,511 Z M701,511 L675,492 L665,461 L691,480 Z M691,480 L723,480 L697,461 L665,461 Z M608,480 L640,480 L665,461 L633,461 Z M608,541 L617,511 L608,480 L598,511 Z M572,492 L582,461 L556,480 L546,511 Z M582,461 L550,461 L524,480 L556,480 Z M572,431 L582,400 L608,382 L598,412 Z M572,431 L540,431 L514,412 L546,412 Z M608,443 L617,412 L608,382 L598,412 Z M524,480 L498,461 L488,431 L514,450 Z M488,529 L456,529 L430,511 L462,511 Z M488,492 L498,461 L488,431 L478,461 Z M488,492 L456,492 L430,511 L462,511 Z M446,461 L456,431 L430,450 L420,480 Z M430,511 L398,511 L372,529 L404,529 Z M420,480 L388,480 L362,461 L394,461 Z M420,541 L430,511 L404,529 L394,560 Z M372,529 L346,511 L336,480 L362,499 Z M336,541 L346,511 L336,480 L327,511 Z M336,541 L304,541 L279,560 L311,560 Z M352,590 L362,560 L336,579 L327,609 Z M430,609 L404,590 L394,560 L420,579 Z M488,590 L498,560 L488,529 L478,560 Z M488,590 L456,590 L430,609 L462,609 Z M514,571 L524,541 L498,560 L488,590 Z M478,621 L488,590 L462,609 L452,640 Z M504,640 L514,609 L524,640 L514,670 Z M478,658 L452,640 L462,670 L488,689 Z M488,689 L478,719 L488,750 L498,719 Z M488,689 L456,689 L430,670 L462,670 Z M514,708 L488,689 L498,719 L524,738 Z M430,670 L420,700 L394,719 L404,689 Z M420,738 L394,719 L404,750 L430,768 Z M352,689 L327,670 L336,700 L362,719 Z M372,750 L362,780 L336,799 L346,768 Z M336,738 L327,768 L336,799 L346,768 Z M336,738 L304,738 L279,719 L311,719 Z M362,658 L352,689 L362,719 L372,689 Z M420,640 L388,640 L362,658 L394,658 Z M420,640 L388,640 L362,621 L394,621 Z M362,621 L372,590 L362,560 L352,590 Z M327,609 L295,609 L269,590 L301,590 Z M327,670 L295,670 L269,689 L301,689 Z M304,640 L279,621 L269,590 L295,609 Z M304,640 L295,670 L269,689 L279,658 Z M279,719 L269,750 L243,768 L253,738 Z M243,708 L233,738 L243,768 L253,738 Z M243,708 L211,708 L185,689 L217,689 Z M243,670 L211,670 L185,689 L217,689 Z M253,640 L243,670 L233,640 L243,609 Z M185,689 L159,670 L149,640 L175,658 Z M185,689 L153,689 L127,670 L159,670 Z M175,719 L143,719 L117,738 L149,738 Z M127,670 L117,700 L91,719 L101,689 Z M117,738 L107,768 L117,799 L127,768 Z M81,750 L49,750 L23,768 L55,768 Z M101,689 L91,719 L81,689 L91,658 Z M59,719 L33,700 L23,670 L49,689 Z M59,719 L49,750 L23,768 L33,738 Z M91,818 L81,848 L91,879 L101,848 Z M91,818 L59,818 L33,799 L65,799 Z M117,897 L107,928 L117,958 L127,928 Z M117,897 L107,928 L81,947 L91,916 Z M175,879 L143,879 L117,897 L149,897 Z M201,897 L175,879 L185,909 L211,928 Z M175,818 L143,818 L117,799 L149,799 Z M153,848 L143,879 L117,897 L127,867 Z M243,829 L211,829 L185,848 L217,848 Z M243,867 L233,897 L243,928 L253,897 Z M243,867 L211,867 L185,848 L217,848 Z M269,947 L259,977 L269,1007 L279,977 Z M233,958 L201,958 L175,977 L207,977 Z M211,928 L201,958 L175,977 L185,947 Z M175,977 L143,977 L117,996 L149,996 Z M175,977 L143,977 L117,958 L149,958 Z M243,1026 L233,1057 L243,1087 L253,1057 Z M243,1026 L211,1026 L185,1007 L217,1007 Z M327,1087 L295,1087 L269,1106 L301,1106 Z M352,1106 L327,1087 L336,1118 L362,1136 Z M327,1026 L295,1026 L269,1007 L301,1007 Z M362,1076 L352,1106 L362,1136 L372,1106 Z M304,1057 L295,1087 L269,1106 L279,1076 Z M295,1026 L269,1007 L279,1038 L304,1057 Z M420,1057 L446,1076 L456,1106 L430,1087 Z M420,1057 L388,1057 L362,1076 L394,1076 Z M420,1057 L388,1057 L362,1038 L394,1038 Z M452,1057 L420,1057 L446,1076 L478,1076 Z M488,1007 L456,1007 L430,1026 L462,1026 Z M514,1026 L504,1057 L514,1087 L524,1057 Z M514,1026 L504,1057 L478,1076 L488,1045 Z M572,1007 L598,1026 L608,1057 L582,1038 Z M572,1007 L540,1007 L514,1026 L546,1026 Z M608,958 L640,958 L665,977 L633,977 Z M608,996 L598,1026 L608,1057 L617,1026 Z M550,977 L540,1007 L514,1026 L524,996 Z M514,928 L540,947 L550,977 L524,958 Z M488,947 L478,977 L488,1007 L498,977 Z M488,947 L456,947 L430,928 L462,928 Z M430,928 L420,958 L394,977 L404,947 Z M420,996 L394,977 L404,1007 L430,1026 Z M362,977 L352,1007 L362,1038 L372,1007 Z M362,977 L352,1007 L327,1026 L336,996 Z M352,947 L327,928 L336,958 L362,977 Z M362,916 L352,947 L362,977 L372,947 Z M336,897 L304,897 L279,879 L311,879 Z M420,897 L388,897 L362,916 L394,916 Z M420,897 L388,897 L362,879 L394,879 Z M478,879 L446,879 L420,897 L452,897 Z M504,897 L478,879 L488,909 L514,928 Z M514,867 L504,897 L514,928 L524,897 Z M456,848 L446,879 L420,897 L430,867 Z M446,818 L420,799 L430,829 L456,848 Z M420,799 L388,799 L362,818 L394,818 Z M362,818 L352,848 L362,879 L372,848 Z M327,867 L301,848 L311,879 L336,897 Z M336,799 L327,829 L301,848 L311,818 Z M336,799 L304,799 L279,818 L311,818 Z M269,787 L243,768 L253,799 L279,818 Z M243,768 L233,799 L243,829 L253,799 Z M211,768 L201,799 L175,818 L185,787 Z M201,738 L175,719 L185,750 L211,768 Z M430,768 L398,768 L372,750 L404,750 Z M488,750 L456,750 L430,768 L462,768 Z M488,787 L478,818 L488,848 L498,818 Z M488,787 L456,787 L430,768 L462,768 Z M524,799 L514,829 L488,848 L498,818 Z M572,787 L546,768 L556,799 L582,818 Z M582,719 L572,750 L546,768 L556,738 Z M582,719 L550,719 L524,738 L556,738 Z M572,689 L540,689 L514,670 L546,670 Z M608,738 L598,768 L608,799 L617,768 Z M633,719 L665,719 L640,738 L608,738 Z M633,719 L665,719 L640,700 L608,700 Z M665,719 L691,738 L701,768 L675,750 Z M665,719 L697,719 L723,738 L691,738 Z M759,689 L769,658 L795,640 L785,670 Z M759,689 L791,689 L817,670 L785,670 Z M749,719 L759,689 L769,719 L759,750 Z M749,719 L759,689 L733,708 L723,738 Z M817,670 L843,689 L853,719 L827,700 Z M827,640 L859,640 L885,621 L853,621 Z M827,640 L859,640 L885,658 L853,658 Z M817,609 L827,579 L853,560 L843,590 Z M875,689 L885,658 L895,689 L885,719 Z M885,719 L895,689 L920,670 L911,700 Z M911,738 L943,738 L968,719 L936,719 Z M875,750 L901,768 L911,799 L885,780 Z M817,768 L827,738 L853,719 L843,750 Z M817,768 L849,768 L875,750 L843,750 Z M827,799 L817,829 L791,848 L801,818 Z M827,799 L859,799 L885,818 L853,818 Z M785,768 L817,768 L791,787 L759,787 Z M885,818 L875,848 L885,879 L895,848 Z M911,799 L936,818 L946,848 L920,829 Z M911,799 L943,799 L968,818 L936,818 Z M853,879 L885,879 L859,897 L827,897 Z M791,848 L817,867 L827,897 L801,879 Z M769,879 L759,909 L733,928 L743,897 Z M769,879 L801,879 L827,897 L795,897 Z M733,867 L723,897 L733,928 L743,897 Z M759,787 L749,818 L759,848 L769,818 Z M759,750 L791,750 L817,768 L785,768 Z M723,799 L749,818 L759,848 L733,829 Z M701,768 L691,799 L665,818 L675,787 Z M691,799 L723,799 L697,818 L665,818 Z M675,848 L665,879 L640,897 L649,867 Z M675,848 L707,848 L733,867 L701,867 Z M633,818 L665,818 L640,836 L608,836 Z M608,836 L598,867 L608,897 L617,867 Z M608,799 L640,799 L665,818 L633,818 Z M582,818 L550,818 L524,799 L556,799 Z M572,848 L598,867 L608,897 L582,879 Z M572,848 L540,848 L514,867 L546,867 Z M608,897 L598,928 L608,958 L617,928 Z M608,897 L598,928 L572,947 L582,916 Z M640,897 L665,916 L675,947 L649,928 Z M701,928 L733,928 L707,947 L675,947 Z M733,928 L723,958 L697,977 L707,947 Z M759,947 L749,977 L759,1007 L769,977 Z M697,977 L723,996 L733,1026 L707,1007 Z M759,1007 L791,1007 L817,1026 L785,1026 Z M733,1026 L759,1045 L769,1076 L743,1057 Z M733,1026 L723,1057 L733,1087 L743,1057 Z M675,1007 L665,1038 L640,1057 L649,1026 Z M675,1007 L707,1007 L733,1026 L701,1026 Z M701,1087 L733,1087 L707,1106 L675,1106 Z M640,1057 L665,1076 L675,1106 L649,1087 Z M608,1057 L598,1087 L608,1118 L617,1087 Z M608,1057 L598,1087 L572,1106 L582,1076 Z M608,1118 L640,1118 L665,1136 L633,1136 Z M582,1136 L572,1167 L546,1186 L556,1155 Z M582,1136 L550,1136 L524,1155 L556,1155 Z M546,1087 L514,1087 L540,1106 L572,1106 Z M488,1106 L514,1125 L524,1155 L498,1136 Z M488,1106 L478,1136 L488,1167 L498,1136 Z M456,1106 L446,1136 L420,1155 L430,1125 Z M394,1136 L362,1136 L388,1155 L420,1155 Z M362,1136 L388,1155 L398,1186 L372,1167 Z M336,1155 L304,1155 L279,1136 L311,1136 Z M462,1186 L430,1186 L456,1204 L488,1204 Z M488,1167 L456,1167 L430,1186 L462,1186 Z M546,1186 L572,1204 L582,1235 L556,1216 Z M556,1216 L524,1216 L550,1235 L582,1235 Z M608,1216 L640,1216 L665,1235 L633,1235 Z M608,1155 L598,1186 L608,1216 L617,1186 Z M633,1136 L665,1136 L640,1155 L608,1155 Z M665,1136 L691,1155 L701,1186 L675,1167 Z M665,1136 L697,1136 L723,1155 L691,1155 Z M759,1106 L749,1136 L759,1167 L769,1136 Z M759,1106 L749,1136 L723,1155 L733,1125 Z M791,1106 L817,1125 L827,1155 L801,1136 Z M827,1057 L817,1087 L791,1106 L801,1076 Z M827,1057 L859,1057 L885,1076 L853,1076 Z M853,1038 L885,1038 L859,1057 L827,1057 Z M795,1057 L827,1057 L801,1076 L769,1076 Z M885,1076 L875,1106 L885,1136 L895,1106 Z M885,1136 L875,1167 L849,1186 L859,1155 Z M853,1136 L885,1136 L859,1155 L827,1155 Z M911,1155 L901,1186 L911,1216 L920,1186 Z M936,1136 L968,1136 L943,1155 L911,1155 Z M1004,1087 L1036,1087 L1062,1106 L1030,1106 Z M920,1087 L911,1118 L885,1136 L895,1106 Z M920,1087 L952,1087 L978,1106 L946,1106 Z M943,1057 L968,1076 L978,1106 L952,1087 Z M978,1007 L968,1038 L943,1057 L952,1026 Z M946,1007 L978,1007 L952,1026 L920,1026 Z M885,977 L911,996 L920,1026 L895,1007 Z M885,977 L875,1007 L885,1038 L895,1007 Z M853,977 L843,1007 L817,1026 L827,996 Z M817,928 L843,947 L853,977 L827,958 Z M827,897 L859,897 L885,916 L853,916 Z M785,928 L817,928 L791,947 L759,947 Z M885,916 L875,947 L885,977 L895,947 Z M911,897 L943,897 L968,879 L936,879 Z M920,928 L911,958 L885,977 L895,947 Z M920,928 L952,928 L978,947 L946,947 Z M920,867 L911,897 L936,879 L946,848 Z M968,879 L994,897 L1004,928 L978,909 Z M968,818 L978,787 L1004,768 L994,799 Z M1004,829 L1036,829 L1062,848 L1030,848 Z M1004,867 L994,897 L1004,928 L1014,897 Z M1004,867 L1036,867 L1062,848 L1030,848 Z M1046,897 L1036,928 L1062,909 L1072,879 Z M1072,879 L1104,879 L1130,897 L1098,897 Z M1072,818 L1104,818 L1130,799 L1098,799 Z M1094,848 L1120,867 L1130,897 L1104,879 Z M1094,848 L1104,818 L1130,799 L1120,829 Z M1130,799 L1140,768 L1166,750 L1156,780 Z M1120,768 L1130,738 L1140,768 L1130,799 Z M1156,818 L1188,818 L1214,799 L1182,799 Z M1072,719 L1104,719 L1130,738 L1098,738 Z M1120,670 L1146,689 L1156,719 L1130,700 Z M1146,689 L1156,658 L1166,689 L1156,719 Z M1062,689 L1072,658 L1098,640 L1088,670 Z M1062,689 L1094,689 L1120,670 L1088,670 Z M1062,590 L1088,609 L1098,640 L1072,621 Z M1062,590 L1094,590 L1120,609 L1088,609 Z M1004,609 L1036,609 L1062,590 L1030,590 Z M1004,670 L1036,670 L1062,689 L1030,689 Z M994,640 L1004,609 L1014,640 L1004,670 Z M1004,708 L1036,708 L1062,689 L1030,689 Z M994,738 L1004,708 L1014,738 L1004,768 Z M1036,768 L1062,787 L1072,818 L1046,799 Z M1036,768 L1046,738 L1072,719 L1062,750 Z M994,799 L1004,768 L1014,799 L1004,829 Z M968,719 L994,738 L1004,768 L978,750 Z M920,670 L952,670 L978,689 L946,689 Z M943,640 L968,658 L978,689 L952,670 Z M943,640 L952,609 L978,590 L968,621 Z M920,609 L952,609 L978,590 L946,590 Z M885,560 L911,579 L920,609 L895,590 Z M875,529 L885,499 L911,480 L901,511 Z M911,541 L943,541 L968,560 L936,560 Z M875,590 L885,560 L895,590 L885,621 Z M817,511 L843,529 L853,560 L827,541 Z M817,511 L849,511 L875,529 L843,529 Z M759,590 L785,609 L795,640 L769,621 Z M759,590 L791,590 L817,609 L785,609 Z M723,640 L733,609 L743,640 L733,670 Z M701,609 L733,609 L707,590 L675,590 Z M701,670 L733,670 L707,689 L675,689 Z M827,480 L801,461 L791,431 L817,450 Z M827,480 L859,480 L885,461 L853,461 Z M785,511 L817,511 L791,492 L759,492 Z M885,461 L895,431 L885,400 L875,431 Z M911,480 L920,450 L946,431 L936,461 Z M911,480 L943,480 L968,461 L936,461 Z M901,511 L911,480 L920,511 L911,541 Z M968,461 L994,480 L1004,511 L978,492 Z M994,480 L1004,450 L1014,480 L1004,511 Z M968,400 L978,370 L1004,351 L994,382 Z M1004,412 L1014,382 L1004,351 L994,382 Z M1004,412 L1036,412 L1062,431 L1030,431 Z M1004,450 L1036,450 L1062,431 L1030,431 Z M920,412 L946,431 L936,400 L911,382 Z M911,382 L943,382 L968,400 L936,400 Z M853,400 L885,400 L859,382 L827,382 Z M827,382 L859,382 L885,363 L853,363 Z M791,431 L801,400 L827,382 L817,412 Z M733,412 L743,382 L733,351 L723,382 Z M769,400 L743,382 L733,351 L759,370 Z M769,400 L801,400 L827,382 L795,382 Z M733,351 L707,332 L697,302 L723,321 Z M759,332 L769,302 L759,272 L749,302 Z M701,351 L733,351 L707,332 L675,332 Z M640,382 L649,351 L675,332 L665,363 Z M608,382 L582,363 L572,332 L598,351 Z M608,382 L617,351 L608,321 L598,351 Z M608,321 L640,321 L665,302 L633,302 Z M633,302 L665,302 L640,283 L608,283 Z M675,272 L649,253 L639,222 L665,241 Z M675,272 L707,272 L733,253 L701,253 Z M697,302 L707,272 L733,253 L723,283 Z M733,253 L743,222 L733,192 L723,222 Z M733,253 L743,222 L769,203 L759,234 Z M759,272 L791,272 L817,253 L785,253 Z M701,192 L733,192 L707,173 L675,173 Z M759,173 L733,154 L723,124 L749,143 Z M759,173 L769,143 L759,112 L749,143 Z M665,143 L675,112 L701,93 L691,124 Z M665,143 L697,143 L723,124 L691,124 Z M701,93 L675,75 L665,44 L691,63 Z M691,63 L723,63 L697,44 L665,44 Z M607,63 L639,63 L665,44 L633,44 Z M607,124 L617,93 L607,63 L598,93 Z M582,143 L556,124 L546,93 L572,112 Z M582,143 L550,143 L524,124 L556,124 Z M633,143 L665,143 L639,124 L607,124 Z M607,161 L639,161 L665,143 L633,143 Z M639,222 L649,192 L675,173 L665,203 Z M607,222 L582,203 L572,173 L598,192 Z M607,222 L617,192 L607,161 L598,192 Z M608,283 L617,253 L607,222 L598,253 Z M572,272 L582,241 L607,222 L598,253 Z M572,272 L540,272 L514,253 L546,253 Z M550,302 L524,283 L514,253 L540,272 Z M514,253 L488,234 L478,203 L504,222 Z M514,253 L524,222 L514,192 L504,222 Z M488,272 L456,272 L430,253 L462,253 Z M546,192 L514,192 L540,173 L572,173 Z M546,93 L556,63 L582,44 L572,75 Z M556,63 L524,63 L550,44 L582,44 Z M462,93 L430,93 L456,75 L488,75 Z M362,143 L372,112 L398,93 L388,124 Z M336,124 L304,124 L279,143 L311,143 Z M352,173 L362,143 L336,161 L327,192 Z M394,143 L362,143 L388,124 L420,124 Z M420,222 L430,192 L456,173 L446,203 Z M420,222 L388,222 L362,241 L394,241 Z M420,222 L388,222 L362,203 L394,203 Z M362,203 L372,173 L362,143 L352,173 Z M420,283 L430,253 L404,272 L394,302 Z M362,302 L336,283 L327,253 L352,272 Z M362,302 L372,272 L362,241 L352,272 Z M352,332 L362,302 L336,321 L327,351 Z M362,363 L372,332 L362,302 L352,332 Z M327,351 L295,351 L269,332 L301,332 Z M336,382 L304,382 L279,400 L311,400 Z M269,332 L279,302 L269,272 L259,302 Z M259,302 L269,272 L243,290 L233,321 Z M327,253 L295,253 L269,272 L301,272 Z M295,253 L304,222 L279,241 L269,272 Z M304,222 L279,203 L269,173 L295,192 Z M243,253 L253,222 L243,192 L233,222 Z M243,253 L211,253 L185,272 L217,272 Z M175,302 L143,302 L117,321 L149,321 Z M175,302 L143,302 L117,283 L149,283 Z M233,321 L201,321 L175,302 L207,302 Z M117,382 L91,363 L81,332 L107,351 Z M117,382 L127,351 L117,321 L107,351 Z M91,461 L101,431 L91,400 L81,431 Z M91,461 L59,461 L33,480 L65,480 Z M143,461 L153,431 L127,450 L117,480 Z M107,511 L117,480 L91,499 L81,529 Z M175,461 L143,461 L117,480 L149,480 Z M175,400 L143,400 L117,382 L149,382 Z M153,431 L127,412 L117,382 L143,400 Z M243,412 L253,382 L243,351 L233,382 Z M243,412 L211,412 L185,431 L217,431 Z M243,450 L211,450 L185,431 L217,431 Z M243,511 L253,480 L243,450 L233,480 Z M269,492 L279,461 L253,480 L243,511 Z M211,511 L185,492 L175,461 L201,480 Z M201,541 L211,511 L185,529 L175,560 Z M175,560 L143,560 L117,541 L149,541 Z M185,590 L175,621 L149,640 L159,609 Z M185,590 L153,590 L127,609 L159,609 Z M117,541 L127,511 L117,480 L107,511 Z M81,529 L49,529 L23,511 L55,511 Z M101,590 L91,621 L81,590 L91,560 Z M59,560 L33,541 L23,511 L49,529 Z M59,560 L49,590 L23,609 L33,579 Z M91,621 L59,621 L33,640 L65,640 Z M91,658 L59,658 L33,640 L65,640 Z M127,609 L101,590 L91,560 L117,579 Z M243,571 L253,541 L243,511 L233,541 Z M243,571 L211,571 L185,590 L217,590 Z M243,609 L211,609 L185,590 L217,590 Z M279,560 L253,541 L243,511 L269,529 Z M336,480 L311,461 L301,431 L327,450 Z M336,480 L304,480 L279,461 L311,461 Z M362,461 L372,431 L362,400 L352,431 Z M327,412 L336,382 L311,400 L301,431 Z M279,400 L253,382 L243,351 L269,370 Z M420,382 L388,382 L362,400 L394,400 Z M420,382 L388,382 L362,363 L394,363 Z M430,351 L404,332 L394,302 L420,321 Z M478,400 L446,400 L420,382 L452,382 Z M488,332 L498,302 L488,272 L478,302 Z M488,332 L456,332 L430,351 L462,351 Z M514,351 L524,321 L550,302 L540,332 Z M504,382 L514,351 L488,370 L478,400 Z M546,351 L514,351 L540,332 L572,332 Z M514,412 L524,382 L514,351 L504,382 Z M456,431 L430,412 L420,382 L446,400 Z M201,382 L211,351 L185,370 L175,400 Z M211,351 L185,332 L175,302 L201,321 Z M327,192 L295,192 L269,173 L301,173 Z M452,222 L420,222 L446,203 L478,203 Z M488,173 L498,143 L488,112 L478,143 Z M488,173 L498,143 L524,124 L514,154 Z M456,173 L430,154 L420,124 L446,143 Z M488,112 L456,112 L430,93 L462,93 Z M633,44 L665,44 L639,25 L607,25 Z M723,63 L733,33 L759,14 L749,44 Z M759,75 L769,44 L759,14 L749,44 Z M785,93 L817,93 L791,75 L759,75 Z M885,143 L859,124 L849,93 L875,112 Z M911,124 L920,93 L911,63 L901,93 Z M936,143 L968,143 L943,124 L911,124 Z M920,192 L895,173 L885,143 L911,161 Z M920,192 L952,192 L978,173 L946,173 Z M943,222 L952,192 L978,173 L968,203 Z M978,272 L952,253 L943,222 L968,241 Z M1004,253 L1014,222 L1004,192 L994,222 Z M1004,253 L1036,253 L1062,272 L1030,272 Z M1004,192 L1036,192 L1062,173 L1030,173 Z M1030,173 L1062,173 L1036,154 L1004,154 Z M1072,203 L1098,222 L1088,192 L1062,173 Z M1062,272 L1072,241 L1098,222 L1088,253 Z M1072,302 L1104,302 L1130,283 L1098,283 Z M1072,302 L1104,302 L1130,321 L1098,321 Z M1036,351 L1046,321 L1072,302 L1062,332 Z M1046,382 L1072,400 L1062,370 L1036,351 Z M978,332 L988,302 L978,272 L968,302 Z M1014,321 L1046,321 L1072,302 L1040,302 Z M988,302 L1014,321 L1004,290 L978,272 Z M920,351 L895,332 L885,302 L911,321 Z M920,351 L952,351 L978,332 L946,332 Z M885,302 L895,272 L885,241 L875,272 Z M885,302 L895,272 L920,253 L911,283 Z M885,363 L895,332 L885,302 L875,332 Z M817,351 L827,321 L853,302 L843,332 Z M853,302 L827,283 L817,253 L843,272 Z M827,222 L801,203 L791,173 L817,192 Z M827,222 L859,222 L885,203 L853,203 Z M795,222 L827,222 L801,203 L769,203 Z M791,173 L801,143 L827,124 L817,154 Z M759,112 L791,112 L817,93 L785,93 Z M853,143 L885,143 L859,124 L827,124 Z M885,203 L895,173 L885,143 L875,173 Z M853,241 L885,241 L859,222 L827,222 Z M946,272 L978,272 L952,253 L920,253 Z M785,351 L817,351 L791,332 L759,332 Z M1072,400 L1104,400 L1130,382 L1098,382 Z M1072,461 L1104,461 L1130,480 L1098,480 Z M1094,431 L1120,450 L1130,480 L1104,461 Z M1094,431 L1104,400 L1130,382 L1120,412 Z M1130,382 L1140,351 L1130,321 L1120,351 Z M1130,382 L1140,351 L1166,332 L1156,363 Z M1156,400 L1188,400 L1214,382 L1182,382 Z M1146,431 L1156,400 L1166,431 L1156,461 Z M1156,461 L1188,461 L1214,480 L1182,480 Z M1130,480 L1156,499 L1166,529 L1140,511 Z M1166,529 L1198,529 L1224,511 L1192,511 Z M1188,560 L1214,579 L1224,609 L1198,590 Z M1188,560 L1198,529 L1224,511 L1214,541 Z M1188,719 L1214,738 L1224,768 L1198,750 Z M1188,719 L1198,689 L1224,670 L1214,700 Z M1166,750 L1198,750 L1224,768 L1192,768 Z M1156,879 L1188,879 L1214,897 L1182,897 Z M1146,848 L1156,818 L1166,848 L1156,879 Z M1130,897 L1156,916 L1166,947 L1140,928 Z M1130,897 L1120,928 L1130,958 L1140,928 Z M1072,977 L1104,977 L1130,958 L1098,958 Z M1072,977 L1104,977 L1130,996 L1098,996 Z M1062,1007 L1088,1026 L1098,1057 L1072,1038 Z M1014,958 L1046,958 L1072,977 L1040,977 Z M1004,1026 L994,1057 L1004,1087 L1014,1057 Z M1004,1026 L1036,1026 L1062,1007 L1030,1007 Z M1072,1076 L1062,1106 L1088,1087 L1098,1057 Z M1030,1106 L1062,1106 L1036,1125 L1004,1125 Z M988,977 L978,1007 L1004,989 L1014,958 Z M978,947 L968,977 L978,1007 L988,977 Z M1036,928 L1062,947 L1072,977 L1046,958 Z M1156,658 L1188,658 L1214,640 L1182,640 Z M1156,621 L1188,621 L1214,640 L1182,640 Z M1146,590 L1156,560 L1166,590 L1156,621 Z M1120,609 L1130,579 L1156,560 L1146,590 Z M1072,560 L1104,560 L1130,541 L1098,541 Z M1036,511 L1062,529 L1072,560 L1046,541 Z M1036,511 L1046,480 L1072,461 L1062,492 Z M1004,571 L1036,571 L1062,590 L1030,590 Z M994,541 L1004,511 L1014,541 L1004,571 Z M968,560 L978,529 L1004,511 L994,541 Z M1120,511 L1130,480 L1140,511 L1130,541 Z M675,431 L649,412 L640,382 L665,400 Z M675,431 L707,431 L733,412 L701,412 Z M759,1204 L749,1235 L759,1265 L769,1235 Z M723,1216 L749,1235 L759,1265 L733,1246 Z M691,1216 L723,1216 L697,1235 L665,1235 Z M633,1235 L665,1235 L640,1254 L608,1254 Z M701,1186 L691,1216 L665,1235 L675,1204 Z M759,1167 L791,1167 L817,1186 L785,1186 Z M785,1186 L817,1186 L791,1204 L759,1204 Z M633,977 L665,977 L640,996 L608,996 Z M546,928 L514,928 L540,947 L572,947 Z M901,768 L911,738 L920,768 L911,799 Z M572,590 L540,590 L514,609 L546,609 Z M279,879 L269,909 L243,928 L253,897 Z M327,928 L295,928 L269,947 L301,947 Z M259,977 L233,958 L243,989 L269,1007 Z M143,818 L117,799 L127,829 L153,848 Z M107,768 L81,750 L91,780 L117,799 Z M633,461 L665,461 L640,443 L608,443 Z ' ),
  thickShape: new Shape( 'M608,640 L582,621 L556,640 L582,658 Z M608,640 L640,640 L649,670 L617,670 Z M608,640 L640,640 L649,609 L617,609 Z M598,609 L608,579 L582,560 L572,590 Z M598,670 L572,689 L582,719 L608,700 Z M608,579 L640,579 L649,609 L617,609 Z M633,560 L608,541 L582,560 L608,579 Z M665,560 L640,579 L649,609 L675,590 Z M665,560 L675,529 L649,511 L640,541 Z M665,560 L697,560 L707,590 L675,590 Z M691,541 L723,541 L733,511 L701,511 Z M675,529 L649,511 L675,492 L701,511 Z M697,560 L723,541 L733,571 L707,590 Z M749,560 L759,529 L733,511 L723,541 Z M733,511 L759,492 L749,461 L723,480 Z M723,480 L733,450 L707,431 L697,461 Z M759,492 L791,492 L801,461 L769,461 Z M759,529 L733,511 L759,492 L785,511 Z M759,529 L791,529 L801,560 L769,560 Z M701,511 L733,511 L723,480 L691,480 Z M665,461 L675,431 L649,412 L640,443 Z M665,461 L697,461 L707,431 L675,431 Z M649,511 L675,492 L665,461 L640,480 Z M617,511 L649,511 L640,480 L608,480 Z M608,480 L582,461 L608,443 L633,461 Z M608,541 L582,560 L572,529 L598,511 Z M608,541 L640,541 L649,511 L617,511 Z M598,511 L572,492 L546,511 L572,529 Z M598,511 L608,480 L582,461 L572,492 Z M546,511 L514,511 L524,480 L556,480 Z M582,461 L608,443 L598,412 L572,431 Z M582,461 L550,461 L540,431 L572,431 Z M572,431 L582,400 L556,382 L546,412 Z M608,443 L640,443 L649,412 L617,412 Z M550,461 L524,480 L514,450 L540,431 Z M540,431 L514,412 L488,431 L514,450 Z M514,511 L488,492 L462,511 L488,529 Z M514,511 L524,480 L498,461 L488,492 Z M524,541 L498,560 L488,529 L514,511 Z M488,492 L456,492 L446,461 L478,461 Z M478,461 L446,461 L456,431 L488,431 Z M456,492 L430,511 L420,480 L446,461 Z M430,511 L398,511 L388,480 L420,480 Z M420,480 L430,450 L404,431 L394,461 Z M398,511 L372,529 L362,499 L388,480 Z M388,480 L362,461 L336,480 L362,499 Z M362,560 L336,541 L311,560 L336,579 Z M362,560 L372,529 L346,511 L336,541 Z M336,541 L304,541 L295,511 L327,511 Z M394,560 L362,560 L372,529 L404,529 Z M404,590 L372,590 L362,560 L394,560 Z M446,560 L420,541 L394,560 L420,579 Z M446,560 L456,529 L430,511 L420,541 Z M456,590 L430,609 L420,579 L446,560 Z M478,560 L446,560 L456,529 L488,529 Z M488,590 L456,590 L446,560 L478,560 Z M452,640 L420,640 L430,670 L462,670 Z M452,640 L420,640 L430,609 L462,609 Z M504,640 L478,658 L488,689 L514,670 Z M504,640 L478,621 L452,640 L478,658 Z M504,640 L514,609 L488,590 L478,621 Z M488,689 L456,689 L446,719 L478,719 Z M478,719 L446,719 L456,750 L488,750 Z M456,689 L446,719 L420,700 L430,670 Z M446,719 L420,738 L430,768 L456,750 Z M446,719 L420,700 L394,719 L420,738 Z M394,719 L362,719 L372,750 L404,750 Z M404,689 L372,689 L362,719 L394,719 Z M362,719 L336,738 L346,768 L372,750 Z M362,719 L336,700 L311,719 L336,738 Z M336,738 L304,738 L295,768 L327,768 Z M362,658 L352,689 L327,670 L336,640 Z M388,640 L362,621 L336,640 L362,658 Z M336,640 L304,640 L295,609 L327,609 Z M336,640 L304,640 L295,670 L327,670 Z M394,658 L362,658 L372,689 L404,689 Z M420,640 L394,658 L404,689 L430,670 Z M420,640 L430,609 L404,590 L394,621 Z M394,621 L362,621 L372,590 L404,590 Z M362,621 L336,640 L327,609 L352,590 Z M327,609 L336,579 L311,560 L301,590 Z M327,670 L301,689 L311,719 L336,700 Z M304,640 L279,621 L253,640 L279,658 Z M279,658 L269,689 L243,670 L253,640 Z M279,621 L253,640 L243,609 L269,590 Z M269,689 L243,708 L253,738 L279,719 Z M269,689 L243,670 L217,689 L243,708 Z M243,708 L211,708 L201,738 L233,738 Z M243,670 L211,670 L201,640 L233,640 Z M301,689 L269,689 L279,719 L311,719 Z M211,670 L185,689 L175,658 L201,640 Z M201,640 L175,621 L149,640 L175,658 Z M185,689 L153,689 L143,719 L175,719 Z M211,708 L201,738 L175,719 L185,689 Z M159,670 L127,670 L117,640 L149,640 Z M175,719 L149,738 L159,768 L185,750 Z M153,689 L143,719 L117,700 L127,670 Z M127,670 L101,689 L91,658 L117,640 Z M143,719 L117,700 L91,719 L117,738 Z M117,738 L107,768 L81,750 L91,719 Z M91,719 L59,719 L49,689 L81,689 Z M91,719 L59,719 L49,750 L81,750 Z M81,750 L55,768 L65,799 L91,780 Z M59,719 L33,700 L7,719 L33,738 Z M55,768 L23,768 L33,799 L65,799 Z M91,818 L59,818 L49,848 L81,848 Z M117,799 L91,818 L101,848 L127,829 Z M117,799 L91,780 L65,799 L91,818 Z M81,848 L49,848 L59,879 L91,879 Z M117,897 L91,879 L65,897 L91,916 Z M127,867 L117,897 L91,879 L101,848 Z M149,897 L117,897 L127,928 L159,928 Z M159,928 L127,928 L117,958 L149,958 Z M175,879 L149,897 L159,928 L185,909 Z M185,848 L153,848 L143,879 L175,879 Z M175,818 L143,818 L153,848 L185,848 Z M211,867 L201,897 L175,879 L185,848 Z M153,848 L127,829 L101,848 L127,867 Z M243,867 L211,867 L201,897 L233,897 Z M269,848 L243,867 L253,897 L279,879 Z M269,848 L243,829 L217,848 L243,867 Z M233,897 L201,897 L211,928 L243,928 Z M243,928 L211,928 L201,958 L233,958 Z M269,947 L259,977 L233,958 L243,928 Z M233,958 L207,977 L217,1007 L243,989 Z M211,928 L185,909 L159,928 L185,947 Z M185,947 L175,977 L149,958 L159,928 Z M175,977 L149,996 L159,1026 L185,1007 Z M207,977 L175,977 L185,1007 L217,1007 Z M243,1026 L211,1026 L201,1057 L233,1057 Z M269,1007 L243,1026 L253,1057 L279,1038 Z M269,1007 L243,989 L217,1007 L243,1026 Z M233,1057 L201,1057 L211,1087 L243,1087 Z M211,1026 L201,1057 L175,1038 L185,1007 Z M269,1106 L243,1087 L217,1106 L243,1125 Z M279,1076 L269,1106 L243,1087 L253,1057 Z M301,1106 L269,1106 L279,1136 L311,1136 Z M327,1087 L301,1106 L311,1136 L336,1118 Z M336,1057 L304,1057 L295,1087 L327,1087 Z M327,1026 L295,1026 L304,1057 L336,1057 Z M362,1076 L352,1106 L327,1087 L336,1057 Z M304,1057 L279,1038 L253,1057 L279,1076 Z M388,1057 L362,1038 L336,1057 L362,1076 Z M394,1076 L362,1076 L372,1106 L404,1106 Z M404,1106 L394,1136 L420,1155 L430,1125 Z M404,1106 L372,1106 L362,1136 L394,1136 Z M420,1057 L394,1076 L404,1106 L430,1087 Z M430,1087 L456,1106 L430,1125 L404,1106 Z M430,1026 L420,1057 L394,1038 L404,1007 Z M478,1076 L446,1076 L456,1106 L488,1106 Z M462,1026 L452,1057 L478,1076 L488,1045 Z M462,1026 L430,1026 L420,1057 L452,1057 Z M488,1007 L514,1026 L488,1045 L462,1026 Z M504,1057 L478,1076 L488,1106 L514,1087 Z M546,1026 L514,1026 L524,1057 L556,1057 Z M556,1057 L546,1087 L572,1106 L582,1076 Z M556,1057 L524,1057 L514,1087 L546,1087 Z M572,1007 L546,1026 L556,1057 L582,1038 Z M582,1038 L608,1057 L582,1076 L556,1057 Z M582,977 L572,1007 L598,1026 L608,996 Z M582,977 L550,977 L540,1007 L572,1007 Z M572,947 L540,947 L550,977 L582,977 Z M608,958 L633,977 L608,996 L582,977 Z M608,996 L640,996 L649,1026 L617,1026 Z M524,958 L550,977 L524,996 L498,977 Z M514,928 L488,947 L498,977 L524,958 Z M514,928 L488,909 L462,928 L488,947 Z M498,977 L488,1007 L514,1026 L524,996 Z M488,947 L456,947 L446,977 L478,977 Z M478,977 L446,977 L456,1007 L488,1007 Z M456,947 L446,977 L420,958 L430,928 Z M446,977 L420,996 L430,1026 L456,1007 Z M446,977 L420,958 L394,977 L420,996 Z M394,977 L362,977 L372,1007 L404,1007 Z M404,1007 L372,1007 L362,1038 L394,1038 Z M404,947 L372,947 L362,977 L394,977 Z M362,977 L336,958 L311,977 L336,996 Z M336,996 L327,1026 L301,1007 L311,977 Z M352,1007 L327,1026 L336,1057 L362,1038 Z M362,916 L352,947 L327,928 L336,897 Z M388,897 L362,879 L336,897 L362,916 Z M336,897 L304,897 L295,928 L327,928 Z M394,916 L362,916 L372,947 L404,947 Z M420,897 L394,916 L404,947 L430,928 Z M430,867 L420,897 L394,879 L404,848 Z M452,897 L420,897 L430,928 L462,928 Z M478,879 L452,897 L462,928 L488,909 Z M488,848 L456,848 L446,879 L478,879 Z M478,818 L446,818 L456,848 L488,848 Z M514,867 L504,897 L478,879 L488,848 Z M456,848 L430,829 L404,848 L430,867 Z M420,799 L394,818 L404,848 L430,829 Z M404,848 L372,848 L362,879 L394,879 Z M394,818 L362,818 L372,848 L404,848 Z M362,818 L352,848 L327,829 L336,799 Z M352,848 L327,867 L336,897 L362,879 Z M352,848 L327,829 L301,848 L327,867 Z M301,848 L269,848 L279,879 L311,879 Z M327,768 L295,768 L304,799 L336,799 Z M311,818 L279,818 L269,848 L301,848 Z M295,768 L269,787 L279,818 L304,799 Z M295,768 L269,750 L243,768 L269,787 Z M279,818 L269,848 L243,829 L253,799 Z M243,768 L211,768 L201,799 L233,799 Z M233,738 L201,738 L211,768 L243,768 Z M233,799 L201,799 L211,829 L243,829 Z M211,768 L185,750 L159,768 L185,787 Z M185,787 L175,818 L149,799 L159,768 Z M201,799 L175,818 L185,848 L211,829 Z M159,768 L127,768 L117,799 L149,799 Z M149,738 L117,738 L127,768 L159,768 Z M304,738 L295,768 L269,750 L279,719 Z M388,799 L362,780 L336,799 L362,818 Z M398,768 L388,799 L362,780 L372,750 Z M430,768 L398,768 L388,799 L420,799 Z M456,787 L446,818 L420,799 L430,768 Z M488,787 L456,787 L446,818 L478,818 Z M514,768 L488,787 L498,818 L524,799 Z M514,768 L488,750 L462,768 L488,787 Z M524,738 L514,768 L488,750 L498,719 Z M546,768 L514,768 L524,799 L556,799 Z M556,738 L524,738 L514,768 L546,768 Z M572,689 L582,658 L556,640 L546,670 Z M572,689 L540,689 L550,719 L582,719 Z M608,700 L640,700 L649,670 L617,670 Z M608,738 L598,768 L572,750 L582,719 Z M608,738 L640,738 L649,768 L617,768 Z M540,689 L514,708 L524,738 L550,719 Z M540,689 L514,670 L488,689 L514,708 Z M617,768 L649,768 L640,799 L608,799 Z M633,719 L608,700 L582,719 L608,738 Z M598,768 L572,787 L582,818 L608,799 Z M598,768 L572,750 L546,768 L572,787 Z M649,768 L640,799 L665,818 L675,787 Z M665,719 L640,738 L649,768 L675,750 Z M665,719 L675,689 L649,670 L640,700 Z M665,719 L697,719 L707,689 L675,689 Z M675,750 L701,768 L675,787 L649,768 Z M691,738 L723,738 L733,768 L701,768 Z M697,719 L707,689 L733,708 L723,738 Z M733,670 L759,689 L733,708 L707,689 Z M733,670 L743,640 L769,658 L759,689 Z M759,689 L791,689 L801,719 L769,719 Z M785,670 L817,670 L827,640 L795,640 Z M749,719 L723,738 L733,768 L759,750 Z M791,689 L817,670 L827,700 L801,719 Z M801,719 L827,738 L853,719 L827,700 Z M817,670 L827,640 L853,658 L843,689 Z M843,689 L875,689 L885,719 L853,719 Z M843,689 L875,689 L885,658 L853,658 Z M817,609 L843,590 L853,621 L827,640 Z M859,640 L885,658 L911,640 L885,621 Z M885,621 L895,590 L920,609 L911,640 Z M885,658 L911,640 L920,670 L895,689 Z M911,640 L943,640 L952,670 L920,670 Z M911,640 L943,640 L952,609 L920,609 Z M885,719 L911,738 L936,719 L911,700 Z M911,700 L920,670 L946,689 L936,719 Z M911,738 L943,738 L952,768 L920,768 Z M875,750 L885,719 L911,738 L901,768 Z M843,750 L875,750 L885,719 L853,719 Z M817,768 L791,787 L801,818 L827,799 Z M817,768 L849,768 L859,799 L827,799 Z M827,799 L817,829 L843,848 L853,818 Z M791,750 L801,719 L827,738 L817,768 Z M849,768 L875,750 L885,780 L859,799 Z M859,799 L885,818 L911,799 L885,780 Z M885,818 L911,799 L920,829 L895,848 Z M895,848 L920,867 L946,848 L920,829 Z M895,848 L885,879 L911,897 L920,867 Z M911,799 L943,799 L952,768 L920,768 Z M853,818 L885,818 L875,848 L843,848 Z M843,848 L817,867 L827,897 L853,879 Z M843,848 L875,848 L885,879 L853,879 Z M817,829 L843,848 L817,867 L791,848 Z M759,848 L733,867 L743,897 L769,879 Z M759,848 L791,848 L801,879 L769,879 Z M769,879 L759,909 L785,928 L795,897 Z M733,829 L759,848 L733,867 L707,848 Z M769,818 L801,818 L791,848 L759,848 Z M759,787 L791,787 L801,818 L769,818 Z M733,768 L723,799 L749,818 L759,787 Z M759,750 L785,768 L759,787 L733,768 Z M759,750 L791,750 L801,719 L769,719 Z M723,799 L697,818 L707,848 L733,829 Z M701,768 L733,768 L723,799 L691,799 Z M665,818 L640,836 L649,867 L675,848 Z M665,818 L697,818 L707,848 L675,848 Z M675,848 L665,879 L691,897 L701,867 Z M608,836 L640,836 L649,867 L617,867 Z M608,799 L633,818 L608,836 L582,818 Z M582,818 L572,848 L598,867 L608,836 Z M582,818 L550,818 L540,848 L572,848 Z M572,848 L546,867 L556,897 L582,879 Z M550,818 L540,848 L514,829 L524,799 Z M540,848 L514,829 L488,848 L514,867 Z M582,879 L608,897 L582,916 L556,897 Z M546,867 L514,867 L524,897 L556,897 Z M608,897 L640,897 L649,928 L617,928 Z M617,928 L649,928 L640,958 L608,958 Z M598,928 L572,947 L582,977 L608,958 Z M617,867 L649,867 L640,897 L608,897 Z M649,928 L640,958 L665,977 L675,947 Z M665,879 L691,897 L665,916 L640,897 Z M675,947 L707,947 L697,977 L665,977 Z M691,897 L665,916 L675,947 L701,928 Z M691,897 L723,897 L733,928 L701,928 Z M701,867 L733,867 L723,897 L691,897 Z M733,928 L723,958 L749,977 L759,947 Z M759,909 L785,928 L759,947 L733,928 Z M759,947 L791,947 L801,977 L769,977 Z M723,958 L749,977 L723,996 L697,977 Z M749,977 L723,996 L733,1026 L759,1007 Z M759,1007 L785,1026 L759,1045 L733,1026 Z M743,1057 L733,1087 L759,1106 L769,1076 Z M701,1026 L733,1026 L723,1057 L691,1057 Z M675,1007 L665,1038 L691,1057 L701,1026 Z M691,1057 L665,1076 L675,1106 L701,1087 Z M691,1057 L723,1057 L733,1087 L701,1087 Z M665,1038 L691,1057 L665,1076 L640,1057 Z M649,1087 L640,1118 L665,1136 L675,1106 Z M608,1057 L640,1057 L649,1087 L617,1087 Z M617,1087 L649,1087 L640,1118 L608,1118 Z M598,1087 L572,1106 L582,1136 L608,1118 Z M617,1026 L649,1026 L640,1057 L608,1057 Z M608,1118 L633,1136 L608,1155 L582,1136 Z M572,1106 L540,1106 L550,1136 L582,1136 Z M582,1136 L572,1167 L598,1186 L608,1155 Z M540,1106 L514,1125 L524,1155 L550,1136 Z M514,1087 L540,1106 L514,1125 L488,1106 Z M488,1106 L456,1106 L446,1136 L478,1136 Z M498,1136 L488,1167 L514,1186 L524,1155 Z M478,1136 L446,1136 L456,1167 L488,1167 Z M446,1136 L420,1155 L430,1186 L456,1167 Z M420,1155 L388,1155 L398,1186 L430,1186 Z M430,1186 L420,1216 L446,1235 L456,1204 Z M430,1186 L398,1186 L388,1216 L420,1216 Z M362,1136 L336,1155 L346,1186 L372,1167 Z M362,1136 L336,1118 L311,1136 L336,1155 Z M372,1167 L398,1186 L372,1204 L346,1186 Z M488,1204 L456,1204 L446,1235 L478,1235 Z M514,1186 L488,1204 L498,1235 L524,1216 Z M488,1167 L514,1186 L488,1204 L462,1186 Z M524,1216 L514,1246 L540,1265 L550,1235 Z M546,1186 L514,1186 L524,1216 L556,1216 Z M572,1167 L598,1186 L572,1204 L546,1186 Z M556,1155 L524,1155 L514,1186 L546,1186 Z M582,1235 L550,1235 L540,1265 L572,1265 Z M598,1186 L572,1204 L582,1235 L608,1216 Z M608,1216 L633,1235 L608,1254 L582,1235 Z M608,1155 L640,1155 L649,1186 L617,1186 Z M617,1186 L649,1186 L640,1216 L608,1216 Z M649,1186 L640,1216 L665,1235 L675,1204 Z M665,1136 L640,1155 L649,1186 L675,1167 Z M675,1167 L701,1186 L675,1204 L649,1186 Z M691,1155 L723,1155 L733,1186 L701,1186 Z M675,1106 L707,1106 L697,1136 L665,1136 Z M707,1106 L697,1136 L723,1155 L733,1125 Z M733,1087 L759,1106 L733,1125 L707,1106 Z M759,1106 L791,1106 L801,1136 L769,1136 Z M769,1136 L801,1136 L791,1167 L759,1167 Z M749,1136 L723,1155 L733,1186 L759,1167 Z M769,1076 L801,1076 L791,1106 L759,1106 Z M801,1136 L791,1167 L817,1186 L827,1155 Z M817,1087 L843,1106 L817,1125 L791,1106 Z M827,1057 L817,1087 L843,1106 L853,1076 Z M853,1076 L885,1076 L875,1106 L843,1106 Z M885,1038 L911,1057 L885,1076 L859,1057 Z M911,1057 L885,1076 L895,1106 L920,1087 Z M911,1057 L943,1057 L952,1087 L920,1087 Z M885,1136 L875,1167 L901,1186 L911,1155 Z M843,1106 L817,1125 L827,1155 L853,1136 Z M843,1106 L875,1106 L885,1136 L853,1136 Z M827,1155 L859,1155 L849,1186 L817,1186 Z M817,1186 L791,1204 L801,1235 L827,1216 Z M817,1186 L849,1186 L859,1216 L827,1216 Z M875,1167 L901,1186 L875,1204 L849,1186 Z M911,1155 L943,1155 L952,1186 L920,1186 Z M968,1136 L943,1155 L952,1186 L978,1167 Z M978,1106 L968,1136 L994,1155 L1004,1125 Z M1004,1087 L1030,1106 L1004,1125 L978,1106 Z M946,1106 L978,1106 L968,1136 L936,1136 Z M920,1087 L911,1118 L936,1136 L946,1106 Z M911,1118 L936,1136 L911,1155 L885,1136 Z M968,1038 L994,1057 L968,1076 L943,1057 Z M978,1007 L1004,1026 L1030,1007 L1004,989 Z M978,1007 L968,1038 L994,1057 L1004,1026 Z M920,1026 L952,1026 L943,1057 L911,1057 Z M895,1007 L885,1038 L911,1057 L920,1026 Z M911,958 L936,977 L911,996 L885,977 Z M853,977 L885,977 L875,1007 L843,1007 Z M843,947 L875,947 L885,977 L853,977 Z M827,958 L853,977 L827,996 L801,977 Z M843,1007 L817,1026 L827,1057 L853,1038 Z M843,1007 L875,1007 L885,1038 L853,1038 Z M817,928 L791,947 L801,977 L827,958 Z M801,977 L791,1007 L817,1026 L827,996 Z M769,977 L801,977 L791,1007 L759,1007 Z M827,897 L817,928 L843,947 L853,916 Z M795,897 L827,897 L817,928 L785,928 Z M853,916 L885,916 L875,947 L843,947 Z M885,879 L911,897 L885,916 L859,897 Z M911,897 L885,916 L895,947 L920,928 Z M911,897 L943,897 L952,928 L920,928 Z M920,928 L911,958 L936,977 L946,947 Z M943,897 L968,879 L978,909 L952,928 Z M952,928 L978,947 L1004,928 L978,909 Z M978,848 L1004,867 L1030,848 L1004,829 Z M978,848 L968,879 L994,897 L1004,867 Z M968,818 L994,799 L1004,829 L978,848 Z M1004,829 L1036,829 L1046,799 L1014,799 Z M1004,867 L1036,867 L1046,897 L1014,897 Z M946,848 L978,848 L968,879 L936,879 Z M936,818 L968,818 L978,848 L946,848 Z M1014,897 L1046,897 L1036,928 L1004,928 Z M1036,867 L1062,848 L1072,879 L1046,897 Z M1062,848 L1094,848 L1104,879 L1072,879 Z M1062,848 L1094,848 L1104,818 L1072,818 Z M1072,879 L1062,909 L1088,928 L1098,897 Z M1036,829 L1046,799 L1072,818 L1062,848 Z M1094,848 L1120,867 L1146,848 L1120,829 Z M1120,829 L1130,799 L1156,818 L1146,848 Z M1120,867 L1146,848 L1156,879 L1130,897 Z M1130,799 L1156,818 L1182,799 L1156,780 Z M1156,780 L1166,750 L1192,768 L1182,799 Z M1156,818 L1188,818 L1198,848 L1166,848 Z M1088,768 L1120,768 L1130,799 L1098,799 Z M1088,768 L1120,768 L1130,738 L1098,738 Z M1062,787 L1088,768 L1098,799 L1072,818 Z M1062,750 L1072,719 L1098,738 L1088,768 Z M1130,738 L1156,719 L1166,750 L1140,768 Z M1156,719 L1188,719 L1198,750 L1166,750 Z M1156,719 L1188,719 L1198,689 L1166,689 Z M1104,719 L1130,738 L1156,719 L1130,700 Z M1094,689 L1120,670 L1130,700 L1104,719 Z M1120,670 L1130,640 L1156,658 L1146,689 Z M1130,640 L1156,658 L1182,640 L1156,621 Z M1088,670 L1120,670 L1130,640 L1098,640 Z M1062,689 L1094,689 L1104,719 L1072,719 Z M1088,609 L1120,609 L1130,640 L1098,640 Z M1062,590 L1094,590 L1104,560 L1072,560 Z M1046,640 L1072,658 L1098,640 L1072,621 Z M1036,609 L1062,590 L1072,621 L1046,640 Z M1036,670 L1046,640 L1072,658 L1062,689 Z M1004,609 L1036,609 L1046,640 L1014,640 Z M1004,670 L1036,670 L1046,640 L1014,640 Z M978,689 L1004,708 L1030,689 L1004,670 Z M1004,708 L1036,708 L1046,738 L1014,738 Z M1036,708 L1062,689 L1072,719 L1046,738 Z M1036,768 L1062,787 L1088,768 L1062,750 Z M1004,768 L1036,768 L1046,799 L1014,799 Z M1004,768 L1036,768 L1046,738 L1014,738 Z M968,719 L978,689 L1004,708 L994,738 Z M952,768 L978,787 L1004,768 L978,750 Z M943,738 L968,719 L978,750 L952,768 Z M943,799 L952,768 L978,787 L968,818 Z M936,719 L968,719 L978,689 L946,689 Z M943,640 L968,658 L994,640 L968,621 Z M968,621 L978,590 L1004,609 L994,640 Z M968,658 L994,640 L1004,670 L978,689 Z M978,590 L1004,609 L1030,590 L1004,571 Z M911,579 L936,560 L946,590 L920,609 Z M885,560 L911,579 L936,560 L911,541 Z M875,529 L901,511 L911,541 L885,560 Z M911,541 L943,541 L952,511 L920,511 Z M843,529 L875,529 L885,560 L853,560 Z M843,590 L875,590 L885,621 L853,621 Z M843,590 L875,590 L885,560 L853,560 Z M817,511 L827,480 L801,461 L791,492 Z M817,511 L849,511 L859,480 L827,480 Z M801,560 L827,579 L853,560 L827,541 Z M791,529 L817,511 L827,541 L801,560 Z M791,590 L801,560 L827,579 L817,609 Z M759,590 L791,590 L801,560 L769,560 Z M733,609 L759,590 L769,621 L743,640 Z M733,609 L707,590 L733,571 L759,590 Z M785,609 L817,609 L827,640 L795,640 Z M743,640 L769,658 L795,640 L769,621 Z M691,640 L665,658 L675,689 L701,670 Z M691,640 L665,621 L640,640 L665,658 Z M691,640 L701,609 L675,590 L665,621 Z M691,640 L723,640 L733,670 L701,670 Z M691,640 L723,640 L733,609 L701,609 Z M827,480 L853,461 L843,431 L817,450 Z M849,511 L859,480 L885,499 L875,529 Z M859,480 L885,499 L911,480 L885,461 Z M885,461 L895,431 L920,450 L911,480 Z M911,480 L943,480 L952,511 L920,511 Z M936,461 L968,461 L978,431 L946,431 Z M943,480 L968,461 L978,492 L952,511 Z M952,511 L978,529 L1004,511 L978,492 Z M968,461 L978,431 L1004,450 L994,480 Z M978,431 L1004,412 L994,382 L968,400 Z M978,431 L1004,450 L1030,431 L1004,412 Z M1004,412 L1036,412 L1046,382 L1014,382 Z M1004,450 L1036,450 L1046,480 L1014,480 Z M946,431 L978,431 L968,400 L936,400 Z M911,382 L920,351 L895,332 L885,363 Z M911,382 L943,382 L952,351 L920,351 Z M895,431 L920,412 L911,382 L885,400 Z M895,431 L920,450 L946,431 L920,412 Z M885,400 L859,382 L885,363 L911,382 Z M827,382 L853,363 L843,332 L817,351 Z M843,431 L853,400 L827,382 L817,412 Z M843,431 L875,431 L885,400 L853,400 Z M853,461 L885,461 L875,431 L843,431 Z M817,450 L791,431 L817,412 L843,431 Z M759,431 L769,400 L743,382 L733,412 Z M759,431 L791,431 L801,400 L769,400 Z M769,461 L801,461 L791,431 L759,431 Z M733,450 L707,431 L733,412 L759,431 Z M769,400 L795,382 L785,351 L759,370 Z M759,370 L733,351 L759,332 L785,351 Z M795,382 L827,382 L817,351 L785,351 Z M733,351 L759,332 L749,302 L723,321 Z M723,321 L697,302 L723,283 L749,302 Z M759,332 L791,332 L801,302 L769,302 Z M675,332 L707,332 L697,302 L665,302 Z M691,382 L701,351 L675,332 L665,363 Z M691,382 L723,382 L733,351 L701,351 Z M701,412 L733,412 L723,382 L691,382 Z M665,400 L640,382 L665,363 L691,382 Z M649,351 L675,332 L665,302 L640,321 Z M608,382 L640,382 L649,351 L617,351 Z M598,351 L608,321 L582,302 L572,332 Z M617,412 L649,412 L640,382 L608,382 Z M582,400 L556,382 L582,363 L608,382 Z M617,351 L649,351 L640,321 L608,321 Z M608,321 L582,302 L608,283 L633,302 Z M582,302 L608,283 L598,253 L572,272 Z M582,302 L550,302 L540,272 L572,272 Z M665,302 L675,272 L649,253 L640,283 Z M665,302 L697,302 L707,272 L675,272 Z M675,272 L701,253 L691,222 L665,241 Z M759,272 L733,253 L759,234 L785,253 Z M743,222 L769,203 L759,173 L733,192 Z M701,253 L733,253 L723,222 L691,222 Z M691,222 L701,192 L675,173 L665,203 Z M691,222 L723,222 L733,192 L701,192 Z M665,241 L639,222 L665,203 L691,222 Z M675,173 L707,173 L697,143 L665,143 Z M733,192 L707,173 L733,154 L759,173 Z M759,173 L791,173 L801,143 L769,143 Z M707,173 L733,154 L723,124 L697,143 Z M749,143 L759,112 L733,93 L723,124 Z M733,93 L759,75 L749,44 L723,63 Z M691,124 L723,124 L733,93 L701,93 Z M665,143 L675,112 L649,93 L639,124 Z M701,93 L733,93 L723,63 L691,63 Z M675,112 L649,93 L675,75 L701,93 Z M665,44 L697,44 L707,14 L675,14 Z M649,93 L675,75 L665,44 L639,63 Z M617,93 L649,93 L639,63 L607,63 Z M607,63 L582,44 L607,25 L633,44 Z M607,124 L639,124 L649,93 L617,93 Z M598,93 L607,63 L582,44 L572,75 Z M582,143 L607,124 L598,93 L572,112 Z M607,161 L582,143 L607,124 L633,143 Z M617,192 L649,192 L639,161 L607,161 Z M598,192 L607,161 L582,143 L572,173 Z M649,192 L675,173 L665,143 L639,161 Z M607,222 L639,222 L649,192 L617,192 Z M617,253 L649,253 L639,222 L607,222 Z M582,241 L556,222 L582,203 L607,222 Z M608,283 L640,283 L649,253 L617,253 Z M572,272 L582,241 L556,222 L546,253 Z M546,253 L514,253 L524,222 L556,222 Z M504,222 L514,192 L488,173 L478,203 Z M488,272 L462,253 L488,234 L514,253 Z M514,192 L488,173 L514,154 L540,173 Z M556,222 L582,203 L572,173 L546,192 Z M556,222 L524,222 L514,192 L546,192 Z M572,173 L540,173 L550,143 L582,143 Z M540,173 L550,143 L524,124 L514,154 Z M514,93 L524,63 L498,44 L488,75 Z M498,143 L524,124 L514,93 L488,112 Z M556,124 L524,124 L514,93 L546,93 Z M546,93 L514,93 L524,63 L556,63 Z M572,112 L546,93 L572,75 L598,93 Z M582,44 L550,44 L540,14 L572,14 Z M524,63 L550,44 L540,14 L514,33 Z M488,75 L456,75 L446,44 L478,44 Z M430,93 L456,75 L446,44 L420,63 Z M430,93 L398,93 L388,63 L420,63 Z M420,124 L388,124 L398,93 L430,93 Z M372,112 L346,93 L372,75 L398,93 Z M362,143 L336,124 L311,143 L336,161 Z M362,143 L372,112 L346,93 L336,124 Z M404,173 L430,154 L420,124 L394,143 Z M404,173 L372,173 L362,143 L394,143 Z M430,192 L404,173 L430,154 L456,173 Z M394,203 L362,203 L372,173 L404,173 Z M420,222 L430,192 L404,173 L394,203 Z M362,203 L336,222 L327,192 L352,173 Z M336,222 L304,222 L295,192 L327,192 Z M388,222 L362,203 L336,222 L362,241 Z M352,272 L362,241 L336,222 L327,253 Z M404,272 L372,272 L362,241 L394,241 Z M430,253 L404,272 L394,241 L420,222 Z M394,302 L362,302 L372,272 L404,272 Z M404,332 L372,332 L362,302 L394,302 Z M362,302 L336,283 L311,302 L336,321 Z M336,283 L311,302 L301,272 L327,253 Z M362,363 L336,382 L327,351 L352,332 Z M327,351 L336,321 L311,302 L301,332 Z M336,382 L304,382 L295,351 L327,351 Z M301,332 L269,332 L279,302 L311,302 Z M295,351 L269,332 L243,351 L269,370 Z M304,382 L279,400 L269,370 L295,351 Z M269,332 L243,351 L233,321 L259,302 Z M243,351 L211,351 L201,321 L233,321 Z M269,272 L243,253 L217,272 L243,290 Z M269,272 L279,241 L253,222 L243,253 Z M311,302 L279,302 L269,272 L301,272 Z M327,253 L295,253 L304,222 L336,222 Z M304,222 L279,203 L253,222 L279,241 Z M279,203 L253,222 L243,192 L269,173 Z M269,173 L243,154 L217,173 L243,192 Z M243,253 L211,253 L201,222 L233,222 Z M233,222 L201,222 L211,192 L243,192 Z M211,253 L185,272 L175,241 L201,222 Z M175,302 L185,272 L159,253 L149,283 Z M185,332 L159,351 L149,321 L175,302 Z M207,302 L175,302 L185,272 L217,272 Z M233,321 L243,290 L217,272 L207,302 Z M117,382 L91,363 L65,382 L91,400 Z M81,431 L49,431 L59,400 L91,400 Z M91,461 L59,461 L49,431 L81,431 Z M117,480 L91,461 L65,480 L91,499 Z M117,480 L127,450 L101,431 L91,461 Z M159,511 L127,511 L117,480 L149,480 Z M175,461 L143,461 L153,431 L185,431 Z M185,492 L159,511 L149,480 L175,461 Z M201,480 L211,450 L185,431 L175,461 Z M185,431 L153,431 L143,400 L175,400 Z M175,400 L185,370 L159,351 L149,382 Z M211,412 L185,431 L175,400 L201,382 Z M153,431 L127,412 L101,431 L127,450 Z M243,412 L211,412 L201,382 L233,382 Z M269,431 L243,412 L217,431 L243,450 Z M269,431 L279,400 L253,382 L243,412 Z M233,480 L201,480 L211,450 L243,450 Z M243,511 L211,511 L201,480 L233,480 Z M233,541 L201,541 L211,511 L243,511 Z M211,511 L185,492 L159,511 L185,529 Z M211,571 L185,590 L175,560 L201,541 Z M175,560 L185,529 L159,511 L149,541 Z M185,590 L153,590 L143,560 L175,560 Z M149,541 L117,541 L127,511 L159,511 Z M143,560 L117,541 L91,560 L117,579 Z M153,590 L127,609 L117,579 L143,560 Z M117,541 L91,560 L81,529 L107,511 Z M91,560 L59,560 L49,529 L81,529 Z M91,560 L59,560 L49,590 L81,590 Z M81,529 L91,499 L65,480 L55,511 Z M59,560 L33,541 L7,560 L33,579 Z M59,621 L33,640 L23,609 L49,590 Z M59,658 L49,689 L23,670 L33,640 Z M91,621 L59,621 L49,590 L81,590 Z M91,658 L59,658 L49,689 L81,689 Z M117,640 L91,621 L65,640 L91,658 Z M127,609 L117,640 L91,621 L101,590 Z M159,609 L127,609 L117,640 L149,640 Z M55,511 L23,511 L33,480 L65,480 Z M211,609 L201,640 L175,621 L185,590 Z M243,571 L211,571 L201,541 L233,541 Z M243,609 L211,609 L201,640 L233,640 Z M269,590 L243,571 L217,590 L243,609 Z M269,590 L279,560 L253,541 L243,571 Z M301,590 L269,590 L279,560 L311,560 Z M304,541 L279,560 L269,529 L295,511 Z M295,511 L269,492 L243,511 L269,529 Z M295,511 L304,480 L279,461 L269,492 Z M327,511 L295,511 L304,480 L336,480 Z M362,461 L336,480 L327,450 L352,431 Z M311,461 L279,461 L269,431 L301,431 Z M301,431 L269,431 L279,400 L311,400 Z M279,461 L253,480 L243,450 L269,431 Z M352,431 L327,412 L301,431 L327,450 Z M352,431 L362,400 L336,382 L327,412 Z M388,382 L362,363 L336,382 L362,400 Z M404,431 L372,431 L362,400 L394,400 Z M420,382 L430,351 L404,332 L394,363 Z M430,412 L404,431 L394,400 L420,382 Z M394,363 L362,363 L372,332 L404,332 Z M452,382 L420,382 L430,351 L462,351 Z M478,400 L488,370 L462,351 L452,382 Z M488,332 L456,332 L446,302 L478,302 Z M514,351 L488,332 L462,351 L488,370 Z M514,351 L524,321 L498,302 L488,332 Z M524,321 L498,302 L524,283 L550,302 Z M556,382 L582,363 L572,332 L546,351 Z M556,382 L524,382 L514,351 L546,351 Z M572,332 L540,332 L550,302 L582,302 Z M546,412 L514,412 L524,382 L556,382 Z M514,412 L488,431 L478,400 L504,382 Z M488,431 L456,431 L446,400 L478,400 Z M456,431 L430,412 L404,431 L430,450 Z M498,302 L524,283 L514,253 L488,272 Z M478,302 L446,302 L456,272 L488,272 Z M456,332 L430,351 L420,321 L446,302 Z M446,302 L420,283 L394,302 L420,321 Z M446,302 L456,272 L430,253 L420,283 Z M394,461 L362,461 L372,431 L404,431 Z M233,382 L201,382 L211,351 L243,351 Z M211,351 L185,332 L159,351 L185,370 Z M159,351 L127,351 L117,321 L149,321 Z M149,382 L117,382 L127,351 L159,351 Z M127,412 L101,431 L91,400 L117,382 Z M301,173 L269,173 L279,143 L311,143 Z M327,192 L336,161 L311,143 L301,173 Z M462,253 L488,234 L478,203 L452,222 Z M462,253 L430,253 L420,222 L452,222 Z M478,203 L446,203 L456,173 L488,173 Z M488,173 L456,173 L446,143 L478,143 Z M446,143 L456,112 L430,93 L420,124 Z M478,143 L446,143 L456,112 L488,112 Z M488,112 L462,93 L488,75 L514,93 Z M723,63 L733,33 L707,14 L697,44 Z M759,75 L791,75 L801,44 L769,44 Z M817,93 L827,63 L801,44 L791,75 Z M817,93 L849,93 L859,63 L827,63 Z M875,112 L849,93 L875,75 L901,93 Z M885,143 L911,124 L901,93 L875,112 Z M911,124 L943,124 L952,93 L920,93 Z M968,143 L978,112 L952,93 L943,124 Z M978,173 L1004,154 L994,124 L968,143 Z M946,173 L978,173 L968,143 L936,143 Z M911,161 L885,143 L911,124 L936,143 Z M920,192 L946,173 L936,143 L911,161 Z M911,222 L920,192 L895,173 L885,203 Z M911,222 L943,222 L952,192 L920,192 Z M968,241 L943,222 L968,203 L994,222 Z M978,272 L1004,253 L994,222 L968,241 Z M978,272 L1004,290 L1030,272 L1004,253 Z M994,222 L1004,192 L978,173 L968,203 Z M1004,253 L1036,253 L1046,222 L1014,222 Z M1004,192 L978,173 L1004,154 L1030,173 Z M1014,222 L1046,222 L1036,192 L1004,192 Z M1046,222 L1072,203 L1062,173 L1036,192 Z M1046,222 L1072,241 L1098,222 L1072,203 Z M1098,283 L1130,283 L1120,253 L1088,253 Z M1104,302 L1130,321 L1156,302 L1130,283 Z M1140,351 L1166,332 L1156,302 L1130,321 Z M1072,302 L1098,283 L1088,253 L1062,272 Z M1088,351 L1120,351 L1130,321 L1098,321 Z M1098,382 L1130,382 L1120,351 L1088,351 Z M1062,332 L1072,302 L1098,321 L1088,351 Z M1036,351 L1062,370 L1088,351 L1062,332 Z M1004,351 L1036,351 L1046,321 L1014,321 Z M1014,382 L1046,382 L1036,351 L1004,351 Z M978,332 L988,302 L1014,321 L1004,351 Z M1014,321 L1040,302 L1030,272 L1004,290 Z M1040,302 L1072,302 L1062,272 L1030,272 Z M952,351 L978,370 L1004,351 L978,332 Z M946,332 L978,332 L968,302 L936,302 Z M936,302 L946,272 L920,253 L911,283 Z M936,302 L968,302 L978,272 L946,272 Z M920,351 L946,332 L936,302 L911,321 Z M911,321 L885,302 L911,283 L936,302 Z M853,363 L885,363 L875,332 L843,332 Z M843,332 L875,332 L885,302 L853,302 Z M817,351 L827,321 L801,302 L791,332 Z M853,302 L885,302 L875,272 L843,272 Z M843,272 L853,241 L827,222 L817,253 Z M843,272 L875,272 L885,241 L853,241 Z M827,321 L801,302 L827,283 L853,302 Z M801,302 L827,283 L817,253 L791,272 Z M769,302 L801,302 L791,272 L759,272 Z M827,222 L853,203 L843,173 L817,192 Z M785,253 L795,222 L769,203 L759,234 Z M785,253 L817,253 L827,222 L795,222 Z M769,203 L801,203 L791,173 L759,173 Z M817,192 L791,173 L817,154 L843,173 Z M801,143 L827,124 L817,93 L791,112 Z M827,124 L859,124 L849,93 L817,93 Z M769,143 L801,143 L791,112 L759,112 Z M759,112 L733,93 L759,75 L785,93 Z M843,173 L853,143 L827,124 L817,154 Z M843,173 L875,173 L885,143 L853,143 Z M853,203 L885,203 L875,173 L843,173 Z M885,241 L859,222 L885,203 L911,222 Z M895,272 L920,253 L911,222 L885,241 Z M920,253 L952,253 L943,222 L911,222 Z M943,382 L952,351 L978,370 L968,400 Z M1072,400 L1098,382 L1088,351 L1062,370 Z M1036,412 L1046,382 L1072,400 L1062,431 Z M1062,431 L1094,431 L1104,461 L1072,461 Z M1062,431 L1094,431 L1104,400 L1072,400 Z M1036,450 L1062,431 L1072,461 L1046,480 Z M1094,431 L1120,450 L1146,431 L1120,412 Z M1120,412 L1130,382 L1156,400 L1146,431 Z M1120,450 L1146,431 L1156,461 L1130,480 Z M1130,382 L1156,400 L1182,382 L1156,363 Z M1156,363 L1166,332 L1192,351 L1182,382 Z M1156,400 L1188,400 L1198,431 L1166,431 Z M1188,400 L1214,382 L1224,412 L1198,431 Z M1188,461 L1198,431 L1224,450 L1214,480 Z M1214,480 L1240,461 L1249,492 L1224,511 Z M1156,461 L1188,461 L1198,431 L1166,431 Z M1130,480 L1156,499 L1182,480 L1156,461 Z M1182,480 L1214,480 L1224,511 L1192,511 Z M1156,499 L1182,480 L1192,511 L1166,529 Z M1156,560 L1188,560 L1198,590 L1166,590 Z M1156,560 L1188,560 L1198,529 L1166,529 Z M1188,560 L1214,579 L1240,560 L1214,541 Z M1214,541 L1224,511 L1249,529 L1240,560 Z M1214,579 L1240,560 L1249,590 L1224,609 Z M1214,640 L1246,640 L1256,670 L1224,670 Z M1214,640 L1246,640 L1256,609 L1224,609 Z M1214,700 L1224,670 L1249,689 L1240,719 Z M1188,719 L1214,738 L1240,719 L1214,700 Z M1214,738 L1240,719 L1249,750 L1224,768 Z M1214,799 L1224,768 L1249,787 L1240,818 Z M1182,799 L1214,799 L1224,768 L1192,768 Z M1188,818 L1214,799 L1224,829 L1198,848 Z M1188,879 L1198,848 L1224,867 L1214,897 Z M1156,879 L1188,879 L1198,848 L1166,848 Z M1130,897 L1156,916 L1182,897 L1156,879 Z M1156,916 L1182,897 L1192,928 L1166,947 Z M1140,928 L1130,958 L1156,977 L1166,947 Z M1104,977 L1130,996 L1156,977 L1130,958 Z M1088,928 L1120,928 L1130,958 L1098,958 Z M1072,977 L1062,1007 L1088,1026 L1098,996 Z M1062,947 L1088,928 L1098,958 L1072,977 Z M1098,996 L1130,996 L1120,1026 L1088,1026 Z M1040,977 L1072,977 L1062,1007 L1030,1007 Z M1014,958 L1004,989 L1030,1007 L1040,977 Z M1004,1026 L1036,1026 L1046,1057 L1014,1057 Z M1014,1057 L1046,1057 L1036,1087 L1004,1087 Z M994,1057 L968,1076 L978,1106 L1004,1087 Z M1036,1026 L1062,1007 L1072,1038 L1046,1057 Z M1046,1057 L1072,1076 L1098,1057 L1072,1038 Z M1046,1057 L1036,1087 L1062,1106 L1072,1076 Z M1004,928 L1036,928 L1046,958 L1014,958 Z M978,947 L1004,928 L1014,958 L988,977 Z M946,947 L978,947 L968,977 L936,977 Z M936,977 L911,996 L920,1026 L946,1007 Z M936,977 L968,977 L978,1007 L946,1007 Z M1036,928 L1062,947 L1088,928 L1062,909 Z M1098,897 L1130,897 L1120,928 L1088,928 Z M1188,658 L1214,640 L1224,670 L1198,689 Z M1156,658 L1188,658 L1198,689 L1166,689 Z M1156,621 L1188,621 L1198,590 L1166,590 Z M1188,621 L1198,590 L1224,609 L1214,640 Z M1120,609 L1146,590 L1156,621 L1130,640 Z M1094,590 L1104,560 L1130,579 L1120,609 Z M1104,560 L1130,579 L1156,560 L1130,541 Z M1130,541 L1140,511 L1166,529 L1156,560 Z M1062,529 L1088,511 L1098,541 L1072,560 Z M1036,511 L1062,529 L1088,511 L1062,492 Z M1036,571 L1046,541 L1072,560 L1062,590 Z M1004,511 L1036,511 L1046,541 L1014,541 Z M1004,511 L1036,511 L1046,480 L1014,480 Z M1004,571 L1036,571 L1046,541 L1014,541 Z M968,560 L994,541 L1004,571 L978,590 Z M943,541 L952,511 L978,529 L968,560 Z M936,560 L968,560 L978,590 L946,590 Z M1062,492 L1072,461 L1098,480 L1088,511 Z M1088,511 L1120,511 L1130,541 L1098,541 Z M1088,511 L1120,511 L1130,480 L1098,480 Z M1036,253 L1046,222 L1072,241 L1062,272 Z M749,302 L759,272 L733,253 L723,283 Z M675,431 L701,412 L691,382 L665,400 Z M759,1204 L791,1204 L801,1235 L769,1235 Z M723,1216 L697,1235 L707,1265 L733,1246 Z M665,1235 L697,1235 L707,1265 L675,1265 Z M701,1186 L733,1186 L723,1216 L691,1216 Z M733,1186 L723,1216 L749,1235 L759,1204 Z M759,1167 L785,1186 L759,1204 L733,1186 Z M785,1026 L759,1045 L769,1076 L795,1057 Z M785,1026 L817,1026 L827,1057 L795,1057 Z M665,977 L640,996 L649,1026 L675,1007 Z M665,977 L697,977 L707,1007 L675,1007 Z M556,897 L546,928 L572,947 L582,916 Z M556,897 L524,897 L514,928 L546,928 Z M546,670 L514,670 L524,640 L556,640 Z M546,609 L514,609 L524,640 L556,640 Z M572,590 L546,609 L556,640 L582,621 Z M572,590 L540,590 L550,560 L582,560 Z M540,590 L514,571 L488,590 L514,609 Z M540,590 L550,560 L524,541 L514,571 Z M304,897 L295,928 L269,909 L279,879 Z M295,928 L269,909 L243,928 L269,947 Z M327,928 L301,947 L311,977 L336,958 Z M301,947 L269,947 L279,977 L311,977 Z M311,977 L279,977 L269,1007 L301,1007 Z M556,541 L524,541 L514,511 L546,511 Z ' )
};

export interface IsohedralBoardTiling {
  tilingType: number;
  name: string;
  scale?: number;
  parameters?: number[];
}

// TODO: see pages like https://www.jaapsch.net/tilings/mclean/html/ih27.html
export const isohedralTilings: IsohedralBoardTiling[] = [
  {
    tilingType: 20,
    name: 'Hexagonal'
  },
  {
    tilingType: 21,
    name: 'Floret Pentagonal'
  },
  {
    tilingType: 27,
    name: 'Cairo Pentagonal'
  },
  {
    tilingType: 30,
    name: 'Deltoidal Trihexagonal'
  },
  {
    tilingType: 33,
    name: 'Rhombille'
  },
  {
    tilingType: 30,
    name: 'Cairo B',
    parameters: [ 0.3162393162393163 ],
    scale: 2
  },
  {
    tilingType: 77,
    name: 'Kisrhombille',
    scale: 2
  },
  {
    tilingType: 82,
    name: 'Sq. Triangular',
    scale: 1.3
  },
  {
    tilingType: 93,
    name: 'Triangular',
    scale: 1.3
  },
  {
    tilingType: 76,
    name: 'Square'
  },
  {
    tilingType: 74,
    name: 'Diamond',
    scale: 1.5
  },
  // {
  //   tilingType: 16,
  //   name: 'Hexagonal B',
  //   parameters: [ 0 ],
  //   scale: 5
  // },
  // {
  //   tilingType: 40,
  //   name: 'Triakis Triangular',
  //   scale: 2
  // },
  // {
  //   tilingType: 46,
  //   name: 'Skew Square A',
  //   parameters: [ 0.5, 0.2308, 0.5, 0.75 ]
  // },
  // {
  //   tilingType: 56,
  //   name: 'Skew Square B',
  //   parameters: [ 0.75 ]
  // },
];

export class TiledBoard extends PolygonalBoard implements TBoard {
  public constructor(
    public readonly tilingType: number,
    public readonly bounds: Bounds2,
    scale: number,
    acceptCondition: ( polygon: Vector2[] ) => boolean,
    parameters?: number[]
  ) {
    assertEnabled() && assert( tilingTypes.includes( tilingType ) );

    const tiling = new IsohedralTiling( tilingType );

    console.log( `params IH${tilingType}`, tiling.getParameters() );

    parameters = parameters || tiling.getParameters();
    // const parameters = tiling.getParameters();
    // TODO: adjust parameters!!! Look into it?
    tiling.setParameters( parameters );

    // tiling.numParameters();
    // tiling.numEdgeShapes();
    // tiling.getEdgeShape( idx );
    // tiling.numVertices();
    // tiling.vertices();
    // tiling.getVertex( idx )
    // tiling.numAspects();
    // tiling.getAspectTransform( idx );

    // for ( const shape of tiling.shape() ) {
    //   // console.log( shape.id, shape.T, shape.shape, shape.rev );
    //   console.log( shape.T[ 2 ], shape.T[ 5 ] );
    //   console.log( shape.T[ 0 ] + shape.T[ 2 ], shape.T[3] + shape.T[ 5 ] );
    // }
    console.log( tiling.getVertex( 0 ) );
    console.log( tiling.getVertex( 1 ) );
    console.log( tiling.getVertex( 2 ) );
    console.log( tiling.getVertex( 3 ) );

    // TODO: Look at the edge shape (J/U/S/I) and index, and try creating various mappings!!!
    // TODO: Also, SUBDIVIDE our prototile in some cases!!!
    const prototilePolygon: Vector2[] = tiling.vertices().map( vertexFromV );

    const polygons: Vector2[][] = [];

    for ( const instance of tiling.fillRegionBounds( bounds.minX, bounds.minY, bounds.maxX, bounds.maxY ) ) {
      const matrix = matrixFromT( instance.T );
      // TODO: make @types/tactile-js?
      const tilePolygon = prototilePolygon.map( vertex => matrix.timesVector2( vertex ) );

      if ( acceptCondition( tilePolygon ) ) {
        polygons.push( tilePolygon );
      }
    }

    super( polygons, scale );
  }
}
