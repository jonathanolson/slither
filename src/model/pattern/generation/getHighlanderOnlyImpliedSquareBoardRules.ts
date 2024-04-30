import { getImpliedRuleSet } from './getImpliedRuleSet.ts';
import { GetRulesOptions } from './GetRulesOptions.ts';
import { standardSquareBoardGenerations } from '../patternBoards.ts';
import { basicEdgeRuleSets } from '../data/basicEdgeRuleSets.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { squareEdgeOnlyImplied2RuleSets } from '../data/squareEdgeOnlyImplied2RuleSets.ts';
import { squareEdgeOnlyImplied3RuleSets } from '../data/squareEdgeOnlyImplied3RuleSets.ts';
import { squareEdgeOnlyImplied0RuleSets } from '../data/squareEdgeOnlyImplied0RuleSets.ts';
import { squareEdgeOnlyImplied1RuleSets } from '../data/squareEdgeOnlyImplied1RuleSets.ts';
import { squareEdgeHighlanderOnlyImplied0RuleSets } from '../data/squareEdgeHighlanderOnlyImplied0RuleSets.ts';
import { onlyRuleSetsWithFewerNonExitFaces } from './onlyRuleSetsWithFewerNonExitFaces.ts';
import { squareEdgeHighlanderOnlyImplied1RuleSets } from '../data/squareEdgeHighlanderOnlyImplied1RuleSets.ts';

export const getHighlanderOnlyImpliedSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return getImpliedRuleSet(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...[
        ...basicEdgeRuleSets,
        ...squareEdgeOnlyImplied0RuleSets,
        ...squareEdgeOnlyImplied1RuleSets,
        ...squareEdgeOnlyImplied2RuleSets,
        ...squareEdgeOnlyImplied3RuleSets,
      ],
      ...[
        ...squareEdgeHighlanderOnlyImplied0RuleSets,
        ...squareEdgeHighlanderOnlyImplied1RuleSets,
      ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) )
    ],
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 4,
      highlander: true,
    }, options )
  );
};