import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/square-color-implied/square-color-implied-2-0.json';
import r1 from '../../../../data/square-color-implied/square-color-implied-2-1.json';
import r2 from '../../../../data/square-color-implied/square-color-implied-2-2.json';
import r3 from '../../../../data/square-color-implied/square-color-implied-2-3.json';
import r4 from '../../../../data/square-color-implied/square-color-implied-2-4.json';

export const squareColorImplied2RuleSets = [
  PatternBoardRuleSet.deserialize( r0 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r1 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r2 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r3 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r4 as SerializedPatternBoardRuleSet ),
];