import { DerivedProperty, Disposable, NumberProperty, Property, TProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { InvalidStateError } from '../solver/errors/InvalidStateError.ts';
import { autoSolveEnabledProperty } from '../solver/autoSolver.ts';
import { AnnotatedSolverFactory, iterateSolverFactory, withSolverFactory } from '../solver/TSolver.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { puzzleToCompressedString, TSolvablePropertyPuzzle } from './TPuzzle.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { satSolve } from '../solver/SATSolver.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
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
import { TSector } from '../data/sector-state/TSector.ts';
import { SelectedSectorEdit } from './SelectedSectorEdit.ts';
import SectorState from '../data/sector-state/SectorState.ts';
import { SectorStateSetAction } from '../data/sector-state/SectorStateSetAction.ts';
import { TPuzzleStyle } from '../../view/puzzle/TPuzzleStyle.ts';
import { isAnnotationDisplayedForStyle } from '../../view/isAnnotationDisplayedForStyle.ts';
import { standardSolverFactory } from '../solver/standardSolverFactory.ts';
import { currentPuzzleStyle } from '../../view/puzzle/puzzleStyles.ts';
import { safeSolveWithFactory } from '../solver/safeSolveWithFactory.ts';
import { UserLoadPuzzleAutoSolveAction } from './UserLoadPuzzleAutoSolveAction.ts';
import { UserRequestSolveAction } from './UserRequestSolveAction.ts';
import { UserPuzzleHintApplyAction } from './UserPuzzleHintApplyAction.ts';
import { patternSolverFactory } from '../solver/patternSolverFactory.ts';

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
  private readonly pendingActionSectorProperty: TProperty<TSector | null> = new Property( null );

  private readonly hoverEdgeProperty: TProperty<TEdge | null> = new Property( null );
  private readonly hoverFaceProperty: TProperty<TFace | null | false> = new Property( false ); // null is exterior face, false is no face (TODO this is bad)
  private readonly hoverSectorProperty: TProperty<TSector | null> = new Property( null );

  public readonly hoverHighlightProperty: TReadOnlyProperty<HoverHighlight | null>;
  public readonly selectedFaceColorHighlightProperty: TReadOnlyProperty<SelectedFaceColorHighlight | null>;
  public readonly selectedSectorEditProperty: TReadOnlyProperty<SelectedSectorEdit | null>;

  private readonly autoSolverFactoryProperty: TReadOnlyProperty<AnnotatedSolverFactory<TStructure, TCompleteData>>;

  public constructor(
    public readonly puzzle: TSolvablePropertyPuzzle<Structure, Data>,
    public readonly style: TPuzzleStyle = currentPuzzleStyle // TODO: see if we can just have a model-based one?
  ) {
    super();

    this.autoSolverFactoryProperty = new DerivedProperty( [
      autoSolveEnabledProperty,
      style.safeSolverFactoryProperty,
      style.autoSolverFactoryProperty
    ], ( enabled, safeSolverFactory, autoSolverFactory ) => {
      return enabled ? autoSolverFactory : safeSolverFactory;
    } );

    this.displayedAnnotationProperty = new DerivedProperty( [ this.pendingHintActionProperty ], action => action ? action.annotation : null );

    // Clear pending actions (e.g. face-color selection) when certain conditions happen
    const clearPendingActionListener = () => {
      this.pendingActionFaceColorProperty.value = null;
      this.pendingActionSectorProperty.value = null;
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

    this.selectedSectorEditProperty = new DerivedProperty( [
      puzzle.stateProperty,
      editModeProperty,
      this.pendingActionSectorProperty
    ], ( state, editMode, pendingActionSector ) => {
      if ( editMode === EditMode.SECTOR_STATE && pendingActionSector ) {
        return {
          sector: pendingActionSector,
          currentState: state.getSectorState( pendingActionSector )
        };
      }
      else {
        return null;
      }
    } );
    this.disposeEmitter.addListener( () => this.selectedSectorEditProperty.dispose() );

    // TODO: update on shift-press too!
    this.hoverHighlightProperty = new DerivedProperty( [
      puzzle.stateProperty,
      editModeProperty,
      this.hoverEdgeProperty,
      this.hoverFaceProperty,
      this.hoverSectorProperty,
      showHoverHighlightsProperty,
    ], ( state, editMode, hoverEdge, hoverFace, hoverSector, showHoverHighlights ) => {
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
      else if ( editMode === EditMode.SECTOR_STATE ) {
        if ( hoverSector && showHoverHighlights ) {
          return {
            type: 'sector',
            sector: hoverSector
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
    this.disposeEmitter.addListener( () => this.hoverHighlightProperty.dispose() );

    // Safe-solve our initial state (so things like simple region display works)
    {
      const newState = puzzle.stateProperty.value.clone();
      safeSolveWithFactory( puzzle.board, newState, this.style.safeSolverFactoryProperty.value );
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

    const solverChangeListener = () => this.onAutoSolveChange();
    this.autoSolverFactoryProperty.lazyLink( solverChangeListener );
    this.style.safeSolverFactoryProperty.lazyLink( solverChangeListener );
    this.disposeEmitter.addListener( () => {
      this.autoSolverFactoryProperty.unlink( solverChangeListener );
      this.style.safeSolverFactoryProperty.unlink( solverChangeListener );
    } );
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
    options?: {
      checkAutoSolve?: ( state: TState<Data> ) => boolean;
      forceDirty?: boolean;
    }
  ): void {
    // TODO: have a way of creating a "solid" state from a delta?
    // TODO: we need to better figure this out(!)

    const dirty = options?.forceDirty || userAction instanceof UserLoadPuzzleAutoSolveAction;

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
      withSolverFactory( this.autoSolverFactoryProperty.value, this.puzzle.board, delta, () => {
        userAction.apply( delta );
      }, dirty );

      // Hah, if we try to white out something, don't immediately solve it back!
      // TODO: why the cast here?
      if ( options?.checkAutoSolve && !options?.checkAutoSolve( delta as unknown as TState<Data> ) ) {
        throw new InvalidStateError( 'Auto-solver did not respect user action' );
      }
    }
    catch ( e ) {
      errorDetected = true;
      if ( e instanceof InvalidStateError ) {
        console.log( 'error' );
        delta = state.createDelta();
        withSolverFactory( this.style.safeSolverFactoryProperty.value, this.puzzle.board, delta, () => {
          userAction.apply( delta );
        }, dirty );
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
      iterateSolverFactory( this.autoSolverFactoryProperty.value, this.puzzle.board, autoSolveDelta, true );

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

    this.applyUserActionToStack( lastTransition.action || new UserLoadPuzzleAutoSolveAction(), {
      forceDirty: true
    } );

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

  public onUserEscape(): void {
    this.pendingActionFaceColorProperty.value = null;
    this.pendingActionSectorProperty.value = null;
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
      this.applyUserActionToStack( userAction, {
        checkAutoSolve: state => state.getEdgeState( edge ) === newEdgeState
      } );

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

  public onUserSectorPress( sector: TSector, button: 0 | 1 | 2 ): void {
    this.pendingActionSectorProperty.value = sector;
  }

  public onUserSectorSet( sector: TSector, state: SectorState ): void {
    this.applyUserActionToStack( new SectorStateSetAction( sector, state ) );

    this.pendingActionSectorProperty.value = null;

    this.updateState();
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

  public onUserSectorHover( sector: TSector, isOver: boolean ): void {
    if ( isOver ) {
      this.hoverSectorProperty.value = sector;
    }
    else {
      this.hoverSectorProperty.value = null;
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
          safeSolveWithFactory( this.puzzle.board, solvedState, this.style.safeSolverFactoryProperty.value );

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

      // TODO: figure out what is best here
      // TODO: make sure our entire puzzle isn't too small that the no-loop thing would cause an error
      // const solver = standardSolverFactory( this.puzzle.board, state, true );
      // const solver = new ScanPatternSolver( this.puzzle.board, state, all10Edge20HighlanderCollection.getRules() );
      const solver = patternSolverFactory( this.puzzle.board, state, true );

      try {
        let action = solver.nextAction();

        while ( action ) {
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

          if ( !valid ) {
            console.error( 'invalid action', action );
          }
          // console.log( valid ? 'valid' : 'INVALID', action );

          if ( isAnnotationDisplayedForStyle( action.annotation, this.style ) ) {
            this.pendingHintActionProperty.value = action;
            break;
          }
          else {
            action.apply( state );
            action = solver.nextAction();
          }
        }

        // if ( !this.pendingHintActionProperty.value ) {
        //   console.log( 'no recommended actions' );
        // }
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

export type PuzzleModelUserAction = EdgeStateSetAction | FaceColorMakeSameAction | FaceColorMakeOppositeAction | SectorStateSetAction | UserLoadPuzzleAutoSolveAction | UserRequestSolveAction | UserPuzzleHintApplyAction;

export class PuzzleSnapshot<Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData> {
  public constructor(
    public readonly board: TBoard<Structure>,
    public readonly action: PuzzleModelUserAction | null,
    public readonly state: TState<Data>,
    public readonly errorDetected: boolean = false
  ) {}
}
