import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { generalPatternBoardGenerations } from '../../generalPatternBoardGenerations.ts';
import { basicColorRuleSets } from '../../data/basicColorRuleSets.ts';
import { generalColorImplied0RuleSets } from '../../data/generalColorImplied0RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getImpliedColorGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...generalColorImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};