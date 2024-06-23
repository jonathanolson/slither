import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { VertexColorToFaceSolver } from './VertexColorToFaceSolver.ts';
import { safeSolverFactory } from './safeSolverFactory.ts';

export const finalStateSolverFactory = (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
    safeSolverFactory(board, state, dirty),
    new VertexColorToFaceSolver(board, state),
  ]);
};
