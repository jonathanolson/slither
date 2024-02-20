import { DerivedProperty, NumberProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { getPressStyle } from '../config';
import { EdgeStateSetAction, NoOpAction, TCompleteData, TEdge, TPuzzle, TState, TStructure } from './structure';
import { InvalidStateError } from './solver/InvalidStateError.ts';
import { autoSolverFactoryProperty, safeSolverFactory } from './solver/autoSolver.ts';
import { iterateSolverFactory, withSolverFactory } from './solver/TSolver.ts';

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> {

  private readonly stack: StateTransition<State>[];

  // Tracks how many transitions are in the stack
  private readonly stackLengthProperty = new NumberProperty( 0 );

  // Tracks the location in the stack TODO docs
  private readonly stackPositionProperty = new NumberProperty( 0 );

  public readonly undoPossibleProperty: TReadOnlyProperty<boolean>;
  public readonly redoPossibleProperty: TReadOnlyProperty<boolean>;

  public constructor(
    public readonly puzzle: TPuzzle<Structure, State>
  ) {
    // Safe-solve our initial state (so things like simple region display works)
    {
      const newState = puzzle.stateProperty.value.clone() as State;
      iterateSolverFactory( safeSolverFactory, puzzle.board, newState, true );
      puzzle.stateProperty.value = newState;
    }

    this.stack = [ new StateTransition( null, puzzle.stateProperty.value ) ];
    this.stackLengthProperty.value = 1;

    // Try auto-solve on startup (and if it works and creates a delta, we'll push it onto the stack)
    // This allows the user to "undo" the auto-solve if they don't like it.
    this.addAutoSolveDelta();
    this.updateState();

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

    autoSolverFactoryProperty.lazyLink( () => this.onAutoSolveChange() );
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

  private pushTransitionAtCurrentPosition( transition: StateTransition<State> ): void {
    this.wipeStackTop();
    this.stack.push( transition );
    this.stackLengthProperty.value = this.stack.length;
    this.stackPositionProperty.value++;
  }

  private applyUserActionToStack(
    userAction: PuzzleModelUserAction,
    checkAutoSolve?: ( state: State ) => boolean
  ): void {
    // TODO: have a way of creating a "solid" state from a delta?
    // TODO: we need to better figure this out(!)

    const lastTransition = this.stack[ this.stackPositionProperty.value ];
    const state = lastTransition.state;

    let delta = state.createDelta();
    try {
      withSolverFactory( autoSolverFactoryProperty.value, this.puzzle.board, delta, () => {
        userAction.apply( delta );
      }, userAction instanceof UserLoadPuzzleAutoSolveAction );

      // Hah, if we try to white out something, don't immediately solve it back!
      // TODO: why the cast here?
      if ( checkAutoSolve && !checkAutoSolve( delta as unknown as State ) ) {
        throw new InvalidStateError( 'Auto-solver did not respect user action' );
      }
    }
    catch ( e ) {
      if ( e instanceof InvalidStateError ) {
        console.log( 'error' );
        delta = state.createDelta();
        withSolverFactory( safeSolverFactory, this.puzzle.board, delta, () => {
          userAction.apply( delta );
        }, userAction instanceof UserLoadPuzzleAutoSolveAction );
      }
      else {
        throw e;
      }
    }

    const newState = state.clone() as State;
    delta.apply( newState );

    this.pushTransitionAtCurrentPosition( new StateTransition( userAction, newState ) );
  }

  private addAutoSolveDelta(): void {
    const autoSolveDelta = this.puzzle.stateProperty.value.createDelta();
    try {
      iterateSolverFactory( autoSolverFactoryProperty.value, this.puzzle.board, autoSolveDelta, true );

      if ( !autoSolveDelta.isEmpty() ) {
        const autoSolveState = this.puzzle.stateProperty.value.clone() as State;
        autoSolveDelta.apply( autoSolveState );
        // puzzle.stateProperty.value = autoSolveState;

        this.pushTransitionAtCurrentPosition( new StateTransition( new UserLoadPuzzleAutoSolveAction(), autoSolveState ) );
      }
    }
    catch ( e ) {
      // DO NOTHING
    }
  }

  public onAutoSolveChange(): void {
    const lastTransition = this.stack[ this.stackPositionProperty.value ];

    if ( lastTransition.action ) {
      this.stackPositionProperty.value--;
    }

    this.applyUserActionToStack( lastTransition.action || new UserLoadPuzzleAutoSolveAction() );

    this.updateState();
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

  // TODO: go to marked points once we have that
  public onUserUndoAll(): void {
    if ( this.stackPositionProperty.value > 0 ) {
      this.stackPositionProperty.value = 0;
      this.updateState();
    }
  }

  // TODO: go to marked points once we have that
  public onUserRedoAll(): void {
    if ( this.stackPositionProperty.value < this.stackLengthProperty.value - 1 ) {
      this.stackPositionProperty.value = this.stackLengthProperty.value - 1;
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
      if ( lastTransition.action && lastTransition.action instanceof EdgeStateSetAction && lastTransition.action.edge === edge ) {
        this.stackPositionProperty.value--;
      }

      const userAction = new EdgeStateSetAction( edge, newEdgeState );
      this.applyUserActionToStack( userAction, state => state.getEdgeState( edge ) === newEdgeState );

      this.updateState();
    }
  }
}

export type PuzzleModelUserAction = EdgeStateSetAction | UserLoadPuzzleAutoSolveAction;

export class UserLoadPuzzleAutoSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserLoadPuzzleAutoSolveAction = true;
}

class StateTransition<State extends TState<TCompleteData>> {
  public constructor(
    public readonly action: PuzzleModelUserAction | null,
    public readonly state: State
  ) {}
}
