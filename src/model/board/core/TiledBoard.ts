
// @ts-expect-error
import { EdgeShape, tilingTypes, IsohedralTiling } from 'tactile-js';
import { scene } from '../../../view/scene.ts';
import { Node, Path } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import { Bounds2, Matrix3, Vector2 } from 'phet-lib/dot';
import { TBoard } from './TBoard.ts';
import { TStructure } from './TStructure.ts';
import { BaseBoard } from './BaseBoard.ts';
import { createBoardDescriptor, TFaceDescriptor, TVertexDescriptor } from './createBoardDescriptor.ts';
import { getCoordinateClusteredMap } from '../../../util/getCoordinateCluteredMap.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

console.log( EdgeShape );

// see https://observablehq.com/@mattdzugan/dithering-on-non-square-pixels for ideas

// 19, 25, 26, 28, 31

// http://localhost/tactile-js/demo/interactivedemo.html

console.log( 'J', EdgeShape.J );
console.log( 'U', EdgeShape.U );
console.log( 'S', EdgeShape.S );
console.log( 'I', EdgeShape.I );

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
  console.log( 'parameters', parameters );
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
    x: 50,
    y: 50
  } );

  // for ( const shape of tiling.shape() ) {
  //   console.log( shape.id, shape.T, shape.shape, shape.rev );
  // }

  const prototileShape = Shape.polygon( tiling.vertices().map( vertexFromV ) );

  const bounds = new Bounds2( 0, 0, 10, 7 );
  const epsilonBounds = bounds.dilated( 0.0002 );

  for ( const instance of tiling.fillRegionBounds( bounds.minX, bounds.minY, bounds.maxX, bounds.maxY ) ) {
    const tileShape = prototileShape.transformed( matrixFromT( instance.T ) );

    if ( epsilonBounds.containsBounds( tileShape.bounds ) ) {
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

export class TiledBoard extends BaseBoard<TStructure> implements TBoard {
  public constructor(
    public readonly tilingIndex: number,
    public readonly bounds: Bounds2,
    public readonly scale: number
  ) {
    const tiling = new IsohedralTiling( tilingTypes[ tilingIndex ] );

    const parameters = tiling.getParameters();
    console.log( 'parameters', parameters );
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

    // for ( const shape of tiling.shape() ) {
    //   console.log( shape.id, shape.T, shape.shape, shape.rev );
    // }

    // TODO: Look at the edge shape (J/U/S/I) and index, and try creating various mappings!!!
    // TODO: Also, SUBDIVIDE our prototile in some cases!!!
    const prototilePolygon: Vector2[] = tiling.vertices().map( vertexFromV );

    const epsilonBounds = bounds.dilated( 0.0002 );

    const polygons: Vector2[][] = [];

    for ( const instance of tiling.fillRegionBounds( bounds.minX, bounds.minY, bounds.maxX, bounds.maxY ) ) {
      const matrix = matrixFromT( instance.T );
      // TODO: make @types/tactile-js?
      const tilePolygon = prototilePolygon.map( vertex => matrix.timesVector2( vertex ) );

      const tileBounds = Bounds2.NOTHING.copy();
      tilePolygon.forEach( vertex => tileBounds.addPoint( vertex ) );

      if ( epsilonBounds.containsBounds( tileBounds ) ) {
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

    super( createBoardDescriptor( vertexDescriptors, faceDescriptors ) );
  }
}
