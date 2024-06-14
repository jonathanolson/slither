import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

// NOTE: Assumes that face values will NOT be added to the target feature set
export default class PatternRuleMatchState extends EnumerationValue {
  // The input feature set is impossible to satisfy, given the target feature set or derivations (this rule will never be applied)
  public static readonly INCOMPATIBLE = new PatternRuleMatchState();

  // The output feature set is a subset of the target feature set (this rule will never provide MORE information)
  public static readonly INCONSEQUENTIAL = new PatternRuleMatchState();

  // The input feature set is compatible, the output feature set is NOT inconsequential, BUT the input feature set is not satisfied yet (could be used in the future, keep it around)
  public static readonly DORMANT = new PatternRuleMatchState();

  // The input feature set matches, and the output feature set is not a subset of the target feature set (this rule can be applied, and will do something)
  public static readonly ACTIONABLE = new PatternRuleMatchState();

  public static readonly enumeration = new Enumeration(PatternRuleMatchState);
}
