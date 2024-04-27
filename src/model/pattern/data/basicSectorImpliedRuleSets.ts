import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r2 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-2.json';
import r21 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-2-1.json';
import r32 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-3-2.json';
import r411 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-4-1-1.json';
import r43 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-4-3.json';
import r521 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-5-2-1.json';
import r6111 from '../../../../data/basic-sector-implied/basic-sector-implied-exit-6-1-1-1.json';
import n2 from '../../../../data/basic-sector-implied/basic-sector-implied-non-exit-2.json';
import n3 from '../../../../data/basic-sector-implied/basic-sector-implied-non-exit-3.json';

export const basicSectorImpliedRuleSets = [
  PatternBoardRuleSet.deserialize( r2 ),
  PatternBoardRuleSet.deserialize( r21 ),
  PatternBoardRuleSet.deserialize( r32 ),
  PatternBoardRuleSet.deserialize( r411 ),
  PatternBoardRuleSet.deserialize( r43 ),
  PatternBoardRuleSet.deserialize( r521 ),
  PatternBoardRuleSet.deserialize( r6111 ),
  PatternBoardRuleSet.deserialize( n2 ),
  PatternBoardRuleSet.deserialize( n3 ),
];