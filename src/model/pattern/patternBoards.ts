import { BasePatternBoard } from './BasePatternBoard.ts';
import { patternBoardMappings } from './patternBoardMappings.ts';
import { getSingleEdgePlanarPatternMap, getVertexPlanarPatternMap } from './TPlanarPatternMap.ts';

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

patternBoardMappings.set( edgePatternBoard, getSingleEdgePlanarPatternMap( edgePatternBoard ) );

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
vertexExitPatternBoards.forEach( patternBoard => patternBoardMappings.set( patternBoard, getVertexPlanarPatternMap( patternBoard ) ) );

export const vertexNonExitPatternBoards = [
  vertexNonExit2PatternBoard,
  vertexNonExit3PatternBoard,
  vertexNonExit4PatternBoard,
  vertexNonExit5PatternBoard,
  vertexNonExit6PatternBoard,
];
vertexNonExitPatternBoards.forEach( patternBoard => patternBoardMappings.set( patternBoard, getVertexPlanarPatternMap( patternBoard ) ) );

export const basicPatternBoards = [
  edgePatternBoard,
  ...vertexExitPatternBoards,
  ...vertexNonExitPatternBoards,
];

// TODO: generate some of the "basic" boards (OR BETTER YET, store them here)
