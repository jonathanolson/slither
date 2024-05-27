import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

// NOTE: Assumes that face values will NOT be added to the target feature set
export default class FeatureSetMatchState extends EnumerationValue {

  // Solving actions will never be able to make this feature set match the target.
  public static readonly INCOMPATIBLE = new FeatureSetMatchState();

  // Solving actions COULD make this feature set match in the future, but it does not match right now
  public static readonly DORMANT = new FeatureSetMatchState();

  // Currently matches
  public static readonly MATCH = new FeatureSetMatchState();

  public static readonly enumeration = new Enumeration( FeatureSetMatchState );
}
