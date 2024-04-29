import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/square-sector-only-implied/square-sector-only-implied-2-0.json';
import r2 from '../../../../data/square-sector-only-implied/square-sector-only-implied-2-2.json';

export const squareSectorOnlyImplied2RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  // no rules from 2,1
  PatternBoardRuleSet.deserialize( r2 ),
  // no rules from 2,3
  // TODO: 2,4
];