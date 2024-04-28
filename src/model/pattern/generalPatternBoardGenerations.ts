import { standardCairoBoardGenerations, standardDeltoidalTrihexagonalBoardGenerations, standardElongatedTriangularBoardGenerations, standardFloretPentagonalBoardGenerations, standardHexagonalBoardGenerations, standardPortugalBoardGenerations, standardPrismaticPentagonalBoardGenerations, standardRhombilleBoardGenerations, standardRhombitrihexagonalBoardGenerations, standardSnubSquareBoardGenerations, standardSquareBoardGenerations, standardTriangularBoardGenerations, standardTrihexagonalBoardGenerations } from './patternBoards.ts';
import _ from '../../workarounds/_.ts';
import { TPatternBoard } from './TPatternBoard.ts';

const generationsOrder = [
  standardSquareBoardGenerations,
  standardHexagonalBoardGenerations,
  standardTriangularBoardGenerations,
  standardCairoBoardGenerations,

  standardRhombilleBoardGenerations,
  standardSnubSquareBoardGenerations,
  standardTrihexagonalBoardGenerations,
  standardFloretPentagonalBoardGenerations,
  standardDeltoidalTrihexagonalBoardGenerations,
  standardPortugalBoardGenerations,
  standardRhombitrihexagonalBoardGenerations,
  standardPrismaticPentagonalBoardGenerations,
  standardElongatedTriangularBoardGenerations,
];

const maxGenerations = Math.min( ...generationsOrder.map( generations => generations.length ) );

export const generalPatternBoardGenerations: TPatternBoard[][] = _.range( 0, maxGenerations ).map( generationIndex => {
  return _.uniq( generationsOrder.flatMap( generations => generations[ generationIndex ] ) );
} );