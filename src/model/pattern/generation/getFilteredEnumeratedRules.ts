import { TPatternBoard } from '../TPatternBoard.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { PatternRule } from '../PatternRule.ts';
import { getSolutionEnumeratedRules } from './getSolutionEnumeratedRules.ts';
import { filterAndSortRules } from './filterAndSortRules.ts';

export const getFilteredEnumeratedRules = ( patternBoard: TPatternBoard, options?: GetRulesOptions ): PatternRule[] => {
  const rawRules = getSolutionEnumeratedRules( patternBoard, options );

  // TODO: this is probably done above
  return filterAndSortRules( rawRules, options?.prefilterRules || [] );
};