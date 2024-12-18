import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { GenericRichSolution } from './GenericRichSolution.ts';
import { getPatternBoardSolutions } from './getPatternBoardSolutions.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

const globalPatternBoardGenericRichSolutionsMap = new WeakMap<TPatternBoard, GenericRichSolution[]>();

// memoized/cached (but with weak maps)
export const getPatternBoardGenericRichSolutions = (
  patternBoard: TPatternBoard,
  cache = false,
): GenericRichSolution[] => {
  assertEnabled() && assert(patternBoard);

  let solutions = globalPatternBoardGenericRichSolutionsMap.get(patternBoard) ?? null;
  if (!solutions) {
    solutions = getPatternBoardSolutions(patternBoard).map(
      (solution) => new GenericRichSolution(patternBoard, solution, true),
      cache,
    );
    if (cache) {
      globalPatternBoardGenericRichSolutionsMap.set(patternBoard, solutions);
    }
  }

  return solutions;
};
