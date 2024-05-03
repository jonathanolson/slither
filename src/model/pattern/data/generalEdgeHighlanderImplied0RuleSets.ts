import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/general-edge-highlander-implied/general-edge-highlander-implied-0-0.json';
import r1 from '../../../../data/general-edge-highlander-implied/general-edge-highlander-implied-0-1.json';
import r2 from '../../../../data/general-edge-highlander-implied/general-edge-highlander-implied-0-2.json';
import r3 from '../../../../data/general-edge-highlander-implied/general-edge-highlander-implied-0-3.json';

export const generalEdgeHighlanderImplied0RuleSets = [
  PatternBoardRuleSet.deserialize( r0 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r1 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r2 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r3 as SerializedPatternBoardRuleSet ),
];