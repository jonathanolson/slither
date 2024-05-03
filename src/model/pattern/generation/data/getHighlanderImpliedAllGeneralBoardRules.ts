import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { basicAllRuleSets } from '../../data/basicAllRuleSets.ts';
import { generalPatternBoardGenerations } from '../../generalPatternBoardGenerations.ts';
import { generalAllHighlanderImplied0RuleSets } from '../../data/generalAllHighlanderImplied0RuleSets.ts';

export const getHighlanderImpliedAllGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicAllRuleSets,
      ...generalAllHighlanderImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      solveFaceColors: true,
      highlander: true,
    }, options )
  );
};