import { DerivedProperty, NumberProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { getPressStyle } from '../../config.ts';
import { InvalidStateError } from '../solver/InvalidStateError.ts';
import { autoSolverFactoryProperty, safeSolverFactory } from '../solver/autoSolver.ts';
import { iterateSolverFactory, withSolverFactory } from '../solver/TSolver.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { NoOpAction } from '../data/core/NoOpAction.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TPuzzle } from './TPuzzle.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { satSolve } from '../solver/SATSolver.ts';
import EdgeState from '../data/edge/EdgeState.ts';

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> {

  private readonly stack: PuzzleSnapshot<Structure, State>[];

  // Tracks how many transitions are in the stack
  private readonly stackLengthProperty = new NumberProperty( 0 );

  // Tracks the location in the stack TODO docs
  private readonly stackPositionProperty = new NumberProperty( 0 );

  public readonly undoPossibleProperty: TReadOnlyProperty<boolean>;
  public readonly redoPossibleProperty: TReadOnlyProperty<boolean>;

  public readonly currentSnapshotProperty: TReadOnlyProperty<PuzzleSnapshot<Structure, State>>;
  public readonly hasErrorProperty: TReadOnlyProperty<boolean>;
  public readonly isSolvedProperty: TReadOnlyProperty<boolean>;

  public constructor(
    public readonly puzzle: TPuzzle<Structure, State>
  ) {
    // Safe-solve our initial state (so things like simple region display works)
    {
      const newState = puzzle.stateProperty.value.clone() as State;
      iterateSolverFactory( safeSolverFactory, puzzle.board, newState, true );
      puzzle.stateProperty.value = newState;
    }

    this.stack = [ new PuzzleSnapshot( this.puzzle.board, null, puzzle.stateProperty.value ) ];
    this.stackLengthProperty.value = 1;

    // TODO: base more things on this property!
    this.currentSnapshotProperty = new DerivedProperty( [
      // TODO: this isn't an exact science... can we get something more guaranteed? Abstract out a stack?
      this.stackLengthProperty,
      this.stackPositionProperty
    ], () => {
      return this.stack[ this.stackPositionProperty.value ];
    } );
    this.hasErrorProperty = new DerivedProperty( [
      this.currentSnapshotProperty
    ], snapshot => {
      return snapshot.errorDetected;
    } );
    this.isSolvedProperty = new DerivedProperty( [
      this.currentSnapshotProperty
    ], snapshot => {
      if ( snapshot.state.getWeirdEdges().length ) {
        return false;
      }

      const regions = snapshot.state.getSimpleRegions();
      return regions.length === 1 && regions[ 0 ].isSolved;
    } );

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

  private pushTransitionAtCurrentPosition( transition: PuzzleSnapshot<Structure, State> ): void {
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

    let errorDetected = false;

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
      errorDetected = true;
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

    this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, userAction, newState, errorDetected ) );
  }

  private addAutoSolveDelta(): void {
    const autoSolveDelta = this.puzzle.stateProperty.value.createDelta();
    try {
      iterateSolverFactory( autoSolverFactoryProperty.value, this.puzzle.board, autoSolveDelta, true );

      if ( !autoSolveDelta.isEmpty() ) {
        const autoSolveState = this.puzzle.stateProperty.value.clone() as State;
        autoSolveDelta.apply( autoSolveState );
        // puzzle.stateProperty.value = autoSolveState;

        this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, new UserLoadPuzzleAutoSolveAction(), autoSolveState ) );
      }
    }
    catch ( e ) {
      if ( e instanceof InvalidStateError ) {
        // DO NOTHING
      }
      else {
        throw e;
      }
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

  public onUserRequestSolve(): void {
    const state = this.puzzle.stateProperty.value;

    if ( !simpleRegionIsSolved( state ) ) {

      const solutions = satSolve( this.puzzle.board, this.puzzle.stateProperty.value, {
        maxIterations: 10000,
        failOnMultipleSolutions: true
      } );

      if ( solutions.length === 1 ) {
        const solvedState = this.puzzle.stateProperty.value.clone() as State;

        solutions[ 0 ].forEach( edge => {
          solvedState.setEdgeState( edge, EdgeState.BLACK );
        } );
        iterateSolverFactory( safeSolverFactory, this.puzzle.board, solvedState, true );

        this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, new UserRequestSolveAction(), solvedState, false ) );
        this.updateState();
      }
      else if ( solutions.length === 0 ) {
        // TODO: what to do?
        console.log( 'No solution found' );
      }
      else {
        // TODO: what to do?
        console.log( 'Multiple solution found?!?' );

        // debugBoardState( this.puzzle.board, solvedState, {
        //   scale: 15,
        //   left: 10,
        //   top: 10
        // } );
      }

      // Should we remove the old backtracker approach?

      // try {
      //   // TODO: parameterize PuzzleModel by <Data> instead of <State> to fix this type issue
      //   const solutions = getBacktrackedSolutions<State>( this.puzzle.board, state as TState<State>, {
      //     failOnMultipleSolutions: true,
      //     useEdgeBacktrackerSolver: true
      //   } );
      //
      //   // TODO: what to do if we have NO solution???
      //   if ( solutions.length === 1 ) {
      //
      //     this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, new UserRequestSolveAction(), solutions[ 0 ], false ) );
      //
      //     this.updateState();
      //   }
      // }
      // catch ( e ) {
      //   if ( e instanceof MultipleSolutionsError ) {
      //     // TODO: what should we do?
      //     console.log( 'Multiple solutions found' );
      //   }
      //   else {
      //     throw e;
      //   }
      // }
    }
  }
}

export type PuzzleModelUserAction = EdgeStateSetAction | UserLoadPuzzleAutoSolveAction | UserRequestSolveAction;

export class UserLoadPuzzleAutoSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserLoadPuzzleAutoSolveAction = true;
}

export class UserRequestSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserRequestSolveAction = true;
}

export class PuzzleSnapshot<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> {
  public constructor(
    public readonly board: TBoard<Structure>,
    public readonly action: PuzzleModelUserAction | null,
    public readonly state: State,
    public readonly errorDetected: boolean = false
  ) {}
}
