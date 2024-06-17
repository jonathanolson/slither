import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

export default class FaceDragState extends EnumerationValue {
  public static readonly NONE = new FaceDragState();
  public static readonly ABSOLUTE_PAINT = new FaceDragState();
  public static readonly MAKE_SAME = new FaceDragState();
  public static readonly MAKE_OPPOSITE = new FaceDragState();

  public static readonly enumeration = new Enumeration(FaceDragState);
}
