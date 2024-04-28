import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/square-edge-only-implied/square-edge-only-implied-1-0.json';
import r1 from '../../../../data/square-edge-only-implied/square-edge-only-implied-1-1.json';

export const squareEdgeOnlyImplied1RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  PatternBoardRuleSet.deserialize( r1 )
];