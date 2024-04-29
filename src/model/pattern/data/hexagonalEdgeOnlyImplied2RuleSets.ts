import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/hexagonal-edge-only-implied/hexagonal-edge-only-implied-2-0.json';
import r1 from '../../../../data/hexagonal-edge-only-implied/hexagonal-edge-only-implied-2-1.json';
import r2 from '../../../../data/hexagonal-edge-only-implied/hexagonal-edge-only-implied-2-2.json';

export const hexagonalEdgeOnlyImplied2RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  PatternBoardRuleSet.deserialize( r1 ),
  PatternBoardRuleSet.deserialize( r2 ),
];