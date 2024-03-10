import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { TState } from '../data/core/TState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { safeSolve } from '../solver/autoSolver.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';

export interface TSolvedPuzzle<Structure extends TStructure, Data extends TFaceData> {
  board: TBoard<Structure>;
  cleanState: TState<Data>;
  solvedState: TState<Data>;
  blackEdges: Set<Structure[ 'Edge' ]>;
}

export const getSolvedPuzzle = <Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData>(
  board: TBoard<Structure>,
  cleanState: TState<Data>,
  blackEdges: Iterable<TEdge>
): TSolvedPuzzle<Structure, Data> => {
  const solvedState = cleanState.clone();

  for ( const edge of blackEdges ) {
    solvedState.setEdgeState( edge, EdgeState.BLACK );
  }
  safeSolve( board, solvedState );

  return {
    board: board,
    cleanState: cleanState,
    solvedState: solvedState,
    blackEdges: new Set( blackEdges )
  };
};