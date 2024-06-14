// Each solver is specifically hooked to a state
import { TState } from '../data/core/TState.ts';
import { TAction } from '../data/core/TAction.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';

export interface TSolver<Data, Action extends TAction<Data>> {
  // If there is a chance nextAction will return an action
  dirty: boolean;

  // TODO: We could also report out the "difficulty" of the next dirty solver, so we could potentially
  // TODO: backtrack more efficiently by exploring the "easier" parts first in each black/red pair.
  // TODO: --- decide whether this actually just... ADDs to the computational cost of the solver?

  // If this returns null, the solver is "currently exhausted" / "clean", and should be marked as NOT dirty.
  nextAction(): Action | null;

  // Create a copy of this solver, but referring to an equivalent state object (allows branching).
  clone(equivalentState: TState<Data>): TSolver<Data, Action>;

  dispose(): void;
}

export type CompleteAnnotatedSolver = TSolver<TCompleteData, TAnnotatedAction<TCompleteData>>;

export type SolverFactory<Structure extends TStructure, Data> = (
  board: TBoard<Structure>,
  state: TState<Data>,
  dirty?: boolean,
) => TSolver<Data, TAction<Data>>;

export type AnnotatedSolverFactory<Structure extends TStructure, Data> = (
  board: TBoard<Structure>,
  state: TState<Data>,
  dirty?: boolean,
) => TSolver<Data, TAnnotatedAction<Data>>;

export type CompleteAnnotatedSolverFactory = AnnotatedSolverFactory<TStructure, TCompleteData>;

export const iterateSolver = <Data, Action extends TAction<Data>>(
  solver: TSolver<Data, Action>,
  state: TState<Data>,
): void => {
  let count = 0;

  while (solver.dirty) {
    if (count++ > 100000) {
      throw new Error('Solver iteration limit exceeded? Looped?');
    }
    const action = solver.nextAction();
    if (action) {
      action.apply(state);
    }
  }
};

export const iterateSolverAndDispose = <Data, Action extends TAction<Data>>(
  solver: TSolver<Data, Action>,
  state: TState<Data>,
): void => {
  try {
    iterateSolver(solver, state);
  } finally {
    solver.dispose();
  }
};

export const withSolverFactory = <Structure extends TStructure, Data>(
  solverFactory: SolverFactory<TStructure, Data>,
  board: TBoard<Structure>,
  state: TState<Data>,
  callback: () => void,
  dirty?: boolean,
): void => {
  const solver = solverFactory(board, state, dirty);
  callback();
  iterateSolverAndDispose(solver, state);
};

export const iterateSolverFactory = <Structure extends TStructure, Data>(
  solverFactory: SolverFactory<TStructure, Data>,
  board: TBoard<Structure>,
  state: TState<Data>,
  dirty?: boolean,
): void => {
  withSolverFactory(solverFactory, board, state, () => {}, dirty);
};
