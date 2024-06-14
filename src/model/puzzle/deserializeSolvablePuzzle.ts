import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { deserializeState } from '../data/core/deserializeState.ts';
import { TSerializedSolvablePuzzle, TSolvablePropertyPuzzle } from './TPuzzle.ts';
import { deserializePuzzle } from './deserializePuzzle.ts';

export const deserializeSolvablePuzzle = (
  serializedSolvablePuzzle: TSerializedSolvablePuzzle,
): TSolvablePropertyPuzzle<TStructure, TCompleteData> => {
  const puzzle = deserializePuzzle(serializedSolvablePuzzle.puzzle);
  const cleanState = deserializeState(puzzle.board, serializedSolvablePuzzle.cleanState);
  const solvedState = deserializeState(puzzle.board, serializedSolvablePuzzle.solvedState);
  const blackEdges = new Set(serializedSolvablePuzzle.blackEdges.map((index) => puzzle.board.edges[index]));

  return {
    board: puzzle.board,
    stateProperty: puzzle.stateProperty,
    solution: {
      board: puzzle.board,
      cleanState: cleanState,
      solvedState: solvedState,
      blackEdges: blackEdges,
    },
  };
};
