import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TAction } from '../data/core/TAction.ts';

export class CompositeSolver<Data, Action extends TAction<Data> = TAction<Data>> implements TSolver<Data, Action> {
  public constructor(private readonly solvers: TSolver<Data, Action>[]) {}

  public get dirty(): boolean {
    return this.solvers.some((solver) => solver.dirty);
  }

  public nextAction(): Action | null {
    for (const solver of this.solvers) {
      if (solver.dirty) {
        const action = solver.nextAction();
        if (action) {
          return action;
        }
      }
    }
    return null;
  }

  public clone(equivalentState: TState<Data>): CompositeSolver<Data, Action> {
    return new CompositeSolver(this.solvers.map((solver) => solver.clone(equivalentState)));
  }

  public dispose(): void {
    this.solvers.forEach((solver) => solver.dispose());
  }
}
