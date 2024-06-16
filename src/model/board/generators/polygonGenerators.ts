import { PolygonGenerator } from '../PolygonGenerator.ts';
import {
  bisectedHexagonalTiling,
  cairoPentagonalTiling,
  deltoidalTrihexagonalTiling,
  elongatedTriangularTiling,
  floretPentagonalTiling,
  greatRhombitrihexagonalTiling,
  hexagonalTiling,
  portugalTiling,
  prismaticPentagonalTiling,
  rhombilleTiling,
  smallRhombitrihexagonalTiling,
  snubHexagonalTiling,
  snubSquareTiling,
  squareTiling,
  tetrakisSquareTiling,
  triakisTriangularTiling,
  triangularTiling,
  trihexAndHexTiling,
  trihexagonalTiling,
  truncatedHexagonalTiling,
  truncatedSquareTiling,
} from '../core/TiledBoard.ts';
import { getPeriodicTilingGenerator } from '../getPeriodicTilingGenerator.ts';
import { hexagonalPolygonGenerator } from './hexagonalPolygonGenerator.ts';
import { penroseTilingGenerator } from './penroseTilingGenerator.ts';
import { squarePolygonGenerator } from './squarePolygonGenerator.ts';

export const polygonGenerators: PolygonGenerator[] = [
  squarePolygonGenerator,
  getPeriodicTilingGenerator(rhombilleTiling, {
    width: 8,
    height: 8,
  }),
  hexagonalPolygonGenerator,
  getPeriodicTilingGenerator(cairoPentagonalTiling, {
    // TODO: get more aesthetic options!
    width: 8,
    height: 8,
    squareRegion: true,
  }),
  getPeriodicTilingGenerator(snubSquareTiling, {
    width: 5,
    height: 6,
    squareRegion: true,
  }),
  getPeriodicTilingGenerator(triangularTiling, {
    width: 6,
    height: 5,
  }),
  getPeriodicTilingGenerator(trihexagonalTiling, {
    width: 9,
    height: 9,
  }),

  getPeriodicTilingGenerator(snubHexagonalTiling, {
    width: 9,
    height: 9,
  }),

  getPeriodicTilingGenerator(floretPentagonalTiling, {
    // TODO: more aesthetic!
    width: 7,
    height: 8,
  }),

  // Quadish things
  getPeriodicTilingGenerator(deltoidalTrihexagonalTiling),

  // Triangular things
  getPeriodicTilingGenerator(triakisTriangularTiling),
  getPeriodicTilingGenerator(bisectedHexagonalTiling),
  getPeriodicTilingGenerator(tetrakisSquareTiling, {
    squareRegion: true,
  }),

  // Irregular things
  getPeriodicTilingGenerator(portugalTiling),
  getPeriodicTilingGenerator(truncatedSquareTiling),

  // Irregular with larger N faces
  getPeriodicTilingGenerator(trihexAndHexTiling, {
    width: 9,
    height: 9,
  }),
  // NOTE: Disabled because this is basically just hex...
  // getPeriodicTilingGenerator( falseCubicTiling, {
  //   width: 9,
  //   height: 10
  // } ),

  // Large N faces
  getPeriodicTilingGenerator(truncatedHexagonalTiling),
  getPeriodicTilingGenerator(smallRhombitrihexagonalTiling, {
    width: 9,
    height: 9,
  }),
  getPeriodicTilingGenerator(greatRhombitrihexagonalTiling),

  // Gridlike things
  getPeriodicTilingGenerator(prismaticPentagonalTiling),
  getPeriodicTilingGenerator(elongatedTriangularTiling, {
    width: 6,
    height: 8,
    squareRegion: true,
  }),

  getPeriodicTilingGenerator(squareTiling),
  getPeriodicTilingGenerator(hexagonalTiling),
  penroseTilingGenerator,
];
