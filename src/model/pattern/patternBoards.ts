import { BasePatternBoard } from './BasePatternBoard.ts';
import { planarPatternMaps } from './planarPatternMaps.ts';
import { getSingleEdgePlanarPatternMap, getVertexPlanarPatternMap, TPlanarPatternMap } from './TPlanarPatternMap.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import _ from '../../workarounds/_.ts';
import { arePatternBoardsIsomorphic } from './arePatternBoardsIsomorphic.ts';
import { FacesPatternBoard } from './FacesPatternBoard.ts';
import { HexagonalBoard } from '../board/hex/HexagonalBoard.ts';
import { getPeriodicTilingGenerator, PolygonGenerator } from '../../view/GenerateNode.ts';
import { cairoPentagonalTiling, deltoidalTrihexagonalTiling, elongatedTriangularTiling, floretPentagonalTiling, PolygonalBoard, portugalTiling, prismaticPentagonalTiling, rhombilleTiling, smallRhombitrihexagonalTiling, snubSquareTiling, tetrakisSquareTiling, triangularTiling, trihexagonalTiling } from '../board/core/TiledBoard.ts';
import { SquareBoard } from '../board/square/SquareBoard.ts';

export const edgePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 0,
  type: 'edge'
}, 'single-edge' );

export const vertexExit2NoSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 2,
  spans: []
}, 'vertex-2-exit-none' );

export const vertexExit2OneSectorPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 2,
  spans: [ 1 ]
}, 'vertex-2-exit-one' );

export const vertexExit3TwoAdjacentSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 3,
  spans: [ 2 ]
}, 'vertex-3-exit-two-adjacent' );

export const vertexExit4TwoOppositeSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 4,
  spans: [ 1, 1 ]
}, 'vertex-4-exit-two-opposite' );

export const vertexExit4ThreeAdjacentSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 4,
  spans: [ 3 ]
}, 'vertex-4-exit-three-adjacent' );

export const vertexExit5TwoOnePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 5,
  spans: [ 2, 1 ]
}, 'vertex-5-exit-two-one' );

export const vertexExit5FourPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 5,
  spans: [ 4 ]
}, 'vertex-5-exit-four' );

export const vertexExit6TriplePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 1, 1, 1 ]
}, 'vertex-6-exit-triple' );

export const vertexExit6TwoTwoPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 2, 2 ]
}, 'vertex-6-exit-two-two' );

export const vertexExit6ThreeOnePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 3, 1 ]
}, 'vertex-6-exit-three-one' );

export const vertexExit6FivePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 5 ]
}, 'vertex-6-exit-five' );

export const vertexNonExit2PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 2
}, 'vertex-2' );

export const vertexNonExit3PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 3
}, 'vertex-3' );

export const vertexNonExit4PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 4
}, 'vertex-4' );

export const vertexNonExit5PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 5
}, 'vertex-5' );

export const vertexNonExit6PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 6
}, 'vertex-6' );

export const vertexExitPatternBoards = [
  vertexExit2NoSectorsPatternBoard,
  vertexExit2OneSectorPatternBoard,
  vertexExit3TwoAdjacentSectorsPatternBoard,
  vertexExit4TwoOppositeSectorsPatternBoard,
  vertexExit4ThreeAdjacentSectorsPatternBoard,
  vertexExit5TwoOnePatternBoard,
  vertexExit5FourPatternBoard,
  vertexExit6TriplePatternBoard,
  vertexExit6TwoTwoPatternBoard,
  vertexExit6ThreeOnePatternBoard,
  vertexExit6FivePatternBoard,
];

export const vertexNonExitPatternBoards = [
  vertexNonExit2PatternBoard,
  vertexNonExit3PatternBoard,
  vertexNonExit4PatternBoard,
  vertexNonExit5PatternBoard,
  vertexNonExit6PatternBoard,
];

export const basicPatternBoards = [
  edgePatternBoard,
  ...vertexExitPatternBoards,
  ...vertexNonExitPatternBoards,
];

const boardFromPolygonGenerator = ( generator: PolygonGenerator ) => {
  // TODO: simplify this board generation
  const polygons = generator.generate( {
    // TODO: make this variable
    width: 20,
    height: 20
  } );

  return new PolygonalBoard( polygons, generator.scale ?? 1 );
};

// TODO: faster way in the future?
const standardPatternBoards: TPatternBoard[] = [];

export const getStandardDescribedPatternBoard = ( descriptor: TPatternBoardDescriptor ): TPatternBoard | null => {
  return standardPatternBoards.find( patternBoard => _.isEqual( patternBoard.descriptor, descriptor ) ) ?? null;
};

export const getStandardIsomorphicPatternBoard = ( patternBoard: TPatternBoard ): TPatternBoard | null => {
  const boardFromDescriptor = getStandardDescribedPatternBoard( patternBoard.descriptor );
  if ( boardFromDescriptor ) {
    return boardFromDescriptor;
  }

  return standardPatternBoards.find( otherPatternBoard => arePatternBoardsIsomorphic( patternBoard, otherPatternBoard ) ) ?? null;
};

export const getStandardNamedPatternBoard = ( name: string ): TPatternBoard | null => {
  return standardPatternBoards.find( patternBoard => patternBoard.name === name ) ?? null;
};

// Replaces isomorphic pattern boards with their standard versions
export const registerStandardPatternBoard = ( patternBoard: TPatternBoard, planarPatternMap: TPlanarPatternMap ): TPatternBoard => {
  const standardPatternBoard = getStandardIsomorphicPatternBoard( patternBoard );

  if ( standardPatternBoard ) {
    return standardPatternBoard;
  }
  else {
    standardPatternBoards.push( patternBoard );
    planarPatternMaps.set( patternBoard, planarPatternMap );
    return patternBoard;
  }
};

// Replaces isomorphic pattern boards with their standard versions
export const getRegisteredGenerations = ( name: string, generations: FacesPatternBoard[][] ): TPatternBoard[][] => {
  return generations.map( ( generation, generationIndex ) => {
    return generation.map( ( patternBoard, index ) => {

      patternBoard.name = `${name}-${generationIndex}-${index}`;

      return registerStandardPatternBoard( patternBoard, patternBoard.planarPatternMap );
    } );
  } );
};

registerStandardPatternBoard( edgePatternBoard, getSingleEdgePlanarPatternMap( edgePatternBoard ) );
vertexExitPatternBoards.forEach( patternBoard => registerStandardPatternBoard( patternBoard, getVertexPlanarPatternMap( patternBoard ) ) );
vertexNonExitPatternBoards.forEach( patternBoard => registerStandardPatternBoard( patternBoard, getVertexPlanarPatternMap( patternBoard ) ) );

// "each face order is isomorphic to others of the same order" and "no vertex orders greater than 6
export const getTriangularBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( triangularTiling ) ), n );
export const getSquareBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), n );
export const getCairoBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( cairoPentagonalTiling ) ), n );
export const getHexagonalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( new HexagonalBoard( 10, 1, true ), n );
export const getRhombilleBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( rhombilleTiling ) ), n );
export const getSnubSquareBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( snubSquareTiling ) ), n );
export const getTrihexagonalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( trihexagonalTiling ) ), n );
export const getFloretPentagonalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( floretPentagonalTiling ) ), n );
export const getDeltoidalTrihexagonalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( deltoidalTrihexagonalTiling ) ), n );
export const getPortugalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( portugalTiling ) ), n );
export const getRhombitrihexagonalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( smallRhombitrihexagonalTiling ) ), n );
export const getPrismaticPentagonalBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( prismaticPentagonalTiling ) ), n );
export const getElongatedTriangularBoardGenerations = ( n: number ) => FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( elongatedTriangularTiling ) ), n );

// ORDER IMPORTANT(!)
export const standardSquareBoardGenerations = getRegisteredGenerations( 'square', getSquareBoardGenerations( 5 ) );
export const standardHexagonalBoardGenerations = getRegisteredGenerations( 'hexagonal', getHexagonalBoardGenerations( 4 ) );
export const standardTriangularBoardGenerations = getRegisteredGenerations( 'triangular', getTriangularBoardGenerations( 4 ) );
export const standardCairoBoardGenerations = getRegisteredGenerations( 'cairo', getCairoBoardGenerations( 4 ) );

export const standardRhombilleBoardGenerations = getRegisteredGenerations( 'rhombille', getRhombilleBoardGenerations( 4 ) );
export const standardSnubSquareBoardGenerations = getRegisteredGenerations( 'snub-square', getSnubSquareBoardGenerations( 3 ) );
export const standardTrihexagonalBoardGenerations = getRegisteredGenerations( 'trihexagonal', getTrihexagonalBoardGenerations( 3 ) );
export const standardFloretPentagonalBoardGenerations = getRegisteredGenerations( 'floret-pentagonal', getFloretPentagonalBoardGenerations( 3 ) );
export const standardDeltoidalTrihexagonalBoardGenerations = getRegisteredGenerations( 'deltoidal-trihexagonal', getDeltoidalTrihexagonalBoardGenerations( 3 ) );
export const standardPortugalBoardGenerations = getRegisteredGenerations( 'portugal', getPortugalBoardGenerations( 3 ) );
export const standardRhombitrihexagonalBoardGenerations = getRegisteredGenerations( 'rhombitrihexagonal', getRhombitrihexagonalBoardGenerations( 3 ) );
export const standardPrismaticPentagonalBoardGenerations = getRegisteredGenerations( 'prismatic-pentagonal', getPrismaticPentagonalBoardGenerations( 3 ) );
export const standardElongatedTriangularBoardGenerations = getRegisteredGenerations( 'elongated-triangular', getElongatedTriangularBoardGenerations( 3 ) );

// console.log( standardPatternBoards.map( board => board.name ).filter( name => name ) );

// TODO: Create serialized forms of these(!)
// export const serializePlanarMappedPatternBoardGenerations = ( generations: FacesPatternBoard[][] ): string[][] => {
//   return generations.map( generation => generation.map( patternBoard => serializePlanarMappedPatternBoard( patternBoard ) ) );
// };
// console.log( JSON.stringify( serializePlanarMappedPatternBoardGenerations( standardSquareBoardGenerations ), null, 2 ) );
