import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { SafeEdgeSectorColorToVertexSolver } from './SafeEdgeSectorColorToVertexSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSectorSolver } from './SafeEdgeToSectorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';


// TODO: have some way of the autoSolver ALWAYS having these solvers?
// TODO: deprecate this?!?
export const safeSolverFactory = (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
    new SafeEdgeToSimpleRegionSolver(board, state),
    new SafeSolvedEdgeSolver(board, state),
    new SafeEdgeToFaceColorSolver(board, state),
    new SafeEdgeToSectorSolver(board, state),
    new SafeEdgeSectorColorToVertexSolver(board, state),
  ]);
};
