import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/square-edge-highlander-only-implied/square-edge-highlander-only-implied-1-0.json';
import r1 from '../../../../data/square-edge-highlander-only-implied/square-edge-highlander-only-implied-1-1.json';

export const squareEdgeHighlanderOnlyImplied1RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  PatternBoardRuleSet.deserialize( r1 ),
];