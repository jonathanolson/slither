export type SerializedPatternBoardLibrary = {
  standardPatternBoards: Record<string, string>; // pattern board name => serializePatternBoardDescriptor( board.descriptor )
  planarPatternMaps: Record<string, string>; // pattern board name => serializePlanarPatternMap( planarPatternMap )

  standardSquareBoardGenerations: string[][];
  standardHexagonalBoardGenerations: string[][];
  standardTriangularBoardGenerations: string[][];
  standardCairoBoardGenerations: string[][];

  standardRhombilleBoardGenerations: string[][];
  standardSnubSquareBoardGenerations: string[][];
  standardTrihexagonalBoardGenerations: string[][];
  standardFloretPentagonalBoardGenerations: string[][];
  standardDeltoidalTrihexagonalBoardGenerations: string[][];
  standardPortugalBoardGenerations: string[][];
  standardRhombitrihexagonalBoardGenerations: string[][];
  standardPrismaticPentagonalBoardGenerations: string[][];
  standardElongatedTriangularBoardGenerations: string[][];
};
