import { TStructure } from '../board/core/TStructure.ts';
import { deserializeBoard } from '../board/core/deserializeBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { deserializeState } from '../data/core/deserializeState.ts';
import { TSerializedSolvedPuzzle, TSolvedPuzzle } from './TSolvedPuzzle.ts';

export const deserializeSolvedPuzzle = (
  serializedSolvedPuzzle: TSerializedSolvedPuzzle,
): TSolvedPuzzle<TStructure, TCompleteData> => {
  const board = deserializeBoard(serializedSolvedPuzzle.board);
  const cleanState = deserializeState(board, serializedSolvedPuzzle.cleanState);
  const solvedState = deserializeState(board, serializedSolvedPuzzle.solvedState);
  const blackEdges = new Set(serializedSolvedPuzzle.blackEdges.map((index) => board.edges[index]));

  return {
    board: board,
    cleanState: cleanState,
    solvedState: solvedState,
    blackEdges: blackEdges,
  };
};
