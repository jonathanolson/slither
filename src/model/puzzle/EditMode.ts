import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { LocalStorageEnumerationProperty } from '../../util/localStorage.ts';
import { DerivedProperty } from 'phet-lib/axon';

export default class EditMode extends EnumerationValue {
  // TODO: remove unused modes? hmmm

  public static readonly EDGE_STATE = new EditMode();
  public static readonly EDGE_STATE_REVERSED = new EditMode();
  public static readonly FACE_COLOR_MATCH = new EditMode();
  public static readonly FACE_COLOR_OPPOSITE = new EditMode();
  public static readonly SECTOR_STATE = new EditMode();
  public static readonly VERTEX_STATE = new EditMode();
  public static readonly FACE_STATE = new EditMode();
  public static readonly FACE_VALUE = new EditMode();
  public static readonly DELETE_FACE = new EditMode();

  public static readonly enumeration = new Enumeration( EditMode );
}

export const editModeProperty = new LocalStorageEnumerationProperty( 'editModeProperty', EditMode.EDGE_STATE );
export const isEdgeEditModeProperty = new DerivedProperty( [ editModeProperty ], ( editMode ) => {
  return editMode === EditMode.EDGE_STATE || editMode === EditMode.EDGE_STATE_REVERSED;
} );
export const isFaceColorEditModeProperty = new DerivedProperty( [ editModeProperty ], ( editMode ) => {
  return editMode === EditMode.FACE_COLOR_MATCH || editMode === EditMode.FACE_COLOR_OPPOSITE;
} );
export const isSectorEditModeProperty = new DerivedProperty( [ editModeProperty ], ( editMode ) => {
  return editMode === EditMode.SECTOR_STATE;
} );
export const isVertexEditModeProperty = new DerivedProperty( [ editModeProperty ], ( editMode ) => {
  return editMode === EditMode.VERTEX_STATE;
} );
export const isFaceEditModeProperty = new DerivedProperty( [ editModeProperty, isFaceColorEditModeProperty ], ( editMode, isFaceColor ) => {
  return isFaceColor || editMode === EditMode.FACE_STATE || editMode === EditMode.FACE_VALUE || editMode === EditMode.DELETE_FACE;
} );
