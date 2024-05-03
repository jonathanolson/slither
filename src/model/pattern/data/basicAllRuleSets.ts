import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import e2 from '../../../../data/basic-all/basic-all-exit-2.json';
import e21 from '../../../../data/basic-all/basic-all-exit-2-1.json';
import e32 from '../../../../data/basic-all/basic-all-exit-3-2.json';
import e411 from '../../../../data/basic-all/basic-all-exit-4-1-1.json';
import e43 from '../../../../data/basic-all/basic-all-exit-4-3.json';
import e521 from '../../../../data/basic-all/basic-all-exit-5-2-1.json';
import e54 from '../../../../data/basic-all/basic-all-exit-5-4.json';
import e6111 from '../../../../data/basic-all/basic-all-exit-6-1-1-1.json';
import e622 from '../../../../data/basic-all/basic-all-exit-6-2-2.json';
import e631 from '../../../../data/basic-all/basic-all-exit-6-3-1.json';
import e65 from '../../../../data/basic-all/basic-all-exit-6-5.json';
import n2 from '../../../../data/basic-all/basic-all-non-exit-2.json';
import n3 from '../../../../data/basic-all/basic-all-non-exit-3.json';
import n4 from '../../../../data/basic-all/basic-all-non-exit-4.json';
import n5 from '../../../../data/basic-all/basic-all-non-exit-5.json';
import n6 from '../../../../data/basic-all/basic-all-non-exit-6.json';

export const basicAllRuleSets = [
  PatternBoardRuleSet.deserialize( e2 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e21 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e32 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e411 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e43 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e521 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e54 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e6111 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e622 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e631 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( e65 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( n2 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( n3 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( n4 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( n5 as SerializedPatternBoardRuleSet ),
  PatternBoardRuleSet.deserialize( n6 as SerializedPatternBoardRuleSet ),
];