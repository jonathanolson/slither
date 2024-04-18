import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { AnnotatedSolverFactory, iterateSolverFactory } from './TSolver.ts';
import { TStructure } from '../board/core/TStructure.ts';

export const safeSolveWithFactory = ( board: TBoard, state: TState<TCompleteData>, factory: AnnotatedSolverFactory<TStructure, TCompleteData> ) => {
  iterateSolverFactory( factory, board, state, true );
};