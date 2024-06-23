import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { finalStateSolve } from '../solver/finalStateSolve.ts';
import { TSolvedPuzzle } from './TSolvedPuzzle.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';

export const getSolvedPuzzle = <Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData>(
  board: TBoard<Structure>,
  cleanState: TState<Data>,
  blackEdges: MultiIterable<TEdge>,
): TSolvedPuzzle<Structure, Data> => {
  const solvedState = cleanState.clone();

  for (const edge of blackEdges) {
    solvedState.setEdgeState(edge, EdgeState.BLACK);
  }
  finalStateSolve(board, solvedState);

  return {
    board: board,
    cleanState: cleanState,
    solvedState: solvedState,
    blackEdges: new Set(blackEdges),
  };
};
