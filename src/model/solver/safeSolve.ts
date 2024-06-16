import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import { iterateSolverFactory } from './TSolver.ts';
import { safeSolverFactory } from './safeSolverFactory.ts';

export const safeSolve = (board: TBoard, state: TState<TCompleteData>) => {
  // TODO: rename "safe" to "view-specific"?
  iterateSolverFactory(safeSolverFactory, board, state, true);
};
