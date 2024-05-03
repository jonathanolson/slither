import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { standardSquareBoardGenerations } from '../../patternBoards.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { basicAllRuleSets } from '../../data/basicAllRuleSets.ts';
import { squareAllHighlanderOnlyImplied0RuleSets } from '../../data/squareAllHighlanderOnlyImplied0RuleSets.ts';

export const getHighlanderOnlyImpliedAllSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicAllRuleSets,
      ...squareAllHighlanderOnlyImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      solveFaceColors: true,
      highlander: true,
      vertexOrderLimit: 4,
    }, options )
  );
};