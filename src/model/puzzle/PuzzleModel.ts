import { CorrectnessState } from '../CorrectnessState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TFace } from '../board/core/TFace.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { CompleteValidator } from '../data/combined/CompleteValidator.ts';
import { EraseEdgeCompleteAction } from '../data/combined/EraseEdgeCompleteAction.ts';
import { EraseFaceCompleteAction } from '../data/combined/EraseFaceCompleteAction.ts';
import { EraseSectorCompleteAction } from '../data/combined/EraseSectorCompleteAction.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TSerializedAction } from '../data/core/TAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TAnnotation } from '../data/core/TAnnotation.ts';
import { TState } from '../data/core/TState.ts';
import { deserializeAction } from '../data/core/deserializeAction.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import { FaceColorSetAbsoluteAction } from '../data/face-color/FaceColorSetAbsoluteAction.ts';
import FaceColorState, { TFaceColor } from '../data/face-color/TFaceColorData.ts';
import { getFaceColorPointer } from '../data/face-color/getFaceColorPointer.ts';
import SectorState from '../data/sector-state/SectorState.ts';
import { SectorStateSetAction } from '../data/sector-state/SectorStateSetAction.ts';
import { TSector } from '../data/sector-state/TSector.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { satSolve } from '../solver/SATSolver.ts';
import { AnnotatedSolverFactory, iterateSolverFactory, withSolverFactory } from '../solver/TSolver.ts';
import { autoSolveEnabledProperty } from '../solver/autoSolver.ts';
import { AutoSolverInvalidatedUserActionError } from '../solver/errors/AutoSolverInvalidatedUserActionError.ts';
import { InvalidStateError } from '../solver/errors/InvalidStateError.ts';
import { safeSolveWithFactory } from '../solver/safeSolveWithFactory.ts';
import { standardSolverFactory } from '../solver/standardSolverFactory.ts';
import EditMode, { editModeProperty, eraserEnabledProperty } from './EditMode.ts';
import { FaceDrag } from './FaceDrag.ts';
import FaceDragState from './FaceDragState.ts';
import HintState from './HintState.ts';
import { LineDrag } from './LineDrag.ts';
import LineDragState from './LineDragState.ts';
import { SelectedFaceColorHighlight } from './SelectedFaceColorHighlight.ts';
import { SelectedSectorEdit } from './SelectedSectorEdit.ts';
import { stateTransitionModeProperty } from './StateTransitionMode.ts';
import { TSolvablePropertyPuzzle } from './TPuzzle.ts';
import { UserEdgeDragAction } from './UserEdgeDragAction.ts';
import { UserFaceDragAction } from './UserFaceDragAction.ts';
import { UserLoadPuzzleAutoSolveAction } from './UserLoadPuzzleAutoSolveAction.ts';
import { UserPuzzleHintApplyAction } from './UserPuzzleHintApplyAction.ts';
import { UserRequestSolveAction } from './UserRequestSolveAction.ts';
import { puzzleToCompressedString } from './puzzleToCompressedString.ts';
import { serializedSolvablePuzzle } from './serializedSolvablePuzzle.ts';

import {
  DerivedProperty,
  Disposable,
  TEmitter,
  TProperty,
  TReadOnlyProperty,
  TinyEmitter,
  TinyProperty,
} from 'phet-lib/axon';
import { Vector2 } from 'phet-lib/dot';
import { optionize } from 'phet-lib/phet-core';

import { LocalStorageBooleanProperty, LocalStorageNumberProperty } from '../../util/localStorage.ts';

import { TPuzzleStyle } from '../../view/puzzle/TPuzzleStyle.ts';
import { currentPuzzleStyle } from '../../view/puzzle/puzzleStyles.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

import { getHintWorker, hintWorkerLoadedProperty } from '../../workers/getHintWorker.ts';

export const uiHintUsesBuiltInSolveProperty = new LocalStorageBooleanProperty('uiHintUsesBuiltInSolve', false);
export const showUndoRedoAllProperty = new LocalStorageBooleanProperty('showUndoRedoAllProperty', false);

export const dimCompletedNumbersProperty = new LocalStorageBooleanProperty('dimCompletedNumbersProperty', true);
export const highlightIncorrectNumbersProperty = new LocalStorageBooleanProperty(
  'highlightIncorrectNumbersProperty',
  true,
);
export const highlightIncorrectMovesProperty = new LocalStorageBooleanProperty('highlightIncorrectMovesProperty', true);
export const highlightIntersectionsProperty = new LocalStorageBooleanProperty('highlightIntersectionsProperty', true);

export const highlightIncorrectMovesDelayProperty = new LocalStorageNumberProperty(
  'highlightIncorrectMovesDelayProperty',
  0.7,
);

export type PendingFaceColor = {
  face: TFace | null;
  color: TFaceColor;
};

export type PuzzleModelOptions = {
  style?: TPuzzleStyle;
  initialTimeElapsed?: number;
};

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModel<
  Structure extends TStructure = TStructure,
  Data extends TCompleteData = TCompleteData,
> extends Disposable {
  // In seconds
  public readonly timeElapsedProperty: TProperty<number> = new TinyProperty(0);

  public readonly hintStateProperty: TProperty<HintState> = new TinyProperty(HintState.DEFAULT);

  public readonly edgeAutoSolvedEmitter: TEmitter<[TEdge]> = new TinyEmitter();

  private readonly stack: PuzzleSnapshot<Structure, Data>[];

  // Tracks how many transitions are in the stack
  private readonly stackLengthProperty: TProperty<number> = new TinyProperty(0);

  // Tracks the location in the stack TODO docs
  private readonly stackPositionProperty: TProperty<number> = new TinyProperty(0);

  public readonly undoPossibleProperty: TReadOnlyProperty<boolean>;
  public readonly redoPossibleProperty: TReadOnlyProperty<boolean>;

  public readonly currentSnapshotProperty: TReadOnlyProperty<PuzzleSnapshot<Structure, Data>>;
  public readonly hasErrorProperty: TReadOnlyProperty<boolean>;
  public readonly correctnessStateProperty: TReadOnlyProperty<CorrectnessState>;
  public readonly isSolvedProperty: TReadOnlyProperty<boolean>;

  private hintWorkerMessageID = 0;
  private addedHintListener = false;
  public readonly pendingHintActionProperty: TProperty<TAnnotatedAction<TCompleteData> | null> = new TinyProperty(null);
  public readonly displayedAnnotationProperty: TReadOnlyProperty<TAnnotation | null>;

  private readonly pendingActionFaceColorProperty: TProperty<PendingFaceColor | null> = new TinyProperty(null);
  private readonly pendingActionSectorProperty: TProperty<TSector | null> = new TinyProperty(null);

  public readonly selectedFaceColorHighlightProperty: TReadOnlyProperty<SelectedFaceColorHighlight | null>;
  public readonly selectedSectorEditProperty: TReadOnlyProperty<SelectedSectorEdit | null>;

  private readonly autoSolverFactoryProperty: TReadOnlyProperty<AnnotatedSolverFactory<TStructure, TCompleteData>>;

  public readonly style: TPuzzleStyle;

  public readonly lineDrag: LineDrag;
  public readonly faceDrag: FaceDrag;

  public constructor(
    public readonly puzzle: TSolvablePropertyPuzzle<Structure, Data>,
    providedOptions?: PuzzleModelOptions,
  ) {
    const options = optionize<PuzzleModelOptions>()(
      {
        style: currentPuzzleStyle,
        initialTimeElapsed: 0,
      },
      providedOptions,
    );

    const style = options.style;

    super();

    this.style = style;
    this.timeElapsedProperty.value = options.initialTimeElapsed;

    this.lineDrag = new LineDrag(puzzle.board);
    this.faceDrag = new FaceDrag(puzzle.board);

    this.autoSolverFactoryProperty = new DerivedProperty(
      [autoSolveEnabledProperty, style.safeSolverFactoryProperty, style.autoSolverFactoryProperty],
      (enabled, safeSolverFactory, autoSolverFactory) => {
        return enabled ? autoSolverFactory : safeSolverFactory;
      },
    );

    this.displayedAnnotationProperty = new DerivedProperty([this.pendingHintActionProperty], (action) =>
      action ? action.annotation : null,
    );

    // Clear pending actions (e.g. face-color selection) when certain conditions happen
    const clearPendingActionListener = this.clearPendingAction.bind(this);
    this.stackPositionProperty.lazyLink(clearPendingActionListener);
    editModeProperty.lazyLink(clearPendingActionListener);
    this.disposeEmitter.addListener(() => editModeProperty.unlink(clearPendingActionListener));

    this.selectedFaceColorHighlightProperty = new DerivedProperty(
      [puzzle.stateProperty, editModeProperty, this.pendingActionFaceColorProperty],
      (state, editMode, pendingActionFaceColor) => {
        if (editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE) {
          if (pendingActionFaceColor) {
            const primaryFaces = state.getFacesWithColor(pendingActionFaceColor.color);
            return {
              faceColor: pendingActionFaceColor.color,
              face: pendingActionFaceColor.face,
              faces: primaryFaces,
            };
          }
        }

        return null;
      },
    );
    this.disposeEmitter.addListener(() => this.selectedFaceColorHighlightProperty.dispose());

    this.selectedSectorEditProperty = new DerivedProperty(
      [puzzle.stateProperty, editModeProperty, this.pendingActionSectorProperty],
      (state, editMode, pendingActionSector) => {
        if (editMode === EditMode.SECTOR_STATE && pendingActionSector) {
          return {
            sector: pendingActionSector,
            currentState: state.getSectorState(pendingActionSector),
          };
        } else {
          return null;
        }
      },
    );
    this.disposeEmitter.addListener(() => this.selectedSectorEditProperty.dispose());

    // Safe-solve our initial state (so things like simple region display works)
    {
      const newState = puzzle.stateProperty.value.clone();
      safeSolveWithFactory(puzzle.board, newState, this.style.safeSolverFactoryProperty.value);
      puzzle.stateProperty.value = newState;
    }

    this.stack = [this.getSnapshot(null, puzzle.stateProperty.value)];
    this.stackLengthProperty.value = 1;

    // TODO: base more things on this property!
    this.currentSnapshotProperty = new DerivedProperty(
      [
        // TODO: this isn't an exact science... can we get something more guaranteed? Abstract out a stack?
        this.stackLengthProperty,
        this.stackPositionProperty,
      ],
      () => {
        return this.stack[this.stackPositionProperty.value];
      },
    );
    this.hasErrorProperty = new DerivedProperty([this.currentSnapshotProperty], (snapshot) => {
      return !snapshot.correctnessState.isCorrect();
    });
    this.correctnessStateProperty = new DerivedProperty([this.currentSnapshotProperty], (snapshot) => {
      return snapshot.correctnessState;
    });
    this.isSolvedProperty = new DerivedProperty([this.currentSnapshotProperty], (snapshot) => {
      if (snapshot.state.getWeirdEdges().length || snapshot.state.hasInvalidFaceColors()) {
        return false;
      }

      const regions = snapshot.state.getSimpleRegions();
      return regions.length === 1 && regions[0].isSolved;
    });

    // Try auto-solve on startup (and if it works and creates a delta, we'll push it onto the stack)
    // This allows the user to "undo" the auto-solve if they don't like it.
    this.addAutoSolveDelta();
    this.updateState();

    this.undoPossibleProperty = new DerivedProperty([this.stackPositionProperty], (position) => {
      return position > 0;
    });

    this.redoPossibleProperty = new DerivedProperty(
      [this.stackPositionProperty, this.stackLengthProperty],
      (position, length) => {
        return position < length - 1;
      },
    );

    const solverChangeListener = () => this.onAutoSolveChange();
    this.autoSolverFactoryProperty.lazyLink(solverChangeListener);
    this.style.safeSolverFactoryProperty.lazyLink(solverChangeListener);
    this.disposeEmitter.addListener(() => {
      this.autoSolverFactoryProperty.unlink(solverChangeListener);
      this.style.safeSolverFactoryProperty.unlink(solverChangeListener);
    });
  }

  private clearPendingAction(): void {
    this.pendingActionFaceColorProperty.value = null;
    this.pendingActionSectorProperty.value = null;
  }

  public step(dt: number): void {
    if (!this.isSolvedProperty.value) {
      this.timeElapsedProperty.value += Math.min(dt, 5); // Limit the jump (if they tab back in)
      localStorage.setItem('timeElapsedProperty', JSON.stringify(this.timeElapsedProperty.value));
    }
  }

  private updateState(): void {
    this.clearPendingHint();

    this.puzzle.stateProperty.value = this.stack[this.stackPositionProperty.value].state;

    setTimeout(() => {
      localStorage.setItem('puzzleString', puzzleToCompressedString(this.puzzle));
    }, 0);
  }

  private wipeStackTop(): void {
    while (this.stack.length > this.stackPositionProperty.value + 1) {
      this.stack.pop();
    }
    this.stackLengthProperty.value = this.stack.length;
  }

  private pushTransitionAtCurrentPosition(transition: PuzzleSnapshot<Structure, Data>): void {
    this.wipeStackTop();
    this.stack.push(transition);
    this.stackLengthProperty.value = this.stack.length;
    this.stackPositionProperty.value++;
  }

  private applyUserActionToStack(
    userAction: PuzzleModelUserAction,
    options?: {
      erase?: (state: TState<Data>) => void;

      checkAutoSolve?: (state: TState<Data>) => boolean;
      forceDirty?: boolean;

      // Edges changed in the user action directly, that should not be treated as autosolved if changed.
      excludedEdges?: Set<TEdge>;
    },
  ): void {
    // TODO: have a way of creating a "solid" state from a delta?
    // TODO: we need to better figure this out(!)

    const dirty = options?.forceDirty || userAction instanceof UserLoadPuzzleAutoSolveAction;

    const lastTransition = this.stack[this.stackPositionProperty.value];

    let cleanState = lastTransition.state;
    if (options?.erase) {
      cleanState = cleanState.clone();
      options.erase(cleanState);
    }

    let changedEdges = new Set<TEdge>();
    const edgeChangeListener = (edge: TEdge) => {
      changedEdges.add(edge);
    };

    let delta = cleanState.createDelta();
    try {
      delta.edgeStateChangedEmitter.addListener(edgeChangeListener);

      withSolverFactory(
        this.autoSolverFactoryProperty.value,
        this.puzzle.board,
        delta,
        () => {
          userAction.apply(delta);
        },
        dirty,
      );

      delta.edgeStateChangedEmitter.removeListener(edgeChangeListener);

      // Hah, if we try to white out something, don't immediately solve it back!
      // TODO: why the cast here?
      if (options?.checkAutoSolve && !options?.checkAutoSolve(delta as unknown as TState<Data>)) {
        throw new AutoSolverInvalidatedUserActionError('Auto-solver did not respect user action');
      }
    } catch (e) {
      changedEdges = new Set();

      if (e instanceof InvalidStateError || e instanceof AutoSolverInvalidatedUserActionError) {
        if (e instanceof InvalidStateError) {
          console.log('error');
        } else if (e instanceof AutoSolverInvalidatedUserActionError) {
          console.log('skipping autosolve due to undo');
        }
        delta = cleanState.createDelta();

        delta.edgeStateChangedEmitter.addListener(edgeChangeListener);

        withSolverFactory(
          this.style.safeSolverFactoryProperty.value,
          this.puzzle.board,
          delta,
          () => {
            userAction.apply(delta);
          },
          dirty,
        );

        delta.edgeStateChangedEmitter.removeListener(edgeChangeListener);
      } else {
        throw e;
      }
    }

    const newState = cleanState.clone();
    delta.apply(newState);

    this.pushTransitionAtCurrentPosition(this.getSnapshot(userAction, newState));

    for (const changedEdge of changedEdges) {
      if (!options?.excludedEdges || !options.excludedEdges.has(changedEdge)) {
        console.log('autosolved an edge');

        this.edgeAutoSolvedEmitter.emit(changedEdge);
      }
    }
  }

  private computeCorrectnessState(state = this.puzzle.stateProperty.value): CorrectnessState {
    return CompleteValidator.getCorrectnessState(this.puzzle.board, state, this.puzzle.solution.solvedState);
  }

  private getSnapshot(userAction: PuzzleModelUserAction | null, state: TState<Data>): PuzzleSnapshot<Structure, Data> {
    return new PuzzleSnapshot(this.puzzle.board, userAction, state, this.computeCorrectnessState(state));
  }

  private addAutoSolveDelta(): void {
    const autoSolveDelta = this.puzzle.stateProperty.value.createDelta();
    try {
      iterateSolverFactory(this.autoSolverFactoryProperty.value, this.puzzle.board, autoSolveDelta, true);

      if (!autoSolveDelta.isEmpty()) {
        const autoSolveState = this.puzzle.stateProperty.value.clone();
        autoSolveDelta.apply(autoSolveState);
        // puzzle.stateProperty.value = autoSolveState;

        this.pushTransitionAtCurrentPosition(this.getSnapshot(new UserLoadPuzzleAutoSolveAction(), autoSolveState));
      }
    } catch (e) {
      if (e instanceof InvalidStateError) {
        // DO NOTHING
      } else {
        throw e;
      }
    }
  }

  public onAutoSolveChange(): void {
    const lastTransition = this.stack[this.stackPositionProperty.value];

    if (lastTransition.action) {
      this.stackPositionProperty.value--;
    }

    this.applyUserActionToStack(lastTransition.action || new UserLoadPuzzleAutoSolveAction(), {
      forceDirty: true,
    });

    this.updateState();
  }

  public onUserUndo(): void {
    if (this.stackPositionProperty.value > 0) {
      this.stackPositionProperty.value--;
      this.updateState();
    }
  }

  public onUserRedo(): void {
    if (this.stackPositionProperty.value < this.stackLengthProperty.value - 1) {
      this.stackPositionProperty.value++;
      this.updateState();
    }
  }

  // TODO: go to marked points once we have that
  public onUserUndoAll(): void {
    if (this.stackPositionProperty.value > 0) {
      this.stackPositionProperty.value = 0;
      this.updateState();
    }
  }

  // TODO: go to marked points once we have that
  public onUserRedoAll(): void {
    if (this.stackPositionProperty.value < this.stackLengthProperty.value - 1) {
      this.stackPositionProperty.value = this.stackLengthProperty.value - 1;
      this.updateState();
    }
  }

  public onUserEscape(): void {
    this.clearPendingAction();
    this.clearPendingHint();
  }

  public getNewEdgeState(oldEdgeState: EdgeState, button: 0 | 1 | 2, isReversed: boolean): EdgeState {
    if (isReversed) {
      button = 2 - button;
    }

    const style = stateTransitionModeProperty.value.edgePressStyles[button];
    console.log(stateTransitionModeProperty.value, style, button, oldEdgeState);

    return style.apply(oldEdgeState);
  }

  // false === outside, true === inside, null === undecided
  public getNewFaceColorState(
    oldFaceColorState: FaceColorState,
    button: 0 | 1 | 2,
    isReversed: boolean,
  ): FaceColorState {
    if (isReversed) {
      button = 2 - button;
    }

    const style = stateTransitionModeProperty.value.faceColorPressStyles[button];
    console.log(stateTransitionModeProperty.value, style, button, oldFaceColorState);

    return style.apply(oldFaceColorState);
  }

  private getNextEdgeState(edge: TEdge, button: 0 | 1 | 2): EdgeState {
    const isErase = eraserEnabledProperty.value;

    const oldEdgeState = this.puzzle.stateProperty.value.getEdgeState(edge);
    return isErase ?
        EdgeState.WHITE
      : this.getNewEdgeState(oldEdgeState, button, editModeProperty.value === EditMode.EDGE_STATE_REVERSED);
  }

  private getNextFaceColorState(face: TFace, button: 0 | 1 | 2): FaceColorState {
    const outsideColor = this.puzzle.stateProperty.value.getOutsideColor();
    const insideColor = this.puzzle.stateProperty.value.getInsideColor();

    const oldColor = this.puzzle.stateProperty.value.getFaceColor(face);

    const oldFaceColorState =
      oldColor === outsideColor ? FaceColorState.OUTSIDE
      : oldColor === insideColor ? FaceColorState.INSIDE
      : FaceColorState.UNDECIDED;
    return this.getNewFaceColorState(oldFaceColorState, button, editModeProperty.value === EditMode.FACE_COLOR_OUTSIDE);
  }

  public onUserEdgePress(edge: TEdge, button: 0 | 1 | 2): void {
    const oldEdgeState = this.puzzle.stateProperty.value.getEdgeState(edge);
    const newEdgeState = this.getNextEdgeState(edge, button);

    if (oldEdgeState !== newEdgeState) {
      const lastTransition = this.stack[this.stackPositionProperty.value];

      // If we just modified the same edge again, we'll want to undo any solving/etc. we did.
      if (
        lastTransition.action &&
        lastTransition.action instanceof EdgeStateSetAction &&
        lastTransition.action.edge === edge
      ) {
        this.stackPositionProperty.value--;
      }

      let erase: ((state: TState<Data>) => void) | undefined = undefined;

      if (oldEdgeState !== EdgeState.WHITE) {
        erase = (state) => {
          new EraseEdgeCompleteAction(edge).apply(state);
        };
      }

      const userAction = new EdgeStateSetAction(edge, newEdgeState);

      this.applyUserActionToStack(userAction, {
        erase: erase,
        checkAutoSolve: (state) => state.getEdgeState(edge) === newEdgeState,
        excludedEdges: new Set([edge]),
      });

      this.updateState();
    }
  }

  public onUserEdgeDragStart(edge: TEdge, button: 0 | 2): void {
    if (this.lineDrag.lineDragStateProperty.value !== LineDragState.NONE) {
      return;
    }

    const nextEdgeState = this.getNextEdgeState(edge, button);

    if (nextEdgeState === EdgeState.BLACK) {
      this.lineDrag.onLineDragStart(edge);
    } else {
      this.lineDrag.onPaintDragStart(edge, nextEdgeState);
    }

    this.updateEdgeDrag();
  }

  public onUserEdgeDrag(edge: TEdge, point: Vector2): void {
    const changed = this.lineDrag.onDrag(edge, point);

    if (changed) {
      this.updateEdgeDrag();
    }
  }

  public onUserEdgeDragEnd(): void {
    this.lineDrag.onDragEnd();
  }

  private updateEdgeDrag(): void {
    const lastTransition = this.stack[this.stackPositionProperty.value];

    // Handle "overwriting" the last one
    if (
      lastTransition.action &&
      lastTransition.action instanceof UserEdgeDragAction &&
      // We will reverse either the same "drag" actions from before, OR a drag starting on the same edge from before.
      (lastTransition.action.dragIndex === this.lineDrag.dragIndex ||
        lastTransition.action.firstEdge === this.lineDrag.firstEdge)
    ) {
      this.stackPositionProperty.value--;
    }

    assertEnabled() &&
      assert(this.lineDrag.lineDragStateProperty.value !== LineDragState.NONE, 'line drag state should not be NONE');

    const edges =
      this.lineDrag.lineDragStateProperty.value === LineDragState.LINE_DRAG ?
        this.lineDrag.edgeStack.slice()
      : Array.from(this.lineDrag.paintEdgeSet);
    const edgeState =
      this.lineDrag.lineDragStateProperty.value === LineDragState.LINE_DRAG ?
        EdgeState.BLACK
      : this.lineDrag.paintEdgeState;

    const erasedEdges = edges.filter((edge) => this.puzzle.stateProperty.value.getEdgeState(edge) !== EdgeState.WHITE);
    const eraseAction = new CompositeAction<Data>(erasedEdges.map((edge) => new EraseEdgeCompleteAction(edge)));

    const userAction = new UserEdgeDragAction(this.lineDrag.firstEdge, edges, edgeState, this.lineDrag.dragIndex);

    this.applyUserActionToStack(userAction, {
      erase: (state) => eraseAction.apply(state),
      checkAutoSolve: (state) => {
        return edges.every((edge) => state.getEdgeState(edge) === edgeState);
      },
      // NOTE: Do not exclude edges, since this prevents it from mousing over them immediately.
      excludedEdges: new Set(this.puzzle.board.edges),
    });

    this.updateState();
  }

  public onUserFacePress(face: TFace | null, button: 0 | 1 | 2): void {
    const isErase = eraserEnabledProperty.value;
    const editMode = editModeProperty.value;

    if (isErase) {
      if (face) {
        const action = new EraseFaceCompleteAction(face);

        // Include the erase "early" so we don't auto-solve based on it
        this.applyUserActionToStack(action, {
          erase: (state) => action.apply(state),
        });

        this.updateState();
      }
    } else if (editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE) {
      let isSame = editModeProperty.value === EditMode.FACE_COLOR_MATCH;
      if (button === 2) {
        isSame = !isSame;
      }

      const color =
        face ? this.puzzle.stateProperty.value.getFaceColor(face) : this.puzzle.stateProperty.value.getOutsideColor();

      // TODO: handle resetting this on mode changes

      const pendingAction = this.pendingActionFaceColorProperty.value;
      if (pendingAction) {
        // no-op for same face
        if (face !== pendingAction.face) {
          const otherColor = pendingAction.color;

          // no-op for same color
          if (otherColor !== color) {
            if (isSame) {
              this.applyUserActionToStack(
                new FaceColorMakeSameAction(
                  getFaceColorPointer(this.puzzle.stateProperty.value, color),
                  getFaceColorPointer(this.puzzle.stateProperty.value, otherColor),
                ),
              );
            } else {
              this.applyUserActionToStack(
                new FaceColorMakeOppositeAction(
                  getFaceColorPointer(this.puzzle.stateProperty.value, color),
                  getFaceColorPointer(this.puzzle.stateProperty.value, otherColor),
                ),
              );
            }
          }
        }

        this.pendingActionFaceColorProperty.value = null;

        this.updateState();
      } else {
        this.pendingActionFaceColorProperty.value = {
          face: face,
          color: color,
        };
      }
    } else if (editMode === EditMode.FACE_COLOR_OUTSIDE || editMode === EditMode.FACE_COLOR_INSIDE) {
      if (face) {
        const outsideColor = this.puzzle.stateProperty.value.getOutsideColor();
        const insideColor = this.puzzle.stateProperty.value.getInsideColor();

        const oldColor = this.puzzle.stateProperty.value.getFaceColor(face);

        const oldFaceColorState =
          oldColor === outsideColor ? FaceColorState.OUTSIDE
          : oldColor === insideColor ? FaceColorState.INSIDE
          : FaceColorState.UNDECIDED;
        const newFaceColorState = this.getNewFaceColorState(
          oldFaceColorState,
          button,
          editMode === EditMode.FACE_COLOR_OUTSIDE,
        );

        if (oldFaceColorState !== newFaceColorState) {
          const lastTransition = this.stack[this.stackPositionProperty.value];

          // If we just modified the same face again, we'll want to undo any solving/etc. we did.
          if (
            lastTransition.action &&
            lastTransition.action instanceof FaceColorSetAbsoluteAction &&
            lastTransition.action.face === face
          ) {
            this.stackPositionProperty.value--;
          }

          let erase: ((state: TState<Data>) => void) | undefined = undefined;
          const eraseAction = new EraseFaceCompleteAction(face);

          if (oldFaceColorState !== FaceColorState.UNDECIDED) {
            erase = (state) => {
              eraseAction.apply(state);
            };
          }

          if (newFaceColorState === FaceColorState.UNDECIDED) {
            this.applyUserActionToStack(eraseAction, {
              erase: erase,
            });
          } else {
            this.applyUserActionToStack(
              new FaceColorSetAbsoluteAction(face, newFaceColorState === FaceColorState.INSIDE),
              {
                erase: erase,
              },
            );
          }

          this.updateState();
        }
      }
    }
  }

  public onUserFaceDragStart(face: TFace | null, button: 0 | 2): void {
    if (this.faceDrag.faceDragStateProperty.value !== FaceDragState.NONE) {
      return;
    }

    const editMode = editModeProperty.value;

    if (eraserEnabledProperty.value) {
      this.faceDrag.onAbsolutePaintStart(face, FaceColorState.UNDECIDED);
    } else if (editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE) {
      if ((editMode === EditMode.FACE_COLOR_MATCH) === (button === 0)) {
        this.faceDrag.onMakeSameStart(face);
      } else {
        this.faceDrag.onMakeOppositeStart(face);
      }
    } else if (editMode === EditMode.FACE_COLOR_INSIDE || editMode === EditMode.FACE_COLOR_OUTSIDE) {
      // If we start from outside... yeesh, just make it outside?
      const nextFaceColorState = face ? this.getNextFaceColorState(face, button) : EditMode.FACE_COLOR_OUTSIDE;
      this.faceDrag.onAbsolutePaintStart(face, nextFaceColorState);
    }

    this.updateFaceDrag();
  }

  public onUserFaceDrag(face: TFace | null, point: Vector2): void {
    const changed = this.faceDrag.onDrag(face, point);

    if (changed) {
      this.updateFaceDrag();
    }
  }

  public onUserFaceDragEnd(): void {
    // Handle a SINGLE face as the typical behavior
    if (this.faceDrag.isNoOpSingleFace()) {
      const isSame =
        (editModeProperty.value === EditMode.FACE_COLOR_MATCH) ===
        (this.faceDrag.faceDragStateProperty.value === FaceDragState.MAKE_SAME);
      this.onUserFacePress([...this.faceDrag.paintFaceSet][0], isSame ? 0 : 2);
    }

    this.faceDrag.onDragEnd();
  }

  private updateFaceDrag(): void {
    const lastTransition = this.stack[this.stackPositionProperty.value];

    // Handle "overwriting" the last one
    if (
      lastTransition.action &&
      lastTransition.action instanceof UserFaceDragAction &&
      lastTransition.action.dragIndex === this.faceDrag.dragIndex
    ) {
      this.stackPositionProperty.value--;
    }

    const faceDragState = this.faceDrag.faceDragStateProperty.value;

    assertEnabled() && assert(faceDragState !== FaceDragState.NONE, 'line drag state should not be NONE');

    // No update needed, DEFINITELY don't trigger things (we want to be able to highlight faces for the two-click options)
    if (this.faceDrag.isNoOpSingleFace()) {
      return;
    }

    const primaryFaces = [...this.faceDrag.paintFaceSet];
    const secondaryFaces = faceDragState === FaceDragState.MAKE_OPPOSITE ? [...this.faceDrag.paintFaceOppositeSet] : [];
    const faceColorState = this.faceDrag.absolutePaintState;
    const isAbsolute = faceDragState === FaceDragState.ABSOLUTE_PAINT;

    const userAction = new UserFaceDragAction(
      primaryFaces,
      secondaryFaces,
      isAbsolute,
      faceColorState,
      this.faceDrag.dragIndex,
    );

    // TODO erase action???

    // const erasedFaces = faces.filter((face) => this.puzzle.stateProperty.value.getFaceState(face) !== FaceState.WHITE);
    // const eraseAction = new CompositeAction<Data>(erasedFaces.map((face) => new EraseFaceCompleteAction(face)));

    this.applyUserActionToStack(userAction, {
      // erase: (state) => eraseAction.apply(state),
      checkAutoSolve: (state) => {
        if (primaryFaces.length) {
          const primaryColor = primaryFaces[0] ? state.getFaceColor(primaryFaces[0]) : state.getOutsideColor();
          if (
            primaryFaces.some((face) => (face ? state.getFaceColor(face) : state.getOutsideColor()) !== primaryColor)
          ) {
            return false;
          }

          if (secondaryFaces.length) {
            const secondaryColor = secondaryFaces[0] ? state.getFaceColor(secondaryFaces[0]) : state.getOutsideColor();
            if (
              secondaryFaces.some(
                (face) => (face ? state.getFaceColor(face) : state.getOutsideColor()) !== secondaryColor,
              )
            ) {
              return false;
            }

            if (state.getOppositeFaceColor(primaryColor) !== secondaryColor) {
              return false;
            }
          }
        }

        return true;
      },
    });

    this.updateState();
  }

  public onUserSectorPress(sector: TSector, button: 0 | 1 | 2): void {
    const isErase = eraserEnabledProperty.value;

    if (isErase) {
      const action = new EraseSectorCompleteAction(sector);

      // Include the erase "early" so we don't auto-solve based on it
      this.applyUserActionToStack(action, {
        erase: (state) => action.apply(state),
      });

      this.updateState();
    } else {
      this.pendingActionSectorProperty.value = sector;
    }
  }

  public onUserSectorSet(sector: TSector, state: SectorState): void {
    this.applyUserActionToStack(new SectorStateSetAction(sector, state));

    this.pendingActionSectorProperty.value = null;

    this.updateState();
  }

  public onUserRequestSolve(): void {
    const state = this.puzzle.stateProperty.value;

    if (!simpleRegionIsSolved(state)) {
      if (uiHintUsesBuiltInSolveProperty.value) {
        const moreSolvedState = state.clone();

        iterateSolverFactory(standardSolverFactory, this.puzzle.board, moreSolvedState, true);

        this.pushTransitionAtCurrentPosition(this.getSnapshot(new UserRequestSolveAction(), moreSolvedState));
        this.updateState();
      } else {
        const solutions = satSolve(this.puzzle.board, this.puzzle.stateProperty.value, {
          maxIterations: 10000,
          failOnMultipleSolutions: true,
        });

        if (solutions.length === 1) {
          const solvedState = this.puzzle.stateProperty.value.clone();

          solutions[0].forEach((edge) => {
            solvedState.setEdgeState(edge, EdgeState.BLACK);
          });
          safeSolveWithFactory(this.puzzle.board, solvedState, this.style.safeSolverFactoryProperty.value);

          this.pushTransitionAtCurrentPosition(this.getSnapshot(new UserRequestSolveAction(), solvedState));
          this.updateState();
        } else if (solutions.length === 0) {
          console.log('No solution found');
        } else {
          console.log('Multiple solution found?!?');
        }
      }
    }
  }

  private clearPendingHint(): void {
    this.hintStateProperty.value = HintState.DEFAULT;
    this.pendingHintActionProperty.value = null;
    this.hintWorkerMessageID = 0;
  }

  public onUserClearHint(): void {
    this.clearPendingHint();
  }

  private onHintReceived(action: TAnnotatedAction<TCompleteData> | null): void {
    this.hintStateProperty.value = action ? HintState.FOUND : HintState.NOT_FOUND;

    if (action) {
      this.pendingHintActionProperty.value = action;
    }
  }

  public onUserRequestHint(): void {
    // Clear pending actions when requesting a hint.
    this.clearPendingAction();

    if (this.isSolvedProperty.value) {
      return;
    }

    if (this.pendingHintActionProperty.value) {
      return;
    }

    const solveEdges = currentPuzzleStyle.allowEdgeEditProperty.value;
    const solveColors = currentPuzzleStyle.allowFaceColorEditProperty.value;
    const solveSectors = currentPuzzleStyle.allowSectorEditProperty.value;
    const solveVertexState = currentPuzzleStyle.vertexStateVisibleProperty.value;
    const solveFaceState = currentPuzzleStyle.faceStateVisibleProperty.value;

    this.hintWorkerMessageID = Math.random();

    const hintWorker = getHintWorker();

    if (!this.addedHintListener) {
      this.addedHintListener = true;

      const hintListener = (event: MessageEvent<{ type: string; id: number; action: TSerializedAction | null }>) => {
        if (event.data.type === 'hint-response' && event.data.id === this.hintWorkerMessageID) {
          const action = event.data.action ? deserializeAction(this.puzzle.board, event.data.action) : null;

          this.onHintReceived(action as TAnnotatedAction<TCompleteData> | null);
        }
      };
      hintWorker.addEventListener('message', hintListener);
      this.disposeEmitter.addListener(() => self.removeEventListener('message', hintListener));
    }

    hintWorker.postMessage({
      type: 'hint-request',
      id: this.hintWorkerMessageID,
      solveEdges: solveEdges,
      solveColors: solveColors,
      solveSectors: solveSectors,
      solveVertexState: solveVertexState,
      solveFaceState: solveFaceState,
      serializedSolvablePuzzle: serializedSolvablePuzzle(this.puzzle),
    });

    if (hintWorkerLoadedProperty.value) {
      this.hintStateProperty.value = HintState.SEARCHING;
    } else {
      this.hintStateProperty.value = HintState.LOADING;

      // Listen to when this switches to SEARCHING
      const listener = (loaded: boolean) => {
        if (loaded) {
          if (this.hintStateProperty.value === HintState.LOADING) {
            this.hintStateProperty.value = HintState.SEARCHING;
          }

          hintWorkerLoadedProperty.unlink(listener);
        }
      };
      hintWorkerLoadedProperty.link(listener);
    }
  }

  public onUserApplyHint(): void {
    const action = this.pendingHintActionProperty.value;
    if (action) {
      this.clearPendingHint();

      this.applyUserActionToStack(new UserPuzzleHintApplyAction(action));

      this.updateState();
    }
  }

  public onUserHintKey(): void {
    if (this.pendingHintActionProperty.value) {
      this.onUserApplyHint();
    } else {
      this.onUserRequestHint();
    }
  }
}

export type PuzzleModelUserAction =
  | EdgeStateSetAction
  | FaceColorMakeSameAction
  | FaceColorMakeOppositeAction
  | FaceColorSetAbsoluteAction
  | SectorStateSetAction
  | EraseEdgeCompleteAction
  | EraseFaceCompleteAction
  | EraseSectorCompleteAction
  | UserEdgeDragAction
  | UserFaceDragAction
  | UserLoadPuzzleAutoSolveAction
  | UserRequestSolveAction
  | UserPuzzleHintApplyAction;

export class PuzzleSnapshot<Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData> {
  public constructor(
    public readonly board: TBoard<Structure>,
    public readonly action: PuzzleModelUserAction | null,
    public readonly state: TState<Data>,
    public readonly correctnessState: CorrectnessState,
  ) {}
}
