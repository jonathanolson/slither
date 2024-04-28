import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/square-edge-only-implied/square-edge-only-implied-2-0.json';
import r1 from '../../../../data/square-edge-only-implied/square-edge-only-implied-2-1.json';
import r2 from '../../../../data/square-edge-only-implied/square-edge-only-implied-2-2.json';
import r3 from '../../../../data/square-edge-only-implied/square-edge-only-implied-2-3.json';
import r4 from '../../../../data/square-edge-only-implied/square-edge-only-implied-2-4.json';

export const squareEdgeOnlyImplied2RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  PatternBoardRuleSet.deserialize( r1 ),
  PatternBoardRuleSet.deserialize( r2 ),
  PatternBoardRuleSet.deserialize( r3 ),
  PatternBoardRuleSet.deserialize( r4 )
];