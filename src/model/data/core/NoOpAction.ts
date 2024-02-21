import { TAction } from './TAction.ts';

export class NoOpAction<Data> implements TAction<Data> {
  public apply( state: Data ): void {
    // DO NOTHING
  }

  public getUndo( state: Data ): TAction<Data> {
    return this;
  }

  public isEmpty(): boolean {
    return true;
  }
}