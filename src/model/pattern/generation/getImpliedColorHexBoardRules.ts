import { getImpliedRuleSet } from './getImpliedRuleSet.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { standardHexagonalBoardGenerations } from '../patternBoards.ts';
import { basicColorRuleSets } from '../data/basicColorRuleSets.ts';
import { hexagonalColorImplied0RuleSets } from '../data/hexagonalColorImplied0RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from './onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getImpliedColorHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...hexagonalColorImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};