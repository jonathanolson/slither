import { DerivedProperty, Disposable, NumberProperty, Property, TProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { InvalidStateError } from '../solver/errors/InvalidStateError.ts';
import { autoSolverFactoryProperty, safeSolve, safeSolverFactory, standardSolverFactory } from '../solver/autoSolver.ts';
import { iterateSolverFactory, withSolverFactory } from '../solver/TSolver.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { NoOpAction } from '../data/core/NoOpAction.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { puzzleToCompressedString, TSolvablePropertyPuzzle } from './TPuzzle.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { satSolve } from '../solver/SATSolver.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TAction, TSerializedAction } from '../data/core/TAction.ts';
import { CompleteValidator } from '../data/combined/CompleteValidator.ts';
import { TAnnotation } from '../data/core/TAnnotation.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { LocalStorageBooleanProperty } from '../../util/localStorage.ts';
import { getPressStyle } from './EdgePressStyle.ts';
import { TFace } from '../board/core/TFace.ts';
import EditMode, { editModeProperty } from './EditMode.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { getFaceColorPointer } from '../data/face-color/FaceColorPointer.ts';
import { TFaceColor } from '../data/face-color/TFaceColorData.ts';
import { HoverHighlight } from './HoverHighlight.ts';
import { showHoverHighlightsProperty } from '../../view/Theme.ts';
import { SelectedFaceColorHighlight } from './SelectedFaceColorHighlight.ts';

export const uiHintUsesBuiltInSolveProperty = new LocalStorageBooleanProperty( 'uiHintUsesBuiltInSolve', false );
export const showUndoRedoAllProperty = new LocalStorageBooleanProperty( 'showUndoRedoAllProperty', false );

export type PendingFaceColor = {
  face: TFace | null;
  color: TFaceColor;
};

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData> extends Disposable {

  private readonly stack: PuzzleSnapshot<Structure, Data>[];

  // Tracks how many transitions are in the stack
  private readonly stackLengthProperty = new NumberProperty( 0 );

  // Tracks the location in the stack TODO docs
  private readonly stackPositionProperty = new NumberProperty( 0 );

  public readonly undoPossibleProperty: TReadOnlyProperty<boolean>;
  public readonly redoPossibleProperty: TReadOnlyProperty<boolean>;

  public readonly currentSnapshotProperty: TReadOnlyProperty<PuzzleSnapshot<Structure, Data>>;
  public readonly hasErrorProperty: TReadOnlyProperty<boolean>;
  public readonly isSolvedProperty: TReadOnlyProperty<boolean>;

  public readonly pendingHintActionProperty: TProperty<TAnnotatedAction<TCompleteData> | null> = new Property( null );
  public readonly displayedAnnotationProperty: TReadOnlyProperty<TAnnotation | null>;

  private readonly pendingActionFaceColorProperty: TProperty<PendingFaceColor | null> = new Property( null );

  private readonly hoverEdgeProperty: TProperty<TEdge | null> = new Property( null );
  private readonly hoverFaceProperty: TProperty<TFace | null | false> = new Property( false ); // null is exterior face, false is no face (TODO this is bad)

  public readonly hoverHighlightProperty: TReadOnlyProperty<HoverHighlight | null>;
  public readonly selectedFaceColorHighlightProperty: TReadOnlyProperty<SelectedFaceColorHighlight | null>;

  public constructor(
    public readonly puzzle: TSolvablePropertyPuzzle<Structure, Data>
  ) {
    super();

    this.displayedAnnotationProperty = new DerivedProperty( [ this.pendingHintActionProperty ], action => action ? action.annotation : null );

    // Clear pending actions (e.g. face-color selection) when certain conditions happen
    const clearPendingActionListener = () => {
      this.pendingActionFaceColorProperty.value = null;
    };
    this.stackPositionProperty.lazyLink( clearPendingActionListener );
    editModeProperty.lazyLink( clearPendingActionListener );
    this.disposeEmitter.addListener( () => editModeProperty.unlink( clearPendingActionListener ) );

    this.selectedFaceColorHighlightProperty = new DerivedProperty( [
      puzzle.stateProperty,
      editModeProperty,
      this.pendingActionFaceColorProperty
    ], ( state, editMode, pendingActionFaceColor ) => {
      if ( editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE ) {
        if ( pendingActionFaceColor ) {
          const primaryFaces = state.getFacesWithColor( pendingActionFaceColor.color );
          return {
            faceColor: pendingActionFaceColor.color,
            face: pendingActionFaceColor.face,
            faces: primaryFaces
          };
        }
      }

      return null;
    } );
    this.disposeEmitter.addListener( () => this.selectedFaceColorHighlightProperty.dispose() );

    // TODO: update on shift-press too!
    this.hoverHighlightProperty = new DerivedProperty( [
      puzzle.stateProperty,
      editModeProperty,
      this.hoverEdgeProperty,
      this.hoverFaceProperty,
      showHoverHighlightsProperty,
    ], ( state, editMode, hoverEdge, hoverFace, showHoverHighlights ) => {
      if ( editMode === EditMode.EDGE_STATE || editMode === EditMode.EDGE_STATE_REVERSED ) {
        if ( hoverEdge && showHoverHighlights ) {
          const currentEdgeState = state.getEdgeState( hoverEdge );
          const newEdgeState = this.getNewEdgeState( currentEdgeState, editMode === EditMode.EDGE_STATE_REVERSED ? 2 : 0 );

          return {
            type: 'edge-state',
            edge: hoverEdge,
            simpleRegion: currentEdgeState === EdgeState.BLACK ? state.getSimpleRegionWithEdge( hoverEdge ) : null,
            potentialEdgeState: newEdgeState
          };
        }
        else {
          return null;
        }
      }
      else if ( editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE ) {
        if ( hoverFace !== false && showHoverHighlights ) {
          const primaryFaceColor = hoverFace ? this.puzzle.stateProperty.value.getFaceColor( hoverFace ) : this.puzzle.stateProperty.value.getOutsideColor();
          const primaryFaces = this.puzzle.stateProperty.value.getFacesWithColor( primaryFaceColor );

          return {
            type: 'face-color',
            faceColor: primaryFaceColor,
            face: hoverFace,
            faces: primaryFaces
          };
        }
        else {
          return null;
        }
      }
      else {
        return null;
      }
    } );
    this.hoverHighlightProperty.lazyLink( value => console.log( value ) );
    this.disposeEmitter.addListener( () => this.hoverHighlightProperty.dispose() );

    // Safe-solve our initial state (so things like simple region display works)
    {
      const newState = puzzle.stateProperty.value.clone();
      safeSolve( puzzle.board, newState );
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
      if ( snapshot.state.getWeirdEdges().length || snapshot.state.hasInvalidFaceColors() ) {
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
    this.pendingHintActionProperty.value = null;
    this.puzzle.stateProperty.value = this.stack[ this.stackPositionProperty.value ].state;

    setTimeout( () => {
      localStorage.setItem( 'puzzleString', puzzleToCompressedString( this.puzzle ) );
    }, 0 );
  }

  private wipeStackTop(): void {
    while ( this.stack.length > this.stackPositionProperty.value + 1 ) {
      this.stack.pop();
    }
    this.stackLengthProperty.value = this.stack.length;
  }

  private pushTransitionAtCurrentPosition( transition: PuzzleSnapshot<Structure, Data> ): void {
    this.wipeStackTop();
    this.stack.push( transition );
    this.stackLengthProperty.value = this.stack.length;
    this.stackPositionProperty.value++;
  }

  private applyUserActionToStack(
    userAction: PuzzleModelUserAction,
    checkAutoSolve?: ( state: TState<Data> ) => boolean
  ): void {
    // TODO: have a way of creating a "solid" state from a delta?
    // TODO: we need to better figure this out(!)

    const lastTransition = this.stack[ this.stackPositionProperty.value ];
    const state = lastTransition.state;

    let errorDetected = false;

    // Validate against the solution!
    const validator = new CompleteValidator( this.puzzle.board, state, this.puzzle.solution.solvedState );
    try {
      userAction.apply( validator );
    }
    catch ( e ) {
      errorDetected = true;
    }

    let delta = state.createDelta();
    try {
      withSolverFactory( autoSolverFactoryProperty.value, this.puzzle.board, delta, () => {
        userAction.apply( delta );
      }, userAction instanceof UserLoadPuzzleAutoSolveAction );

      // Hah, if we try to white out something, don't immediately solve it back!
      // TODO: why the cast here?
      if ( checkAutoSolve && !checkAutoSolve( delta as unknown as TState<Data> ) ) {
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

    const newState = state.clone();
    delta.apply( newState );

    this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, userAction, newState, errorDetected ) );
  }

  private addAutoSolveDelta(): void {
    const autoSolveDelta = this.puzzle.stateProperty.value.createDelta();
    try {
      iterateSolverFactory( autoSolverFactoryProperty.value, this.puzzle.board, autoSolveDelta, true );

      if ( !autoSolveDelta.isEmpty() ) {
        const autoSolveState = this.puzzle.stateProperty.value.clone();
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

  public getNewEdgeState( oldEdgeState: EdgeState, button: 0 | 1 | 2 ): EdgeState {
    const isReversed = editModeProperty.value === EditMode.EDGE_STATE_REVERSED;

    const style = getPressStyle( isReversed ? ( 2 - button ) as 0 | 1 | 2 : button );
    return style.apply( oldEdgeState );
  }

  public onUserEdgePress( edge: TEdge, button: 0 | 1 | 2 ): void {
    const oldEdgeState = this.puzzle.stateProperty.value.getEdgeState( edge );
    const newEdgeState = this.getNewEdgeState( oldEdgeState, button );

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

  public onUserFacePress( face: TFace | null, button: 0 | 1 | 2 ): void {
    let isSame = editModeProperty.value === EditMode.FACE_COLOR_MATCH;
    if ( button === 2 ) {
      isSame = !isSame;
    }

    const color = face ? this.puzzle.stateProperty.value.getFaceColor( face ) : this.puzzle.stateProperty.value.getOutsideColor();

    // TODO: handle resetting this on mode changes

    const pendingAction = this.pendingActionFaceColorProperty.value;
    if ( pendingAction ) {
      // no-op for same face
      if ( face !== pendingAction.face ) {
        const otherColor = pendingAction.color;

        // no-op for same color
        if ( otherColor !== color ) {
          if ( isSame ) {
            this.applyUserActionToStack( new FaceColorMakeSameAction(
              getFaceColorPointer( this.puzzle.stateProperty.value, color ),
              getFaceColorPointer( this.puzzle.stateProperty.value, otherColor )
            ) );
          }
          else {
            this.applyUserActionToStack( new FaceColorMakeOppositeAction(
              getFaceColorPointer( this.puzzle.stateProperty.value, color ),
              getFaceColorPointer( this.puzzle.stateProperty.value, otherColor )
            ) );
          }
        }
      }

      this.pendingActionFaceColorProperty.value = null;

      this.updateState();
    }
    else {
      this.pendingActionFaceColorProperty.value = {
        face: face,
        color: color
      };
    }
  }

  public onUserEdgeHover( edge: TEdge, isOver: boolean ): void {
    if ( isOver ) {
      this.hoverEdgeProperty.value = edge;
    }
    else {
      this.hoverEdgeProperty.value = null;
    }
  }

  public onUserFaceHover( face: TFace | null, isOver: boolean ): void {
    if ( isOver ) {
      this.hoverFaceProperty.value = face;
    }
    else {
      this.hoverFaceProperty.value = false;
    }
  }

  public onUserRequestSolve(): void {
    const state = this.puzzle.stateProperty.value;

    if ( !simpleRegionIsSolved( state ) ) {

      if ( uiHintUsesBuiltInSolveProperty.value ) {
        const moreSolvedState = state.clone();

        iterateSolverFactory( standardSolverFactory, this.puzzle.board, moreSolvedState, true );

        this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, new UserRequestSolveAction(), moreSolvedState, false ) );
        this.updateState();
      }
      else {
        const solutions = satSolve( this.puzzle.board, this.puzzle.stateProperty.value, {
          maxIterations: 10000,
          failOnMultipleSolutions: true
        } );

        if ( solutions.length === 1 ) {
          const solvedState = this.puzzle.stateProperty.value.clone();

          solutions[ 0 ].forEach( edge => {
            solvedState.setEdgeState( edge, EdgeState.BLACK );
          } );
          safeSolve( this.puzzle.board, solvedState );

          this.pushTransitionAtCurrentPosition( new PuzzleSnapshot( this.puzzle.board, new UserRequestSolveAction(), solvedState, false ) );
          this.updateState();
        }
        else if ( solutions.length === 0 ) {
          console.log( 'No solution found' );
        }
        else {
          console.log( 'Multiple solution found?!?' );
        }
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

  public onUserRequestHint(): void {
    if ( this.pendingHintActionProperty.value ) {
      const action = this.pendingHintActionProperty.value;
      this.pendingHintActionProperty.value = null;

      this.applyUserActionToStack( new UserPuzzleHintApplyAction( action ) );

      this.updateState();
    }
    else {
      const state = this.puzzle.stateProperty.value.clone();

      const solver = standardSolverFactory( this.puzzle.board, state, true );

      try {
        const action = solver.nextAction();

        if ( action ) {
          const validator = new CompleteValidator( this.puzzle.board, state, this.puzzle.solution.solvedState );
          let valid = true;
          try {
            action.apply( validator );
          }
          catch ( e ) {
            if ( e instanceof InvalidStateError ) {
              valid = false;
            }
            else {
              throw e;
            }
          }

          console.log( valid ? 'valid' : 'INVALID', action );
          this.pendingHintActionProperty.value = action;

          // action.apply( state );
        }
        else {
          console.log( 'no action' );
        }
      }
      catch ( e ) {
        if ( e instanceof InvalidStateError ) {
          console.error( e );
        }
        else {
          throw e;
        }
      }
    }
  }
}

export type PuzzleModelUserAction = EdgeStateSetAction | FaceColorMakeSameAction | FaceColorMakeOppositeAction | UserLoadPuzzleAutoSolveAction | UserRequestSolveAction | UserPuzzleHintApplyAction;

export class UserLoadPuzzleAutoSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserLoadPuzzleAutoSolveAction = true;

  public override serializeAction(): TSerializedAction {
    return {
      type: 'UserLoadPuzzleAutoSolveAction'
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): UserLoadPuzzleAutoSolveAction {
    return new UserLoadPuzzleAutoSolveAction();
  }
}

export class UserRequestSolveAction extends NoOpAction<TCompleteData> {
  public readonly isUserRequestSolveAction = true;

  public override serializeAction(): TSerializedAction {
    return {
      type: 'UserRequestSolveAction'
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): UserRequestSolveAction {
    return new UserRequestSolveAction();
  }
}

export class UserPuzzleHintApplyAction implements TAnnotatedAction<TCompleteData> {
  public constructor(
    public readonly hintAction: TAnnotatedAction<TCompleteData>
  ) {}

  public get annotation(): TAnnotation {
    return this.hintAction.annotation;
  }

  public apply( state: TCompleteData ): void {
    this.hintAction.apply( state );
  }

  public getUndo( state: TCompleteData ): TAction<TCompleteData> {
    throw new Error( 'unimplemented' );
  }

  public isEmpty(): boolean {
    return this.hintAction.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    throw new Error( 'unimplemented' );
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): NoOpAction<any> {
    throw new Error( 'unimplemented' );
  }
}

export class PuzzleSnapshot<Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData> {
  public constructor(
    public readonly board: TBoard<Structure>,
    public readonly action: PuzzleModelUserAction | null,
    public readonly state: TState<Data>,
    public readonly errorDetected: boolean = false
  ) {}
}
