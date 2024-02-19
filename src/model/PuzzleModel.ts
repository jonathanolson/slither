import { DerivedProperty, NumberProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { getPressStyle } from '../config';
import { EdgeStateSetAction, TCompleteData, TEdge, TPuzzle, TState, TStructure } from './structure';
import { InvalidStateError } from './solver/InvalidStateError.ts';
import { autoSolverFactoryProperty, safeSolverFactory } from './solver/autoSolver.ts';
import { iterateSolverFactory, withSolverFactory } from './solver/TSolver.ts';

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> {

  private readonly stack: StateTransition<State>[];
  private readonly stackLengthProperty = new NumberProperty( 0 );
  private readonly stackPositionProperty = new NumberProperty( 0 );

  public readonly undoPossibleProperty: TReadOnlyProperty<boolean>;
  public readonly redoPossibleProperty: TReadOnlyProperty<boolean>;

  public constructor(
    public readonly puzzle: TPuzzle<Structure, State>
  ) {
    // TODO: START solver?

    // auto-solve some things on load
    const newState = puzzle.stateProperty.value.clone() as State;

    iterateSolverFactory( safeSolverFactory, puzzle.board, newState, true );
    puzzle.stateProperty.value = newState;

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

      // TODO: have a way of creating a "solid" state from a delta?
      // TODO: we need to better figure this out(!)

      let delta = this.puzzle.stateProperty.value.createDelta();
      try {
        withSolverFactory( autoSolverFactoryProperty.value, this.puzzle.board, delta, () => {
          userAction.apply( delta );
        } );

        // Hah, if we try to white out something, don't immediately solve it back!
        if ( delta.getEdgeState( edge ) !== newEdgeState ) {
          throw new InvalidStateError( 'Auto-solver did not respect user action' );
        }
      }
      catch ( e ) {
        if ( e instanceof InvalidStateError ) {
          console.log( 'error' );
          delta = this.puzzle.stateProperty.value.createDelta();
          withSolverFactory( safeSolverFactory, this.puzzle.board, delta, () => {
            userAction.apply( delta );
          } );
        }
        else {
          throw e;
        }
      }

      const newState = this.puzzle.stateProperty.value.clone() as State;
      delta.apply( newState );

      this.stack.push( new StateTransition( userAction, newState ) );
      this.stackLengthProperty.value = this.stack.length;
      this.stackPositionProperty.value++;

      this.updateState();
    }
  }
}

class StateTransition<State extends TState<TCompleteData>> {
  public constructor(
    public readonly action: EdgeStateSetAction | null,
    public readonly state: State
  ) {}
}
