import { Enumeration, EnumerationValue } from "phet-lib/phet-core";

export default class SetRelation extends EnumerationValue {
  // x in A IFF x in B
  public static readonly EQUALS = new SetRelation();

  // A is a subset of B
  public static readonly SUBSET = new SetRelation();

  // B is a subset of A
  public static readonly SUPERSET = new SetRelation();

  // A and B have no elements in common
  public static readonly DISJOINT = new SetRelation();

  // A and B have some elements in common, but neither is a subset of the other
  public static readonly OVERLAPS = new SetRelation();

  public static readonly enumeration = new Enumeration( SetRelation );
}