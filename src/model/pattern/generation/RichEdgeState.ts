import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

export class RichEdgeState extends EnumerationValue {
  public static readonly NON_EXIT_RED = new RichEdgeState();
  public static readonly NON_EXIT_BLACK = new RichEdgeState();
  public static readonly EXIT_HARD_RED = new RichEdgeState();
  public static readonly EXIT_BLACK = new RichEdgeState();
  public static readonly EXIT_SOFT_RED_DOUBLE_BLACK = new RichEdgeState();

  public static readonly enumeration = new Enumeration(RichEdgeState);
}
