import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r1 from '../../../../data/square-color-implied/square-color-implied-2-1.json';
import r2 from '../../../../data/square-color-implied/square-color-implied-2-2.json';
import r3 from '../../../../data/square-color-implied/square-color-implied-2-3.json';

export const squareImpliedColorGeneration2RuleSets = [
  // 2,0
  // PatternBoardRuleSet.deserialize( JSON.parse( '' ) ),
  // 2,1
  PatternBoardRuleSet.deserialize( r1 as SerializedPatternBoardRuleSet ),
  // 2,2
  PatternBoardRuleSet.deserialize( r2 as SerializedPatternBoardRuleSet ),
  // 2,3
  PatternBoardRuleSet.deserialize( r3 as SerializedPatternBoardRuleSet )
  // 2,4
  // PatternBoardRuleSet.deserialize( JSON.parse( '' ) ),
];