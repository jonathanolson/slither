import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { standardSquareBoardGenerations } from '../../patternBoards.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { squareSectorOnlyImplied2RuleSets } from '../../data/squareSectorOnlyImplied2RuleSets.ts';
import { squareSectorOnlyImplied1RuleSets } from '../../data/squareSectorOnlyImplied1RuleSets.ts';
import { basicSectorImpliedRuleSets } from '../../data/basicSectorImpliedRuleSets.ts';
import { squareSectorOnlyImplied0RuleSets } from '../../data/squareSectorOnlyImplied0RuleSets.ts';
import { squareSectorHighlanderOnlyImplied0RuleSets } from '../../data/squareSectorHighlanderOnlyImplied0RuleSets.ts';

export const getHighlanderOnlyImpliedSectorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...[
        ...basicSectorImpliedRuleSets,
        ...squareSectorOnlyImplied0RuleSets,
        ...squareSectorOnlyImplied1RuleSets,
        ...squareSectorOnlyImplied2RuleSets,
      ],
      ...[
        ...squareSectorHighlanderOnlyImplied0RuleSets,
      ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) )
    ],
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      vertexOrderLimit: 4,
      highlander: true,
    }, options )
  );
};