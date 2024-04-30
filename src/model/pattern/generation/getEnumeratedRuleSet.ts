import { TPatternBoard } from '../TPatternBoard.ts';
import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { planarPatternMaps } from '../planarPatternMaps.ts';
import { assertEnabled } from '../../../workarounds/assert.ts';
import { combineOptions } from 'phet-lib/phet-core';

let progressive = false;

// @ts-expect-error TODO add a better way to do this on the command line? But progressive seems worse in general, probably just remove it?
window.disableProgressive = () => {
  progressive = false;
};

export const getEnumeratedRuleSet = (
  patternBoard: TPatternBoard,
  previousRuleSets: PatternBoardRuleSet[],
  options?: GetRulesOptions
): PatternBoardRuleSet => {
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

  if ( progressive ) {
    let featureLimit = 1;
    let hitFeatureLimit = true;
    let ruleSet: PatternBoardRuleSet | null = null;

    while ( hitFeatureLimit ) {
      hitFeatureLimit = false;

      ruleSet = PatternBoardRuleSet.createEnumerated( patternBoard, planarPatternMap, previousRuleSets, combineOptions<GetRulesOptions>( {}, options, {
        featureLimit: featureLimit,
        hitFeatureLimitCallback: () => {
          hitFeatureLimit = true;
        },
        includeFaceValueZero: patternBoard.faces.filter( face => !face.isExit ).length === 1
      } ) );

      console.log( 'featureLimit', featureLimit );
      console.log( 'ruleSet.length', ruleSet.rules.length );
      console.log( JSON.stringify( ruleSet.serialize() ) );

      featureLimit += 3;
    }

    console.log( 'COMPLETE' );

    if ( !ruleSet ) {
      throw new Error( 'No rule set' );
    }

    return ruleSet!;
  }
  else {
    const ruleSet = PatternBoardRuleSet.createEnumerated( patternBoard, planarPatternMap, previousRuleSets, options );
    console.log( JSON.stringify( ruleSet.serialize() ) );

    return ruleSet;
  }
};