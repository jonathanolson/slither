import { Enumeration, EnumerationValue } from "phet-lib/phet-core";

export default class EdgeState extends EnumerationValue {
  public static readonly WHITE = new EdgeState();
  public static readonly BLACK = new EdgeState();
  public static readonly RED = new EdgeState();

  // TODO: did we want to figure out something else? (implicit red vs explicit?) -- probably not

  public static readonly enumeration = new Enumeration( EdgeState );
}
