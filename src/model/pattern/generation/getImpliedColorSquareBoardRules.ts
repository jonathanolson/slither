import { getImpliedRuleSet } from './getImpliedRuleSet.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { standardSquareBoardGenerations } from '../patternBoards.ts';
import { basicColorRuleSets } from '../data/basicColorRuleSets.ts';
import { squareColorImplied0RuleSets } from '../data/squareColorImplied0RuleSets.ts';
import { squareColorImplied1RuleSets } from '../data/squareColorImplied1RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from './onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getImpliedColorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...squareColorImplied0RuleSets,
      ...squareColorImplied1RuleSets,
      // ...squareColorImplied2RuleSets, // TODO: don't include the 48MB square-color-implied-2-0 because
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};