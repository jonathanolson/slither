import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { LocalStorageBooleanProperty, LocalStorageEnumerationProperty } from '../../util/localStorage.ts';
import { BooleanProperty, DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { currentPuzzleStyle } from '../../view/puzzle/puzzleStyles.ts';

export default class EditMode extends EnumerationValue {
  // TODO: remove unused modes? hmmm

  public constructor(public readonly isEnabledProperty: TReadOnlyProperty<boolean>) {
    super();
  }

  public static readonly EDGE_STATE = new EditMode(currentPuzzleStyle.allowEdgeEditProperty);
  public static readonly EDGE_STATE_REVERSED = new EditMode(currentPuzzleStyle.allowEdgeEditProperty);
  public static readonly FACE_COLOR_INSIDE = new EditMode(currentPuzzleStyle.allowAbsoluteFaceColorEditProperty);
  public static readonly FACE_COLOR_OUTSIDE = new EditMode(currentPuzzleStyle.allowAbsoluteFaceColorEditProperty);
  // TODO: more fine-grained control(!), so we can remove some that would normally be there.
  public static readonly FACE_COLOR_MATCH = new EditMode(currentPuzzleStyle.allowFaceColorEditProperty);
  public static readonly FACE_COLOR_OPPOSITE = new EditMode(currentPuzzleStyle.allowFaceColorEditProperty);
  public static readonly SECTOR_STATE = new EditMode(currentPuzzleStyle.allowSectorEditProperty);
  public static readonly VERTEX_STATE = new EditMode(currentPuzzleStyle.vertexStateVisibleProperty);
  public static readonly FACE_STATE = new EditMode(currentPuzzleStyle.faceStateVisibleProperty);
  public static readonly FACE_VALUE = new EditMode(new BooleanProperty(false));
  public static readonly DELETE_FACE = new EditMode(new BooleanProperty(false));

  public static readonly enumeration = new Enumeration(EditMode);
}

export const editModeProperty = new LocalStorageEnumerationProperty('editModeProperty', EditMode.EDGE_STATE);

// Listen to all modes' enabled properties, and if the current mode is disabled, switch to the first enabled mode.
EditMode.enumeration.values.forEach((mode) => {
  mode.isEnabledProperty.lazyLink((enabled) => {
    if (!editModeProperty.value.isEnabledProperty.value) {
      const firstEnabledMode = EditMode.enumeration.values.find((mode) => mode.isEnabledProperty.value) ?? null;

      if (firstEnabledMode) {
        editModeProperty.value = firstEnabledMode;
      }
    }
  });
});

export const eraserEnabledProperty = new LocalStorageBooleanProperty('eraserEnabledProperty', false);

export const tryToSetEditMode = (mode: EditMode) => {
  if (mode.isEnabledProperty.value) {
    editModeProperty.value = mode;
  }
};

export const isEdgeEditModeProperty = new DerivedProperty([editModeProperty], (editMode) => {
  return editMode === EditMode.EDGE_STATE || editMode === EditMode.EDGE_STATE_REVERSED;
});
export const isFaceColorPairEditModeProperty = new DerivedProperty([editModeProperty], (editMode) => {
  return editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE;
});
export const isFaceColorOutsideAvailableEditModeProperty = isFaceColorPairEditModeProperty;
export const isFaceColorAbsoluteEditModeProperty = new DerivedProperty([editModeProperty], (editMode) => {
  return editMode === EditMode.FACE_COLOR_OUTSIDE || editMode === EditMode.FACE_COLOR_INSIDE;
});
export const isSectorEditModeProperty = new DerivedProperty([editModeProperty], (editMode) => {
  return editMode === EditMode.SECTOR_STATE;
});
export const isVertexEditModeProperty = new DerivedProperty([editModeProperty], (editMode) => {
  return editMode === EditMode.VERTEX_STATE;
});
export const isFaceEditModeProperty = new DerivedProperty(
  [editModeProperty, isFaceColorPairEditModeProperty, isFaceColorAbsoluteEditModeProperty],
  (editMode, isFaceColorPair, isFaceColorAbsolute) => {
    return (
      isFaceColorPair ||
      isFaceColorAbsolute ||
      editMode === EditMode.FACE_STATE ||
      editMode === EditMode.FACE_VALUE ||
      editMode === EditMode.DELETE_FACE
    );
  },
);
