import { TPatternBoard } from './TPatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { PatternBoardSolver } from './PatternBoardSolver.ts';

const globalPatternBoardSolutionsMap = new WeakMap<TPatternBoard, TPatternEdge[][]>();

// memoized/cached (but with weak maps)
export const getPatternBoardSolutions = ( patternBoard: TPatternBoard ): TPatternEdge[][] => {
  assertEnabled() && assert( patternBoard );

  let solutions = globalPatternBoardSolutionsMap.get( patternBoard ) ?? null;
  if ( !solutions ) {
    solutions = PatternBoardSolver.getSolutions( patternBoard, [] );
    globalPatternBoardSolutionsMap.set( patternBoard, solutions );
  }

  return solutions;
};