export interface TAction<Data> {
  apply( state: Data ): void;

  getUndo( state: Data ): TAction<Data>; // the action to undo this action (if we applied the action on it).

  isEmpty(): boolean;
}
