import { TPatternVertex } from './TPatternVertex.ts';
import { Vector2 } from 'phet-lib/dot';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import _ from '../../workarounds/_.ts';
import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';

export interface TPlanarPatternMap {
  vertexMap: Map<TPatternVertex, Vector2>;
  edgeMap: Map<TPatternEdge, [ Vector2, Vector2 ]>; // only non-exit edges
  sectorMap: Map<TPatternSector, [ Vector2, Vector2, Vector2 ]>; // start, middle, end, anticlockwise:true, with endAngle > startAngle
  faceMap: Map<TPatternFace, Vector2[]>;
}

const sectorDistance2 = 0.3;

export const getSingleEdgePlanarPatternMap = ( patternBoard: TPatternBoard ): TPlanarPatternMap => {
  assertEnabled() && assert( patternBoard.vertices.length === 0 );
  assertEnabled() && assert( patternBoard.sectors.length === 0 );
  assertEnabled() && assert( patternBoard.faces.length === 2 );
  assertEnabled() && assert( patternBoard.edges.length === 1 );

  return {
    vertexMap: new Map(),
    edgeMap: new Map( [ [ patternBoard.edges[ 0 ], [ new Vector2( 0, 0 ), new Vector2( 1, 0 ) ] ] ] ),
    sectorMap: new Map(),
    faceMap: new Map( [
      [ patternBoard.faces[ 0 ], [ new Vector2( 0, 0 ), new Vector2( 1, 0 ), new Vector2( 0.5, sectorDistance2 ) ] ],
      [ patternBoard.faces[ 1 ], [ new Vector2( 0, 0 ), new Vector2( 0.5, -sectorDistance2 ), new Vector2( 1, 0 ) ] ]
    ] )
  };
};

export const getVertexPlanarPatternMap = ( patternBoard: TPatternBoard ): TPlanarPatternMap => {
  assertEnabled() && assert( patternBoard.vertices.length === 1 );

  const edges = patternBoard.edges.filter( edge => !edge.isExit );
  const order = edges.length;
  const displayOrder = ( order === 2 && patternBoard.sectors.length ) ? 3 : order;

  const vertexMap = new Map( [ [ patternBoard.vertices[ 0 ], Vector2.ZERO ] ] );
  const edgeMap = new Map<TPatternEdge, [ Vector2, Vector2 ]>();
  patternBoard.edges.forEach( ( edge, index ) => {
    edgeMap.set( edge, [ Vector2.ZERO, Vector2.createPolar( 1, 2 * Math.PI * index / displayOrder ) ] );
  } );

  const sectorMap = new Map<TPatternSector, [ Vector2, Vector2, Vector2 ]>();
  patternBoard.sectors.forEach( sector => {
    const edgeA = sector.edges[ 0 ];
    const edgeB = sector.edges[ 1 ];

    // Correct order, so that it goes logically anticlockwise TODO: verify
    if ( ( edgeA.index + 1 ) % order !== edgeB.index ) {
      sectorMap.set( sector, [ edgeMap.get( edgeA )![ 1 ], Vector2.ZERO, edgeMap.get( edgeB )![ 1 ] ] );
    }
    else {
      sectorMap.set( sector, [ edgeMap.get( edgeB )![ 1 ], Vector2.ZERO, edgeMap.get( edgeA )![ 1 ] ] );
    }
  } );

  const faceMap = new Map();
  if ( order === 2 && patternBoard.sectors.length === 0 ) {
    edges[ 0 ].faces.forEach( ( face, i ) => {
      faceMap.set( face, i === 0 ? [
        new Vector2( 0, 0 ), new Vector2( 1, 0 ), new Vector2( 0.5, sectorDistance2 )
      ] : [
        new Vector2( 0, 0 ), new Vector2( 0.5, -sectorDistance2 ), new Vector2( 1, 0 )
      ] );
    } );
    edges[ 1 ].faces.forEach( ( face, i ) => {
      faceMap.set( face, i === 0 ? [
        new Vector2( 0, 0 ), new Vector2( -0.5, sectorDistance2 ), new Vector2( -1, 0 )
      ] : [
        new Vector2( 0, 0 ), new Vector2( -1, 0 ), new Vector2( -0.5, -sectorDistance2 )
      ] );
    } );
  }
  else {
    // Guaranteed sectors (at least one for each edge)
    patternBoard.sectors.forEach( ( sector, i ) => {
      const points = sectorMap.get( sector )!.slice();

      // Tweak 2nd sector for 2-edge
      if ( i === 1 && order === 2 ) {
        points[ 1 ] = points[ 0 ].plus( points[ 2 ] ).negated();
      }

      faceMap.set( sector.face, points );
    } );

    // Now remaining faces should have at least one defined
    patternBoard.faces.forEach( face => {
      if ( !faceMap.has( face ) ) {
        assertEnabled() && assert( face.edges.length === 1 );

        const edge = face.edges[ 0 ];
        const edgeVectors = edgeMap.get( edge )!;

        assertEnabled() && assert( edge.sectors.length === 1 );

        const oppositeSector = edge.sectors[ 0 ];

        if ( false ) {
          // TODO: check!
          faceMap.set( face, faceMap.get( oppositeSector.face )!.slice().reverse() );
        }
        else {
          const perpendicular = edgeVectors[ 1 ].perpendicular;

          let dotSum = 0;
          sectorMap.get( oppositeSector )!.forEach( vector => dotSum += vector.dot( perpendicular ) );

          const middle = edgeVectors[ 1 ].timesScalar( 0.5 );

          // Whatever, don't worry about the sign?
          // TODO: maybe fix up the sign
          faceMap.set( face, [ edgeVectors[ 1 ], Vector2.ZERO, middle.plus( perpendicular.times( -Math.sign( dotSum ) * 0.5 * Math.sin( 2 * Math.PI / 3 / order ) ) ) ] );
        }
      }
    } );
  }

  return { vertexMap, edgeMap, sectorMap, faceMap };
};

export const serializePlanarPatternMap = ( map: TPlanarPatternMap ): string => {

  if ( assertEnabled() ) {
    const verifyOrder = ( array: ( TPatternVertex | TPatternEdge | TPatternSector | TPatternFace )[] ) => {
      assert( array.every( item => item.index < array.length ) );
    };
    verifyOrder( [ ...map.vertexMap.keys() ] );
    verifyOrder( [ ...map.edgeMap.keys() ] );
    verifyOrder( [ ...map.sectorMap.keys() ] );
    verifyOrder( [ ...map.faceMap.keys() ] );
  }

  const orderedVertices = _.sortBy( [ ...map.vertexMap.keys() ], vertex => vertex.index );
  const orderedEdges = _.sortBy( [ ...map.edgeMap.keys() ], edge => edge.index );
  const orderedSectors = _.sortBy( [ ...map.sectorMap.keys() ], sector => sector.index );
  const orderedFaces = _.sortBy( [ ...map.faceMap.keys() ], face => face.index );

  const pointToArray = ( point: Vector2 ) => [ point.x, point.y ];
  const pointToArrayOrIndex = ( point: Vector2 ) => {
    for ( let i = 0; i < orderedVertices.length; i++ ) {
      if ( map.vertexMap.get( orderedVertices[ i ] )!.equals( point ) ) {
        return i;
      }
    }
    return pointToArray( point );
  };

  const result = JSON.stringify( [
    orderedVertices.map( vertex => pointToArray( map.vertexMap.get( vertex )! ) ),
    orderedEdges.map( edge => map.edgeMap.get( edge )!.map( pointToArrayOrIndex ) ),
    orderedSectors.map( sector => map.sectorMap.get( sector )!.map( pointToArray ) ),
    orderedFaces.map( face => map.faceMap.get( face )!.map( pointToArray ) )
  ] );

  if ( assertEnabled() ) {
    const deserialized = deserializePlanarPatternMap( result, { vertices: orderedVertices, edges: orderedEdges, sectors: orderedSectors, faces: orderedFaces, descriptor: {} as unknown as TPatternBoardDescriptor } );

    const vectorArrayEqual = ( a: Vector2[], b: Vector2[] ): boolean => {
      if ( a.length !== b.length ) {
        return false;
      }

      for ( let i = 0; i < a.length; i++ ) {
        if ( !a[ i ].equals( b[ i ] ) ) {
          return false;
        }
      }

      return true;
    };

    orderedVertices.forEach( vertex => assert( map.vertexMap.get( vertex )!.equals( deserialized.vertexMap.get( vertex )! ) ) );
    orderedEdges.forEach( edge => assert( vectorArrayEqual( map.edgeMap.get( edge )!, deserialized.edgeMap.get( edge )! ) ) );
    orderedSectors.forEach( sector => assert( vectorArrayEqual( map.sectorMap.get( sector )!, deserialized.sectorMap.get( sector )! ) ) );
    orderedFaces.forEach( face => assert( vectorArrayEqual( map.faceMap.get( face )!, deserialized.faceMap.get( face )! ) ) );
  }

  return result;
};

export const deserializePlanarPatternMap = ( string: string, patternBoard: TPatternBoard ): TPlanarPatternMap => {

  const data = JSON.parse( string );

  const vertexData = data[ 0 ];
  const edgeData = data[ 1 ];
  const sectorData = data[ 2 ];
  const faceData = data[ 3 ];

  const vertexMap = new Map<TPatternVertex, Vector2>();
  const edgeMap = new Map<TPatternEdge, [ Vector2, Vector2 ]>();
  const sectorMap = new Map<TPatternSector, [ Vector2, Vector2, Vector2 ]>();
  const faceMap = new Map<TPatternFace, Vector2[]>();

  vertexData.forEach( ( point: any, index: number ) => {
    vertexMap.set( patternBoard.vertices[ index ], new Vector2( point[ 0 ], point[ 1 ] ) );
  } );

  const toPoint = ( point: number | [ number, number ] ) => {
    if ( typeof point === 'number' ) {
      return vertexMap.get( patternBoard.vertices[ point ] )!;
    }
    else {
      return new Vector2( point[ 0 ], point[ 1 ] );
    }
  };

  edgeData.forEach( ( points: any, index: number ) => {
    edgeMap.set( patternBoard.edges[ index ], [ toPoint( points[ 0 ] ), toPoint( points[ 1 ] ) ] );
  } );

  sectorData.forEach( ( points: any, index: number ) => {
    sectorMap.set( patternBoard.sectors[ index ], [ toPoint( points[ 0 ] ), toPoint( points[ 1 ] ), toPoint( points[ 2 ] ) ] );
  } );

  faceData.forEach( ( points: any, index: number ) => {
    faceMap.set( patternBoard.faces[ index ], points.map( ( point: any ) => new Vector2( point[ 0 ], point[ 1 ] ) ) );
  } );

  return { vertexMap, edgeMap, sectorMap, faceMap };
};
