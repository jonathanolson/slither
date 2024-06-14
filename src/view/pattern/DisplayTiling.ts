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
    new BoardPatternBoard(standardSquareBoard),
  );
  public static readonly HEXAGONAL = new DisplayTiling(
    'Hexagonal',
    standardHexagonalBoard,
    new BoardPatternBoard(standardHexagonalBoard),
  );
  public static readonly CAIRO = new DisplayTiling(
    'Cairo',
    standardCairoBoard,
    new BoardPatternBoard(standardCairoBoard),
  );
  public static readonly TRIANGULAR = new DisplayTiling(
    'Triangular',
    standardTriangularBoard,
    new BoardPatternBoard(standardTriangularBoard),
  );
  public static readonly RHOMBILLE = new DisplayTiling(
    'Rhombille',
    standardRhombilleBoard,
    new BoardPatternBoard(standardRhombilleBoard),
  );
  public static readonly SNUB_SQUARE = new DisplayTiling(
    'Snub Square',
    standardSnubSquareBoard,
    new BoardPatternBoard(standardSnubSquareBoard),
  );
  public static readonly TRIHEXAGONAL = new DisplayTiling(
    'Trihexagonal',
    standardTrihexagonalBoard,
    new BoardPatternBoard(standardTrihexagonalBoard),
  );
  public static readonly FLORET_PENTAGONAL = new DisplayTiling(
    'Floret Pentagonal',
    standardFloretPentagonalBoard,
    new BoardPatternBoard(standardFloretPentagonalBoard),
  );
  public static readonly DELTOIDAL_TRIHEXAGONAL = new DisplayTiling(
    'Deltoidal Trihexagonal',
    standardDeltoidalTrihexagonalBoard,
    new BoardPatternBoard(standardDeltoidalTrihexagonalBoard),
  );
  public static readonly PORTUGAL = new DisplayTiling(
    'Portugal',
    standardPortugalBoard,
    new BoardPatternBoard(standardPortugalBoard),
  );
  public static readonly RHOMBITRIHEXAGONAL = new DisplayTiling(
    'Rhombitrihexagonal',
    standardRhombitrihexagonalBoard,
    new BoardPatternBoard(standardRhombitrihexagonalBoard),
  );
  public static readonly PRISMATIC_PENTAGONAL = new DisplayTiling(
    'Prismatic Pentagonal',
    standardPrismaticPentagonalBoard,
    new BoardPatternBoard(standardPrismaticPentagonalBoard),
  );
  public static readonly ELONGATED_TRIANGULAR = new DisplayTiling(
    'Elongated Triangular',
    standardElongatedTriangularBoard,
    new BoardPatternBoard(standardElongatedTriangularBoard),
  );

  public static readonly enumeration = new Enumeration(DisplayTiling);
}
