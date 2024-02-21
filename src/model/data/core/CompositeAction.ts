import { TAction } from './TAction.ts';

export class CompositeAction<State> implements TAction<State> {

  public constructor(
    public readonly actions: TAction<State>[]
  ) {}

  public apply( state: State ): void {
    for ( let i = 0; i < this.actions.length; i++ ) {
      this.actions[ i ].apply( state );
    }
  }

  public getUndo( state: State ): TAction<State> {
    return new CompositeAction( this.actions.map( action => action.getUndo( state ) ).reverse() );
  }

  public isEmpty(): boolean {
    return this.actions.some( action => !action.isEmpty() );
  }
}