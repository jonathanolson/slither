// Each solver is specifically hooked to a state
import { TAction, TBoard, TState, TStructure } from '../structure.ts';

export interface TSolver<Data, Action extends TAction<Data>> {
  // If there is a chance nextAction will return an action
  dirty: boolean;

  // TODO: We could also report out the "difficulty" of the next dirty solver, so we could potentially
  // TODO: backtrack more efficiently by exploring the "easier" parts first in each black/red pair.
  // TODO: --- decide whether this actually just... ADDs to the computational cost of the solver?

  // If this returns null, the solver is "currently exhausted" / "clean", and should be marked as NOT dirty.
  nextAction(): Action | null;

  // Create a copy of this solver, but referring to an equivalent state object (allows branching).
  clone( equivalentState: TState<Data> ): TSolver<Data, Action>;

  dispose(): void;
}

export type SolverFactory<Structure extends TStructure, Data> = (
  board: TBoard<Structure>,
  state: TState<Data>,
  dirty?: boolean
) => TSolver<Data, TAction<Data>>;

export const iterateSolver = <Data, Action extends TAction<Data>>(
  solver: TSolver<Data, Action>,
  state: TState<Data>
): void => {
  while ( solver.dirty ) {
    const action = solver.nextAction();
    if ( action ) {
      action.apply( state );
    }
  }
}

export const iterateSolverAndDispose = <Data, Action extends TAction<Data>>(
  solver: TSolver<Data, Action>,
  state: TState<Data>
): void => {
  try {
    iterateSolver( solver, state );
  }
  finally {
    solver.dispose();
  }
}

export const withSolverFactory = <Structure extends TStructure, Data>(
  solverFactory: SolverFactory<TStructure, Data>,
  board: TBoard<Structure>,
  state: TState<Data>,
  callback: () => void,
  dirty?: boolean
): void => {
  const solver = solverFactory( board, state, dirty );
  callback();
  iterateSolverAndDispose( solver, state );
}

export const iterateSolverFactory = <Structure extends TStructure, Data>(
  solverFactory: SolverFactory<TStructure, Data>,
  board: TBoard<Structure>,
  state: TState<Data>,
  dirty?: boolean
): void => {
  withSolverFactory( solverFactory, board, state, () => {}, dirty );
}