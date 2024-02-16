import { getPressStyle } from "../config";
import { EdgeStateSetAction, TEdge, TFaceEdgeData, TPuzzle, TState, TStructure } from "./structure";

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<Structure extends TStructure = TStructure, State extends TState<TFaceEdgeData> = TState<TFaceEdgeData>> {

  private readonly stack: StateTransition<State>[];
  private stackPosition: number = 0;

  public constructor(
    public readonly puzzle: TPuzzle<Structure, State>
  ) {
    this.stack = [ new StateTransition( null, puzzle.stateProperty.value ) ];
  }

  private updateState(): void {
    this.puzzle.stateProperty.value = this.stack[ this.stackPosition ].state;
  }

  private wipeStackTop(): void {
    while ( this.stack.length > this.stackPosition + 1 ) {
      this.stack.pop();
    }
  }

  public onUserEdgePress( edge: TEdge, button: 0 | 1 | 2 ): void {
    const oldEdgeState = this.puzzle.stateProperty.value.getEdgeState( edge );
    const style = getPressStyle( button );
    const newEdgeState = style.apply( oldEdgeState );

    if ( oldEdgeState !== newEdgeState ) {
      // TODO: ... we can't interface things for TState, so ThisType<this> isn't available... how can we fix this?
      const newState = this.puzzle.stateProperty.value.clone() as State;

      const lastTransition = this.stack[ this.stackPosition ];

      // If we just modified the same edge again, we'll want to undo any solving/etc. we did.
      if ( lastTransition.action && lastTransition.action.edge === edge ) {
        this.stackPosition--;
      }

      this.wipeStackTop();

      const userAction = new EdgeStateSetAction( edge, newEdgeState );
      userAction.apply( newState );

      this.stack.push( new StateTransition( userAction, newState ) );
      this.stackPosition++;

      this.updateState();
    }
  }
}

class StateTransition<State extends TState<TFaceEdgeData>> {
  public constructor(
    public readonly action: EdgeStateSetAction | null,
    public readonly state: State
  ) {}
}
