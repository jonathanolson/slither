import { standardHexagonalBoardGenerations } from '../patternBoards.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { getImpliedRuleSet } from './getImpliedRuleSet.ts';
import { basicSectorImpliedRuleSets } from '../data/basicSectorImpliedRuleSets.ts';
import { hexagonalSectorOnlyImplied0RuleSets } from '../data/hexagonalSectorOnlyImplied0RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from './onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getOnlyImpliedSectorHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicSectorImpliedRuleSets,
      ...hexagonalSectorOnlyImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      vertexOrderLimit: 4
    }, options )
  );
};