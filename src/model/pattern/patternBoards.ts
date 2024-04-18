import { BasePatternBoard } from './BasePatternBoard.ts';
import { patternBoardMappings } from './patternBoardMappings.ts';
import { getSingleEdgePlanarPatternMap, getVertexPlanarPatternMap, TPlanarPatternMap } from './TPlanarPatternMap.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import _ from '../../workarounds/_.ts';
import { arePatternBoardsIsomorphic } from './arePatternBoardsIsomorphic.ts';
import { FacesPatternBoard } from './FacesPatternBoard.ts';
import { SquareBoard } from '../board/square/SquareBoard.ts';
import { HexagonalBoard } from '../board/hex/HexagonalBoard.ts';
import { getPeriodicTilingGenerator, PolygonGenerator } from '../../view/GenerateNode.ts';
import { cairoPentagonalTiling, PolygonalBoard, rhombilleTiling, snubSquareTiling, triangularTiling } from '../board/core/TiledBoard.ts';

export const edgePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 0,
  type: 'edge'
} );

export const vertexExit2NoSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 2,
  spans: []
} );

export const vertexExit2OneSectorPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 2,
  spans: [ 1 ]
} );

export const vertexExit3TwoAdjacentSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 3,
  spans: [ 2 ]
} );

export const vertexExit4TwoOppositeSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 4,
  spans: [ 1, 1 ]
} );

export const vertexExit4ThreeAdjacentSectorsPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 4,
  spans: [ 3 ]
} );

export const vertexExit5TwoOnePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 5,
  spans: [ 2, 1 ]
} );

export const vertexExit5FourPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 5,
  spans: [ 4 ]
} );

export const vertexExit6TriplePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 1, 1, 1 ]
} );

export const vertexExit6TwoTwoPatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 2, 2 ]
} );

export const vertexExit6ThreeOnePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 3, 1 ]
} );

export const vertexExit6FivePatternBoard = new BasePatternBoard( {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [ 5 ]
} );

export const vertexNonExit2PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 2
} );

export const vertexNonExit3PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 3
} );

export const vertexNonExit4PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 4
} );

export const vertexNonExit5PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 5
} );

export const vertexNonExit6PatternBoard = new BasePatternBoard( {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 6
} );

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

// TODO: evaluate our depth here, potentially make them lazy?
const time = Date.now();
console.log( time );
export const standardTriangularBoardGenerations = FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( triangularTiling ) ), 4 );
export const standardSquareBoardGenerations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 4 );
export const standardCairoBoardGenerations = FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( cairoPentagonalTiling ) ), 4 );
export const standardHexagonalBoardGenerations = FacesPatternBoard.getFirstNGenerations( new HexagonalBoard( 10, 1, true ), 4 );
export const standardRhombilleBoardGenerations = FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( rhombilleTiling ) ), 4 );
export const standardSnubSquareBoardGenerations = FacesPatternBoard.getFirstNGenerations( boardFromPolygonGenerator( getPeriodicTilingGenerator( snubSquareTiling ) ), 4 );
console.log( Date.now() - time );

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

export const registerStandardPatternBoard = ( patternBoard: TPatternBoard, planarPatternMap: TPlanarPatternMap ): void => {
  if ( !getStandardIsomorphicPatternBoard( patternBoard ) ) {
    standardPatternBoards.push( patternBoard );
    patternBoardMappings.set( patternBoard, planarPatternMap );
  }
};

registerStandardPatternBoard( edgePatternBoard, getSingleEdgePlanarPatternMap( edgePatternBoard ) );
vertexExitPatternBoards.forEach( patternBoard => registerStandardPatternBoard( patternBoard, getVertexPlanarPatternMap( patternBoard ) ) );
vertexNonExitPatternBoards.forEach( patternBoard => registerStandardPatternBoard( patternBoard, getVertexPlanarPatternMap( patternBoard ) ) );



// TODO: generate some of the "basic" boards (OR BETTER YET, store them here)
