import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { finalStateSolve } from '../solver/autoSolver.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';

export interface TSolvedPuzzle<Structure extends TStructure, Data extends TFaceValueData> {
  board: TBoard<Structure>;
  cleanState: TState<Data>;
  solvedState: TState<Data>;
  blackEdges: Set<Structure['Edge']>;
}

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
