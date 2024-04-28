import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/general-implied/general-implied-0-0.json';
import r1 from '../../../../data/general-implied/general-implied-0-1.json';
import r2 from '../../../../data/general-implied/general-implied-0-2.json';
import r3 from '../../../../data/general-implied/general-implied-0-3.json';

export const generalImpliedEdgeGeneration0RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  PatternBoardRuleSet.deserialize( r1 ),
  PatternBoardRuleSet.deserialize( r2 ),
  PatternBoardRuleSet.deserialize( r3 )
];