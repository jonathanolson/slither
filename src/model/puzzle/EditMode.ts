import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { LocalStorageEnumerationProperty } from '../../util/localStorage.ts';
import { BooleanProperty, DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { faceColorsVisibleProperty, faceStateVisibleProperty, sectorsVisibleProperty, vertexStateVisibleProperty } from '../../view/Theme.ts';

export default class EditMode extends EnumerationValue {
  // TODO: remove unused modes? hmmm

  public constructor(
    public readonly isEnabledProperty: TReadOnlyProperty<boolean>
  ) {
    super();
  }

  public static readonly EDGE_STATE = new EditMode(
    new BooleanProperty( true )
  );
  public static readonly EDGE_STATE_REVERSED = new EditMode(
    new BooleanProperty( true ) // TODO: consider disabling this on desktop?
  );
  public static readonly FACE_COLOR_MATCH = new EditMode(
    faceColorsVisibleProperty
  );
  public static readonly FACE_COLOR_OPPOSITE = new EditMode(
    faceColorsVisibleProperty
  );
  public static readonly SECTOR_STATE = new EditMode(
    sectorsVisibleProperty
  );
  public static readonly VERTEX_STATE = new EditMode(
    vertexStateVisibleProperty
  );
  public static readonly FACE_STATE = new EditMode(
    faceStateVisibleProperty
  );
  public static readonly FACE_VALUE = new EditMode(
    new BooleanProperty( false )
  );
  public static readonly DELETE_FACE = new EditMode(
    new BooleanProperty( false )
  );

  public static readonly enumeration = new Enumeration( EditMode );
}

export const editModeProperty = new LocalStorageEnumerationProperty( 'editModeProperty', EditMode.EDGE_STATE );
editModeProperty.link( mode => {
  console.log( 'editMode', mode.name );
} );

// TODO: switch to a mode when this becomes... undone?
export const tryToSetEditMode = ( mode: EditMode ) => {
  if ( mode.isEnabledProperty.value ) {
    editModeProperty.value = mode;
  }
};

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
