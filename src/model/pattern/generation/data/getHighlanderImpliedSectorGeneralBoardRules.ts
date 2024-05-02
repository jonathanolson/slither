import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { generalPatternBoardGenerations } from '../../generalPatternBoardGenerations.ts';
import { basicSectorImpliedRuleSets } from '../../data/basicSectorImpliedRuleSets.ts';
import { generalSectorImplied0RuleSets } from '../../data/generalSectorImplied0RuleSets.ts';
import { generalSectorHighlanderImplied0RuleSets } from '../../data/generalSectorHighlanderImplied0RuleSets.ts';

export const getHighlanderImpliedSectorGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...[
        ...basicSectorImpliedRuleSets,
        ...generalSectorImplied0RuleSets,
      ],
      ...[
        ...generalSectorHighlanderImplied0RuleSets,
      ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) )
    ],
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      highlander: true,
    }, options )
  );
};