import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r32 from '../../../../data/basic-color/basic-color-exit-3-2.json';
import r411 from '../../../../data/basic-color/basic-color-exit-4-1-1.json';
import r43 from '../../../../data/basic-color/basic-color-exit-4-3.json';
import r521 from '../../../../data/basic-color/basic-color-exit-5-2-1.json';
import r54 from '../../../../data/basic-color/basic-color-exit-5-4.json';
import r6111 from '../../../../data/basic-color/basic-color-exit-6-1-1-1.json';
import r622 from '../../../../data/basic-color/basic-color-exit-6-2-2.json';
import r631 from '../../../../data/basic-color/basic-color-exit-6-3-1.json';
import r65 from '../../../../data/basic-color/basic-color-exit-6-5.json';

export const basicColorRuleSets = [
  PatternBoardRuleSet.deserialize( r32 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r411 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r43 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r521 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r54 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r6111 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r622 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r631 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( r65 as SerializedPatternBoardRuleSet ),
  // Had nothing for non-exit vertices, exit cases seem to cover everything
];