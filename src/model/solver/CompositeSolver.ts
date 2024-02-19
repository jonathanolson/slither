import { TAction, TState } from '../structure.ts';

import { TSolver } from './TSolver.ts';

export class CompositeSolver<Data> implements TSolver<Data, TAction<Data>> {

  public constructor(
    private readonly solvers: TSolver<Data, TAction<Data>>[]
  ) {}

  public get dirty(): boolean {
    return this.solvers.some( solver => solver.dirty );
  }

  public nextAction(): TAction<Data> | null {
    for ( const solver of this.solvers ) {
      if ( solver.dirty ) {
        const action = solver.nextAction();
        if ( action ) {
          return action;
        }
      }
    }
    return null;
  }

  public clone( equivalentState: TState<Data> ): CompositeSolver<Data> {
    return new CompositeSolver( this.solvers.map( solver => solver.clone( equivalentState ) ) );
  }

  public dispose(): void {
    this.solvers.forEach( solver => solver.dispose() );
  }
}