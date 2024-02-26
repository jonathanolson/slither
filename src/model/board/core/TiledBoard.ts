// @ts-expect-error
import { EdgeShape, IsohedralTiling, tilingTypes } from 'tactile-js';
import { scene } from '../../../view/scene.ts';
import { Node, Path } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import { Bounds2, Matrix3, Vector2 } from 'phet-lib/dot';
import { TBoard } from './TBoard.ts';
import { TStructure } from './TStructure.ts';
import { BaseBoard } from './BaseBoard.ts';
import { createBoardDescriptor, getCentroid, rescaleProtoDescriptorMinimum, TFaceDescriptor, TVertexDescriptor } from './createBoardDescriptor.ts';
import { getCoordinateClusteredMap } from '../../../util/getCoordinateCluteredMap.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import _ from '../../../workarounds/_.ts';

// console.log( EdgeShape );

// see https://observablehq.com/@mattdzugan/dithering-on-non-square-pixels for ideas

// 19, 25, 26, 28, 31

// http://localhost/tactile-js/demo/interactivedemo.html
console.log( 'U', EdgeShape.U );
console.log( 'S', EdgeShape.S );
console.log( 'I', EdgeShape.I );
console.log( 'J', EdgeShape.J );

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
}

export const squareTiling: PeriodicBoardTiling = {
  name: 'Square',
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
  name: 'Hexagonal',
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
  name: 'SmallRhombitrihexagonal',
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
  name: 'TruncatedSquare',
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
  name: 'SnubSquare',
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
  name: 'TruncatedHexagonal',
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
  name: 'ElongatedTriangular',
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
  name: 'GreatRhombitrihexagonal',
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
  name: 'SnubHexagonal',
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
  name: 'DeltoidalTrihexagonal',
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
  name: 'TetrakisSquare',
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
  name: 'CairoPentagonal',
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
  name: 'TriakisTriangular',
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
  name: 'PrismaticPentagonal',
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
  name: 'BisectedHexagonal',
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
  name: 'FloretPentagonal',
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
  name: 'FalseCubic',
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
  translation: new Vector2( 1.5, 1.5 * Math.sqrt( 3 ) )
};

export const trihexAndHexTiling: PeriodicBoardTiling = {
  name: 'TrihexAndHex',
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

export const tilingTest = () => {
  const container = new Node( {
    scale: 80,
    x: 400,
    y: 400
  } );

  const unitPolygons = trihexAndHexTiling.polygons;
  const basisA = trihexAndHexTiling.basisA;
  const basisB = trihexAndHexTiling.basisB;

  _.range( -2, 3 ).forEach( a => {
    _.range( -2, 3 ).forEach( b => {
      unitPolygons.forEach( ( polygon, i ) => {
        const mappedPolygon = polygon.map( v => v.plus( basisA.timesScalar( a ) ).plus( basisB.timesScalar( b ) ) );
        container.addChild( new Path( Shape.polygon( mappedPolygon ), {
          fill: [ 'red', 'green', 'blue', 'yellow', 'purple', 'orange' ][ ( i + a * 3 + b * 2 + 1000 ) % 6 ],
          opacity: 0.6
        } ) );
      } );
    } );
  } );

  const showTest = false;

  if ( showTest ) {
    scene.addChild( container );
  }
};

export const tilingTest2 = () => {
  // const tiling = new IsohedralTiling( tilingTypes[ 31 ] );
  const tiling = new IsohedralTiling( tilingTypes[ 19 ] );

  const parameters = tiling.getParameters();
  // console.log( 'parameters', parameters );
  // TODO: adjust parameters!!! Look into it?
  tiling.setParameters( parameters );

  // tiling.numParameters();
  // tiling.numEdgeShapes();
  // tiling.getEdgeShape( idx );
  // tiling.numVertices();
  // tiling.vertices;
  // tiling.getVertex( idx )
  // tiling.numAspects();
  // tiling.getAspectTransform( idx );

  const container = new Node( {
    scale: 20,
    x: 150,
    y: 150
  } );

  // for ( const shape of tiling.shape() ) {
  //   console.log( shape.id, shape.T, shape.shape, shape.rev );
  // }

  const prototilePolygon: Vector2[] = tiling.vertices().map( vertexFromV );
  const prototileShape = Shape.polygon( tiling.vertices().map( vertexFromV ) );

  const bounds = new Bounds2( -5, -5, 5, 5 );

  for ( const instance of tiling.fillRegionBounds( bounds.minX, bounds.minY, bounds.maxX, bounds.maxY ) ) {
    const tilePolygon = prototilePolygon.map( vertex => matrixFromT( instance.T ).timesVector2( vertex ) );
    const tileShape = prototileShape.transformed( matrixFromT( instance.T ) );

    // if ( epsilonBounds.containsBounds( tileShape.bounds ) ) {
    if ( getCentroid( tilePolygon ).getMagnitude() < 5 ) {
      container.addChild( new Path( tileShape, {
        fill: [ 'red', 'green', 'blue' ][ tiling.getColour( instance.t1, instance.t2, instance.aspect ) ]
      } ) );
    }
  }

  const showTest = false;

  if ( showTest ) {
    scene.addChild( container );
  }
};

// TODO: more general tiling, that we can region-fill with(!)

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

export class TiledBoard extends BaseBoard<TStructure> implements TBoard {
  public constructor(
    public readonly tilingType: number,
    public readonly bounds: Bounds2,
    public readonly scale: number,
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

    const xValues = polygons.flatMap( polygon => polygon.map( vertex => vertex.x ) );
    const yValues = polygons.flatMap( polygon => polygon.map( vertex => vertex.y ) );

    // TODO: improve epsilon
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
