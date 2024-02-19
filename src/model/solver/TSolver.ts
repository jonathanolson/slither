// Each solver is specifically hooked to a state
import { TAction, TState } from '../structure.ts';

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