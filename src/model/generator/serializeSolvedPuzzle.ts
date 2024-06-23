import { TStructure } from '../board/core/TStructure.ts';
import { serializeBoard } from '../board/core/serializeBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TSerializedSolvedPuzzle, TSolvedPuzzle } from './TSolvedPuzzle.ts';

export const serializeSolvedPuzzle = (
  solvedPuzzle: TSolvedPuzzle<TStructure, TCompleteData>,
): TSerializedSolvedPuzzle => {
  const serializedBoard = serializeBoard(solvedPuzzle.board);
  const serializedCleanState = solvedPuzzle.cleanState.serializeState(solvedPuzzle.board);
  const serializedSolvedState = solvedPuzzle.solvedState.serializeState(solvedPuzzle.board);
  const serializedEdges = [...solvedPuzzle.blackEdges].map((edge) => solvedPuzzle.board.edges.indexOf(edge));

  return {
    board: serializedBoard,
    cleanState: serializedCleanState,
    solvedState: serializedSolvedState,
    blackEdges: serializedEdges,
  };
};
