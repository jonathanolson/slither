import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import { AnnotatedSolverFactory, iterateSolverFactory } from './TSolver.ts';

export const safeSolveWithFactory = (
  board: TBoard,
  state: TState<TCompleteData>,
  factory: AnnotatedSolverFactory<TStructure, TCompleteData>,
) => {
  iterateSolverFactory(factory, board, state, true);
};
