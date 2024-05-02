import { GetRulesOptions } from '../GetRulesOptions.ts';
import { getImpliedRuleSet } from '../getImpliedRuleSet.ts';
import { standardSquareBoardGenerations } from '../../patternBoards.ts';
import { basicEdgeRuleSets } from '../../data/basicEdgeRuleSets.ts';
import { squareEdgeOnlyImplied0RuleSets } from '../../data/squareEdgeOnlyImplied0RuleSets.ts';
import { squareEdgeOnlyImplied1RuleSets } from '../../data/squareEdgeOnlyImplied1RuleSets.ts';
import { squareEdgeOnlyImplied2RuleSets } from '../../data/squareEdgeOnlyImplied2RuleSets.ts';
import { squareEdgeOnlyImplied3RuleSets } from '../../data/squareEdgeOnlyImplied3RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from '../onlyRuleSetsWithFewerNonExitFaces.ts';
import { combineOptions } from 'phet-lib/phet-core';

export const getOnlyImpliedSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareEdgeOnlyImplied0RuleSets,
      ...squareEdgeOnlyImplied1RuleSets,
      ...squareEdgeOnlyImplied2RuleSets,
      ...squareEdgeOnlyImplied3RuleSets,
      // TODO: potentially include square-edge-4
    ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 4
    }, options )
  );
};