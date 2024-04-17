import { TPatternBoard } from './TPatternBoard.ts';
import { FeatureSet } from './feature/FeatureSet.ts';
import { PatternRule } from './PatternRule.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

export class PatternRuleApplicator {

  // @ts-expect-error
  private readonly queue: PatternRule[] = [];

  public constructor(
    // @ts-expect-error
    private readonly patternBoard: TPatternBoard,
    // @ts-expect-error
    private readonly stateFeatureSet: FeatureSet,
    embeddedRules: PatternRule[]
  ) {
    assertEnabled() && assert( embeddedRules.every( otherRule => otherRule.patternBoard === patternBoard ), 'embedding check' );
  }

  // NOTE: basically assumes the rule is actually applied, we won't track it anymore
  // NOTE: BUT DOES NOT APPLY the rule
  // @ts-expect-error
  public getNextRule(): PatternRule | null {
    // TODO: implement!
  }
}