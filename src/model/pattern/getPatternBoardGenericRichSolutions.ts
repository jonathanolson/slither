import { TPatternBoard } from './TPatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { GenericRichSolution } from './generation/GenericRichSolution.ts';
import { getPatternBoardSolutions } from './getPatternBoardSolutions.ts';

const globalPatternBoardGenericRichSolutionsMap = new WeakMap<TPatternBoard, GenericRichSolution[]>();

// memoized/cached (but with weak maps)
export const getPatternBoardGenericRichSolutions = ( patternBoard: TPatternBoard ): GenericRichSolution[] => {
  assertEnabled() && assert( patternBoard );

  let solutions = globalPatternBoardGenericRichSolutionsMap.get( patternBoard ) ?? null;
  if ( !solutions ) {
    solutions = getPatternBoardSolutions( patternBoard ).map( solution => new GenericRichSolution( patternBoard, solution, true ) );
    globalPatternBoardGenericRichSolutionsMap.set( patternBoard, solutions );
  }

  return solutions;
};