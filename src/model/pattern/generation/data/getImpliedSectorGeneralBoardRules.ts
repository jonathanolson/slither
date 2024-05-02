import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { generalPatternBoardGenerations } from '../../generalPatternBoardGenerations.ts';
import { basicSectorImpliedRuleSets } from '../../data/basicSectorImpliedRuleSets.ts';
import { generalSectorImplied0RuleSets } from '../../data/generalSectorImplied0RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getImpliedSectorGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicSectorImpliedRuleSets,
      ...generalSectorImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
    }, options )
  );
};