// Find rules with the same input feature set and collapse them (union)
import { PatternRule } from '../PatternRule.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const getCollapsedRules = ( rules: PatternRule[] ): PatternRule[] => {
  if ( rules.length === 0 ) {
    return rules;
  }

  const patternBoard = rules[ 0 ].patternBoard;
  assertEnabled() && assert( rules.every( rule => rule.patternBoard === patternBoard ), 'pattern board check' );

  const map = new Map<string, PatternRule>();

  for ( const rule of rules ) {
    const key = rule.inputFeatureSet.toCanonicalString();

    const existingRule = map.get( key );
    if ( existingRule ) {
      if ( existingRule.outputFeatureSet.isSubsetOf( rule.outputFeatureSet ) ) {
        map.set( key, rule );
      }
      else if ( !rule.outputFeatureSet.isSubsetOf( existingRule.outputFeatureSet ) ) {
        const union = rule.outputFeatureSet.union( existingRule.outputFeatureSet )!;
        assertEnabled() && assert( union );
        map.set( key, new PatternRule( patternBoard, rule.inputFeatureSet, union ) );
      }
    }
    else {
      map.set( key, rule );
    }
  }

  return [ ...map.values() ];
};