import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { BoardPatternBoard } from '../../model/pattern/pattern-board/BoardPatternBoard.ts';
import {
  standardCairoBoard,
  standardDeltoidalTrihexagonalBoard,
  standardElongatedTriangularBoard,
  standardFloretPentagonalBoard,
  standardHexagonalBoard,
  standardPortugalBoard,
  standardPrismaticPentagonalBoard,
  standardRhombilleBoard,
  standardRhombitrihexagonalBoard,
  standardSnubSquareBoard,
  standardSquareBoard,
  standardTriangularBoard,
  standardTrihexagonalBoard,
} from '../../model/pattern/pattern-board/patternBoards.ts';

export class DisplayTiling extends EnumerationValue {
  public constructor(
    public readonly displayName: string,
    public readonly board: TBoard,
    public readonly boardPatternBoard: BoardPatternBoard,
  ) {
    super();
  }

  // used from .values, don't remove!
  public static readonly SQUARE = new DisplayTiling(
    'Square',
    standardSquareBoard,
    BoardPatternBoard.get(standardSquareBoard),
  );
  public static readonly HEXAGONAL = new DisplayTiling(
    'Hexagonal',
    standardHexagonalBoard,
    BoardPatternBoard.get(standardHexagonalBoard),
  );
  public static readonly CAIRO = new DisplayTiling(
    'Cairo',
    standardCairoBoard,
    BoardPatternBoard.get(standardCairoBoard),
  );
  public static readonly TRIANGULAR = new DisplayTiling(
    'Triangular',
    standardTriangularBoard,
    BoardPatternBoard.get(standardTriangularBoard),
  );
  public static readonly RHOMBILLE = new DisplayTiling(
    'Rhombille',
    standardRhombilleBoard,
    BoardPatternBoard.get(standardRhombilleBoard),
  );
  public static readonly SNUB_SQUARE = new DisplayTiling(
    'Snub Square',
    standardSnubSquareBoard,
    BoardPatternBoard.get(standardSnubSquareBoard),
  );
  public static readonly TRIHEXAGONAL = new DisplayTiling(
    'Trihexagonal',
    standardTrihexagonalBoard,
    BoardPatternBoard.get(standardTrihexagonalBoard),
  );
  public static readonly FLORET_PENTAGONAL = new DisplayTiling(
    'Floret Pentagonal',
    standardFloretPentagonalBoard,
    BoardPatternBoard.get(standardFloretPentagonalBoard),
  );
  public static readonly DELTOIDAL_TRIHEXAGONAL = new DisplayTiling(
    'Deltoidal Trihexagonal',
    standardDeltoidalTrihexagonalBoard,
    BoardPatternBoard.get(standardDeltoidalTrihexagonalBoard),
  );
  public static readonly PORTUGAL = new DisplayTiling(
    'Portugal',
    standardPortugalBoard,
    BoardPatternBoard.get(standardPortugalBoard),
  );
  public static readonly RHOMBITRIHEXAGONAL = new DisplayTiling(
    'Rhombitrihexagonal',
    standardRhombitrihexagonalBoard,
    BoardPatternBoard.get(standardRhombitrihexagonalBoard),
  );
  public static readonly PRISMATIC_PENTAGONAL = new DisplayTiling(
    'Prismatic Pentagonal',
    standardPrismaticPentagonalBoard,
    BoardPatternBoard.get(standardPrismaticPentagonalBoard),
  );
  public static readonly ELONGATED_TRIANGULAR = new DisplayTiling(
    'Elongated Triangular',
    standardElongatedTriangularBoard,
    BoardPatternBoard.get(standardElongatedTriangularBoard),
  );

  public static readonly enumeration = new Enumeration(DisplayTiling);
}
