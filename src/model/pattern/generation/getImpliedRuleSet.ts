import { TPatternBoard } from '../TPatternBoard.ts';
import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { planarPatternMaps } from '../planarPatternMaps.ts';
import { assertEnabled } from '../../../workarounds/assert.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getImpliedRuleSet = (
  patternBoard: TPatternBoard,
  previousRuleSets: PatternBoardRuleSet[],
  options?: GetRulesOptions
): PatternBoardRuleSet => {
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

  options = combineOptions( {
    includeFaceValueZero: patternBoard.faces.filter( face => !face.isExit ).length === 1
  }, options );

  const ruleSet = PatternBoardRuleSet.createImplied( patternBoard, planarPatternMap, previousRuleSets, options );
  console.log( JSON.stringify( ruleSet.serialize() ) );

  return ruleSet;
};