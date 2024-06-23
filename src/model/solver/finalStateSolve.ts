import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import { iterateSolverFactory } from './TSolver.ts';
import { finalStateSolverFactory } from './finalStateSolverFactory.ts';

export const finalStateSolve = (board: TBoard, state: TState<TCompleteData>) => {
  iterateSolverFactory(finalStateSolverFactory, board, state, true);
};
