import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

export default class FeatureCompatibility extends EnumerationValue {
  // The input feature set is impossible to satisfy, given the target feature set or derivations (a rule with this as the input will never be applied)
  public static readonly INCOMPATIBLE = new FeatureCompatibility();

  // The input feature isn't a match here, because it doesn't have all of the required face values (and might not have the state)
  public static readonly NO_MATCH_NEEDS_FACE_VALUES = new FeatureCompatibility();

  // The input feature isn't a match here, because it doesn't have all of the required state values
  public static readonly NO_MATCH_NEEDS_STATE = new FeatureCompatibility();

  // Matches!
  public static readonly MATCH = new FeatureCompatibility();

  public static readonly enumeration = new Enumeration(FeatureCompatibility);
}
