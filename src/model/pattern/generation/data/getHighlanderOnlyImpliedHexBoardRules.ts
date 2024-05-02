import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { GetRulesOptions } from '../GetRulesOptions.ts';
import { standardHexagonalBoardGenerations } from '../../patternBoards.ts';
import { basicEdgeRuleSets } from '../../data/basicEdgeRuleSets.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { hexagonalEdgeOnlyImplied1RuleSets } from '../../data/hexagonalEdgeOnlyImplied1RuleSets.ts';
import { hexagonalEdgeOnlyImplied0RuleSets } from '../../data/hexagonalEdgeOnlyImplied0RuleSets.ts';
import { hexagonalEdgeHighlanderOnlyImplied0RuleSets } from '../../data/hexagonalEdgeHighlanderOnlyImplied0RuleSets.ts';

export const getHighlanderOnlyImpliedHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...[
        ...basicEdgeRuleSets,
        ...hexagonalEdgeOnlyImplied0RuleSets,
        ...hexagonalEdgeOnlyImplied1RuleSets,
      ],
      ...[
        ...hexagonalEdgeHighlanderOnlyImplied0RuleSets,
      ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) )
    ],
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 3,
      highlander: true,
    }, options )
  );
};