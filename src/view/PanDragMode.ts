import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

import { LocalStorageEnumerationProperty } from '../util/localStorage.ts';

export default class PanDragMode extends EnumerationValue {
  public static readonly PAN_ONLY = new PanDragMode();
  public static readonly DRAG_ONLY = new PanDragMode();

  // TODO: hopefully better support soon!

  public static readonly enumeration = new Enumeration(PanDragMode);
}

export const panDragModeProperty = new LocalStorageEnumerationProperty( 'panDragModeProperty', PanDragMode.PAN_ONLY);
