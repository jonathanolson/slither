import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { basicEdgeRuleSets } from '../../data/basicEdgeRuleSets.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { generalPatternBoardGenerations } from '../../generalPatternBoardGenerations.ts';
import { generalEdgeImplied0RuleSets } from '../../data/generalEdgeImplied0RuleSets.ts';
import { generalEdgeImplied1RuleSets } from '../../data/generalEdgeImplied1RuleSets.ts';
import { generalEdgeHighlanderImplied0RuleSets } from '../../data/generalEdgeHighlanderImplied0RuleSets.ts';

export const getHighlanderImpliedGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...[
        ...basicEdgeRuleSets,
        ...generalEdgeImplied0RuleSets,
        ...generalEdgeImplied1RuleSets,
      ],
      ...[
        ...generalEdgeHighlanderImplied0RuleSets,
      ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) )
    ],
    combineOptions<GetRulesOptions>( {
      highlander: true,
    }, options )
  );
};