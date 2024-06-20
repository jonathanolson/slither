import { PolygonGenerator } from '../../board/PolygonGenerator.ts';
import {
  cairoPentagonalTiling,
  deltoidalTrihexagonalTiling,
  elongatedTriangularTiling,
  floretPentagonalTiling,
  portugalTiling,
  prismaticPentagonalTiling,
  rhombilleTiling,
  smallRhombitrihexagonalTiling,
  snubSquareTiling,
  triangularTiling,
  trihexagonalTiling,
} from '../../board/core/PeriodicBoardTiling.ts';
import { PolygonalBoard } from '../../board/core/PolygonalBoard.ts';
import { getPeriodicTilingGenerator } from '../../board/getPeriodicTilingGenerator.ts';
import { HexagonalBoard } from '../../board/hex/HexagonalBoard.ts';
import { SquareBoard } from '../../board/square/SquareBoard.ts';
import { standardSerializedPatternBoardLibrary } from '../data/standardSerializedPatternBoardLibrary.ts';
import { BasePatternBoard } from './BasePatternBoard.ts';
import { FacesPatternBoard } from './FacesPatternBoard.ts';
import { SerializedPatternBoardLibrary } from './SerializedPatternBoardLibrary.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import {
  TPatternBoardDescriptor,
  deserializePatternBoardDescriptor,
  serializePatternBoardDescriptor,
} from './TPatternBoardDescriptor.ts';
import { arePatternBoardsIsomorphic } from './arePatternBoardsIsomorphic.ts';
import {
  TPlanarPatternMap,
  deserializePlanarPatternMap,
  getSingleEdgePlanarPatternMap,
  getVertexPlanarPatternMap,
  serializePlanarPatternMap,
} from './planar-map/TPlanarPatternMap.ts';
import { planarPatternMaps } from './planar-map/planarPatternMaps.ts';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

const USE_SERIALIZED = true;

const standardPatternBoards: TPatternBoard[] = [];

export const getStandardDescribedPatternBoard = (descriptor: TPatternBoardDescriptor): TPatternBoard | null => {
  return standardPatternBoards.find((patternBoard) => _.isEqual(patternBoard.descriptor, descriptor)) ?? null;
};

export const getStandardIsomorphicPatternBoard = (patternBoard: TPatternBoard): TPatternBoard | null => {
  const boardFromDescriptor = getStandardDescribedPatternBoard(patternBoard.descriptor);
  if (boardFromDescriptor) {
    return boardFromDescriptor;
  }

  return (
    standardPatternBoards.find((otherPatternBoard) => arePatternBoardsIsomorphic(patternBoard, otherPatternBoard)) ??
    null
  );
};

export const getStandardNamedPatternBoard = (name: string): TPatternBoard | null => {
  return standardPatternBoards.find((patternBoard) => patternBoard.name === name) ?? null;
};

// Replaces isomorphic pattern boards with their standard versions
export const registerStandardPatternBoard = (
  patternBoard: TPatternBoard,
  planarPatternMap: TPlanarPatternMap,
): TPatternBoard => {
  const standardPatternBoard = getStandardIsomorphicPatternBoard(patternBoard);

  if (standardPatternBoard) {
    return standardPatternBoard;
  } else {
    standardPatternBoards.push(patternBoard);
    planarPatternMaps.set(patternBoard, planarPatternMap);
    return patternBoard;
  }
};

// Replaces isomorphic pattern boards with their standard versions
export const getRegisteredGenerations = (name: string, generations: FacesPatternBoard[][]): TPatternBoard[][] => {
  return generations.map((generation, generationIndex) => {
    return generation.map((patternBoard, index) => {
      patternBoard.name = `${name}-${generationIndex}-${index}`;

      return registerStandardPatternBoard(patternBoard, patternBoard.planarPatternMap);
    });
  });
};

export const getSerializedPatternBoardLibrary = (): SerializedPatternBoardLibrary => {
  return {
    standardPatternBoards: _.fromPairs(
      standardPatternBoards.map((patternBoard) => [
        patternBoard.name,
        serializePatternBoardDescriptor(patternBoard.descriptor),
      ]),
    ),
    planarPatternMaps: _.fromPairs(
      standardPatternBoards.map((patternBoard) => [
        patternBoard.name,
        serializePlanarPatternMap(planarPatternMaps.get(patternBoard)!),
      ]),
    ),

    standardSquareBoardGenerations: standardSquareBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardHexagonalBoardGenerations: standardHexagonalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardTriangularBoardGenerations: standardTriangularBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardCairoBoardGenerations: standardCairoBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),

    standardRhombilleBoardGenerations: standardRhombilleBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardSnubSquareBoardGenerations: standardSnubSquareBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardTrihexagonalBoardGenerations: standardTrihexagonalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardFloretPentagonalBoardGenerations: standardFloretPentagonalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardDeltoidalTrihexagonalBoardGenerations: standardDeltoidalTrihexagonalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardPortugalBoardGenerations: standardPortugalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardRhombitrihexagonalBoardGenerations: standardRhombitrihexagonalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardPrismaticPentagonalBoardGenerations: standardPrismaticPentagonalBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
    standardElongatedTriangularBoardGenerations: standardElongatedTriangularBoardGenerations.map((generation) =>
      generation.map((board) => board.name!),
    ),
  };
};

if (USE_SERIALIZED) {
  const patternBoardNames = Object.keys(standardSerializedPatternBoardLibrary.standardPatternBoards);

  for (const patternBoardName of patternBoardNames) {
    let patternBoard: TPatternBoard = new BasePatternBoard(
      deserializePatternBoardDescriptor(standardSerializedPatternBoardLibrary.standardPatternBoards[patternBoardName]),
      patternBoardName,
    );
    const planarPatternMap = deserializePlanarPatternMap(
      standardSerializedPatternBoardLibrary.planarPatternMaps[patternBoardName],
      patternBoard,
    );

    registerStandardPatternBoard(patternBoard, planarPatternMap);
  }
}

const getStandardPatternBoard = (name: string, descriptor: TPatternBoardDescriptor): TPatternBoard => {
  if (USE_SERIALIZED) {
    const patternBoard = getStandardNamedPatternBoard(name)!;
    assertEnabled() && assert(patternBoard);

    return patternBoard;
  } else {
    const patternBoard = new BasePatternBoard(descriptor, name);

    const planarPatternMap =
      name === 'single-edge' ? getSingleEdgePlanarPatternMap(patternBoard) : getVertexPlanarPatternMap(patternBoard);
    registerStandardPatternBoard(patternBoard, planarPatternMap);

    return patternBoard;
  }
};

export const edgePatternBoard = getStandardPatternBoard('single-edge', {
  numNonExitVertices: 0,
  numExitVertices: 0,
  type: 'edge',
});

export const vertexExit2NoSectorsPatternBoard = getStandardPatternBoard('vertex-2-exit-none', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 2,
  spans: [],
});

export const vertexExit2OneSectorPatternBoard = getStandardPatternBoard('vertex-2-exit-one', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 2,
  spans: [1],
});

export const vertexExit3TwoAdjacentSectorsPatternBoard = getStandardPatternBoard('vertex-3-exit-two-adjacent', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 3,
  spans: [2],
});

export const vertexExit4TwoOppositeSectorsPatternBoard = getStandardPatternBoard('vertex-4-exit-two-opposite', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 4,
  spans: [1, 1],
});

export const vertexExit4ThreeAdjacentSectorsPatternBoard = getStandardPatternBoard('vertex-4-exit-three-adjacent', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 4,
  spans: [3],
});

export const vertexExit5TwoOnePatternBoard = getStandardPatternBoard('vertex-5-exit-two-one', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 5,
  spans: [2, 1],
});

export const vertexExit5FourPatternBoard = getStandardPatternBoard('vertex-5-exit-four', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 5,
  spans: [4],
});

export const vertexExit6TriplePatternBoard = getStandardPatternBoard('vertex-6-exit-triple', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [1, 1, 1],
});

export const vertexExit6TwoTwoPatternBoard = getStandardPatternBoard('vertex-6-exit-two-two', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [2, 2],
});

export const vertexExit6ThreeOnePatternBoard = getStandardPatternBoard('vertex-6-exit-three-one', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [3, 1],
});

export const vertexExit6FivePatternBoard = getStandardPatternBoard('vertex-6-exit-five', {
  numNonExitVertices: 0,
  numExitVertices: 1,
  type: 'exit-vertex',
  edgeCount: 6,
  spans: [5],
});

export const vertexNonExit2PatternBoard = getStandardPatternBoard('vertex-2', {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 2,
});

export const vertexNonExit3PatternBoard = getStandardPatternBoard('vertex-3', {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 3,
});

export const vertexNonExit4PatternBoard = getStandardPatternBoard('vertex-4', {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 4,
});

export const vertexNonExit5PatternBoard = getStandardPatternBoard('vertex-5', {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 5,
});

export const vertexNonExit6PatternBoard = getStandardPatternBoard('vertex-6', {
  numNonExitVertices: 1,
  numExitVertices: 0,
  type: 'non-exit-vertex',
  edgeCount: 6,
});

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

export const basicPatternBoards = [edgePatternBoard, ...vertexExitPatternBoards, ...vertexNonExitPatternBoards];

const boardFromPolygonGenerator = (generator: PolygonGenerator): PolygonalBoard => {
  // TODO: simplify this board generation
  const polygons = generator.generate({
    // TODO: make this variable
    width: 20,
    height: 20,
  });

  return new PolygonalBoard(polygons, generator.scale ?? 1);
};

export const standardTriangularBoard = boardFromPolygonGenerator(getPeriodicTilingGenerator(triangularTiling));
export const standardSquareBoard = new SquareBoard(20, 20);
export const standardCairoBoard = boardFromPolygonGenerator(getPeriodicTilingGenerator(cairoPentagonalTiling));
export const standardHexagonalBoard = new HexagonalBoard(10, 1, true);
export const standardRhombilleBoard = boardFromPolygonGenerator(getPeriodicTilingGenerator(rhombilleTiling));
export const standardSnubSquareBoard = boardFromPolygonGenerator(getPeriodicTilingGenerator(snubSquareTiling));
export const standardTrihexagonalBoard = boardFromPolygonGenerator(getPeriodicTilingGenerator(trihexagonalTiling));
export const standardFloretPentagonalBoard = boardFromPolygonGenerator(
  getPeriodicTilingGenerator(floretPentagonalTiling),
);
export const standardDeltoidalTrihexagonalBoard = boardFromPolygonGenerator(
  getPeriodicTilingGenerator(deltoidalTrihexagonalTiling),
);
export const standardPortugalBoard = boardFromPolygonGenerator(getPeriodicTilingGenerator(portugalTiling));
export const standardRhombitrihexagonalBoard = boardFromPolygonGenerator(
  getPeriodicTilingGenerator(smallRhombitrihexagonalTiling),
);
export const standardPrismaticPentagonalBoard = boardFromPolygonGenerator(
  getPeriodicTilingGenerator(prismaticPentagonalTiling),
);
export const standardElongatedTriangularBoard = boardFromPolygonGenerator(
  getPeriodicTilingGenerator(elongatedTriangularTiling),
);

// "each face order is isomorphic to others of the same order" and "no vertex orders greater than 6
export const getTriangularBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardTriangularBoard, n);
export const getSquareBoardGenerations = (n: number) => FacesPatternBoard.getFirstNGenerations(standardSquareBoard, n);
export const getCairoBoardGenerations = (n: number) => FacesPatternBoard.getFirstNGenerations(standardCairoBoard, n);
export const getHexagonalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardHexagonalBoard, n);
export const getRhombilleBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardRhombilleBoard, n);
export const getSnubSquareBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardSnubSquareBoard, n);
export const getTrihexagonalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardTrihexagonalBoard, n);
export const getFloretPentagonalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardFloretPentagonalBoard, n);
export const getDeltoidalTrihexagonalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardDeltoidalTrihexagonalBoard, n);
export const getPortugalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardPortugalBoard, n);
export const getRhombitrihexagonalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardRhombitrihexagonalBoard, n);
export const getPrismaticPentagonalBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardPrismaticPentagonalBoard, n);
export const getElongatedTriangularBoardGenerations = (n: number) =>
  FacesPatternBoard.getFirstNGenerations(standardElongatedTriangularBoard, n);

const loadGenerations = (
  simpleName: string,
  longName: keyof SerializedPatternBoardLibrary,
  getGenerations: () => FacesPatternBoard[][],
): TPatternBoard[][] => {
  if (USE_SERIALIZED) {
    return (standardSerializedPatternBoardLibrary[longName] as string[][]).map((generation) =>
      generation.map((name) => {
        const patternBoard = getStandardNamedPatternBoard(name)!;
        assertEnabled() && assert(patternBoard);
        return patternBoard;
      }),
    );
  } else {
    return getRegisteredGenerations(simpleName, getGenerations());
  }
};

// ORDER IMPORTANT(!)
export const standardSquareBoardGenerations = loadGenerations('square', 'standardSquareBoardGenerations', () =>
  getSquareBoardGenerations(5),
);
export const standardHexagonalBoardGenerations = loadGenerations('hexagonal', 'standardHexagonalBoardGenerations', () =>
  getHexagonalBoardGenerations(4),
);
export const standardTriangularBoardGenerations = loadGenerations(
  'triangular',
  'standardTriangularBoardGenerations',
  () => getTriangularBoardGenerations(4),
);
export const standardCairoBoardGenerations = loadGenerations('cairo', 'standardCairoBoardGenerations', () =>
  getCairoBoardGenerations(4),
);

export const standardRhombilleBoardGenerations = loadGenerations('rhombille', 'standardRhombilleBoardGenerations', () =>
  getRhombilleBoardGenerations(4),
);
export const standardSnubSquareBoardGenerations = loadGenerations(
  'snub-square',
  'standardSnubSquareBoardGenerations',
  () => getSnubSquareBoardGenerations(3),
);
export const standardTrihexagonalBoardGenerations = loadGenerations(
  'trihexagonal',
  'standardTrihexagonalBoardGenerations',
  () => getTrihexagonalBoardGenerations(3),
);
export const standardFloretPentagonalBoardGenerations = loadGenerations(
  'floret-pentagonal',
  'standardFloretPentagonalBoardGenerations',
  () => getFloretPentagonalBoardGenerations(3),
);
export const standardDeltoidalTrihexagonalBoardGenerations = loadGenerations(
  'deltoidal-trihexagonal',
  'standardDeltoidalTrihexagonalBoardGenerations',
  () => getDeltoidalTrihexagonalBoardGenerations(3),
);
export const standardPortugalBoardGenerations = loadGenerations('portugal', 'standardPortugalBoardGenerations', () =>
  getPortugalBoardGenerations(3),
);
export const standardRhombitrihexagonalBoardGenerations = loadGenerations(
  'rhombitrihexagonal',
  'standardRhombitrihexagonalBoardGenerations',
  () => getRhombitrihexagonalBoardGenerations(3),
);
export const standardPrismaticPentagonalBoardGenerations = loadGenerations(
  'prismatic-pentagonal',
  'standardPrismaticPentagonalBoardGenerations',
  () => getPrismaticPentagonalBoardGenerations(3),
);
export const standardElongatedTriangularBoardGenerations = loadGenerations(
  'elongated-triangular',
  'standardElongatedTriangularBoardGenerations',
  () => getElongatedTriangularBoardGenerations(3),
);

// console.log( standardPatternBoards.map( board => board.name ).filter( name => name ) );

// TODO: Create serialized forms of these(!)
// export const serializePlanarMappedPatternBoardGenerations = ( generations: FacesPatternBoard[][] ): string[][] => {
//   return generations.map( generation => generation.map( patternBoard => serializePlanarMappedPatternBoard( patternBoard ) ) );
// };
// console.log( JSON.stringify( serializePlanarMappedPatternBoardGenerations( standardSquareBoardGenerations ), null, 2 ) );
