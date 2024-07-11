import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import { DifficultySolver, DifficultySolverOptions } from './DifficultySolver.ts';

export const getDifficultySolverFactory = (options: DifficultySolverOptions) => {
  return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
    return new DifficultySolver(board, state, options);
  };
};
