import { getImpliedRuleSet } from './getImpliedRuleSet.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { generalPatternBoardGenerations } from '../generalPatternBoardGenerations.ts';
import { basicEdgeRuleSets } from '../data/basicEdgeRuleSets.ts';
import { generalEdgeImplied0RuleSets } from '../data/generalEdgeImplied0RuleSets.ts';
import { generalEdgeImplied1RuleSets } from '../data/generalEdgeImplied1RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from './onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getImpliedGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...generalEdgeImplied0RuleSets,
      ...generalEdgeImplied1RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {

    }, options )
  );
};