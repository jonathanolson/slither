import { DerivedProperty, NumberProperty, TReadOnlyProperty } from "phet-lib/axon";
import { getPressStyle } from "../config";
import { EdgeStateSetAction, TEdge, TFaceEdgeData, TPuzzle, TState, TStructure } from "./structure";
import { CompositeSolver, SimpleFaceSolver, SimpleVertexSolver } from './solver';

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<Structure extends TStructure = TStructure, State extends TState<TFaceEdgeData> = TState<TFaceEdgeData>> {

  private readonly stack: StateTransition<State>[];
  private readonly stackLengthProperty = new NumberProperty( 0 );
  private readonly stackPositionProperty = new NumberProperty( 0 );

  public readonly undoPossibleProperty: TReadOnlyProperty<boolean>;
  public readonly redoPossibleProperty: TReadOnlyProperty<boolean>;

  public constructor(
    public readonly puzzle: TPuzzle<Structure, State>
  ) {
    this.stack = [ new StateTransition( null, puzzle.stateProperty.value ) ];
    this.stackLengthProperty.value = 1;

    this.undoPossibleProperty = new DerivedProperty( [
      this.stackPositionProperty
    ], position => {
      return position > 0;
    } );

    this.redoPossibleProperty = new DerivedProperty( [
      this.stackPositionProperty, this.stackLengthProperty
    ], ( position, length ) => {
      return position < length - 1;
    } );
  }

  private updateState(): void {
    this.puzzle.stateProperty.value = this.stack[ this.stackPositionProperty.value ].state;
  }

  private wipeStackTop(): void {
    while ( this.stack.length > this.stackPositionProperty.value + 1 ) {
      this.stack.pop();
    }
    this.stackLengthProperty.value = this.stack.length;
  }

  public onUserUndo(): void {
    if ( this.stackPositionProperty.value > 0 ) {
      this.stackPositionProperty.value--;
      this.updateState();
    }
  }

  public onUserRedo(): void {
    if ( this.stackPositionProperty.value < this.stackLengthProperty.value - 1 ) {
      this.stackPositionProperty.value++;
      this.updateState();
    }
  }

  public onUserEdgePress( edge: TEdge, button: 0 | 1 | 2 ): void {
    const oldEdgeState = this.puzzle.stateProperty.value.getEdgeState( edge );
    const style = getPressStyle( button );
    const newEdgeState = style.apply( oldEdgeState );

    if ( oldEdgeState !== newEdgeState ) {


      const lastTransition = this.stack[ this.stackPositionProperty.value ];

      // If we just modified the same edge again, we'll want to undo any solving/etc. we did.
      if ( lastTransition.action && lastTransition.action.edge === edge ) {
        this.stackPositionProperty.value--;
      }

      this.wipeStackTop();

      const userAction = new EdgeStateSetAction( edge, newEdgeState );

      // TODO: how do we handle solvers? (this works well for auto-solvers, no?)
      // TODO: ... we can't interface things for TState, so ThisType<this> isn't available... how can we fix this?
      let newState = this.puzzle.stateProperty.value.clone() as State;

      const autoSolver = new CompositeSolver( [
        new SimpleVertexSolver( this.puzzle.board, newState, {
          solveJointToRed: true,
          solveOnlyOptionToBlack: true,
          solveAlmostEmptyToRed: true
        } ),
        new SimpleFaceSolver( this.puzzle.board, newState, {
          solveToRed: true,
          solveToBlack: true,
        }, [] )
      ] );
      userAction.apply( newState );
      try {
        while ( autoSolver.dirty ) {
          const action = autoSolver.nextAction();
          if ( action ) {
            action.apply( newState );
          }
        }
      }
      catch ( e ) {
        newState = this.puzzle.stateProperty.value.clone() as State;
        userAction.apply( newState );
      }
      finally {
        autoSolver.dispose();
      }

      this.stack.push( new StateTransition( userAction, newState ) );
      this.stackLengthProperty.value = this.stack.length;
      this.stackPositionProperty.value++;

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
