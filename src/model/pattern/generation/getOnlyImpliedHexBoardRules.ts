import { getImpliedRuleSet } from './getImpliedRuleSet.ts';
import { standardHexagonalBoardGenerations } from '../patternBoards.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { basicEdgeRuleSets } from '../data/basicEdgeRuleSets.ts';
import { hexagonalEdgeOnlyImplied0RuleSets } from '../data/hexagonalEdgeOnlyImplied0RuleSets.ts';
import { hexagonalEdgeOnlyImplied1RuleSets } from '../data/hexagonalEdgeOnlyImplied1RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from './onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getOnlyImpliedHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...hexagonalEdgeOnlyImplied0RuleSets,
      ...hexagonalEdgeOnlyImplied1RuleSets,
      // ...hexagonalEdgeOnlyImplied2RuleSets, // TODO: don't include these for now due to file size and compilation
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 3
    }, options )
  );
};