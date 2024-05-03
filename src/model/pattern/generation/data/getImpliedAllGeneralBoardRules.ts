import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { basicAllRuleSets } from '../../data/basicAllRuleSets.ts';
import { generalPatternBoardGenerations } from '../../generalPatternBoardGenerations.ts';
import { generalAllImplied0RuleSets } from '../../data/generalAllImpliedRuleSets.ts';

export const getImpliedAllGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicAllRuleSets,
      ...generalAllImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      solveFaceColors: true,
      highlander: false,
    }, options )
  );
};