import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { standardHexagonalBoardGenerations } from '../../patternBoards.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { basicAllRuleSets } from '../../data/basicAllRuleSets.ts';
import { hexagonalAllOnlyImplied0RuleSets } from '../../data/hexagonalAllOnlyImplied0RuleSets.ts';

export const getOnlyImpliedAllHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicAllRuleSets,
      ...hexagonalAllOnlyImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      solveFaceColors: true,
      highlander: false,
      vertexOrderLimit: 3,
    }, options )
  );
};