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

export const tilingTest = () => {
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
