import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/square-edge-highlander-only-implied/square-edge-highlander-only-implied-1-0.json';
import r1 from '../../../../data/square-edge-highlander-only-implied/square-edge-highlander-only-implied-1-1.json';

export const squareEdgeHighlanderOnlyImplied1RuleSets = [
  PatternBoardRuleSet.deserialize( r0 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r1 as SerializedPatternBoardRuleSet ),
];