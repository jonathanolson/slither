import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { EdgeBacktrackerSolver } from './EdgeBacktracker.ts';

import { standardSolverFactory } from './standardSolverFactory.ts';

export const backtrackerSolverFactory = (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
  return new EdgeBacktrackerSolver(board, state, {
    solverFactory: standardSolverFactory,
    depth: 1,
  });
};
