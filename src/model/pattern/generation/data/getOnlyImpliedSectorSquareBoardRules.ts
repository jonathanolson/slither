import { GetRulesOptions } from '../GetRulesOptions.ts';
import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { standardSquareBoardGenerations } from '../../patternBoards.ts';
import { basicSectorImpliedRuleSets } from '../../data/basicSectorImpliedRuleSets.ts';
import { squareSectorOnlyImplied0RuleSets } from '../../data/squareSectorOnlyImplied0RuleSets.ts';
import { squareSectorOnlyImplied1RuleSets } from '../../data/squareSectorOnlyImplied1RuleSets.ts';
import { squareSectorOnlyImplied2RuleSets } from '../../data/squareSectorOnlyImplied2RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getOnlyImpliedSectorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicSectorImpliedRuleSets,
      ...squareSectorOnlyImplied0RuleSets,
      ...squareSectorOnlyImplied1RuleSets,
      ...squareSectorOnlyImplied2RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      vertexOrderLimit: 4
    }, options )
  );
};