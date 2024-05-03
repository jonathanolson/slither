import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r1 from '../../../../data/square-all-only-implied/square-all-only-implied-1-1.json';

export const squareAllOnlyImplied1RuleSets = [
  PatternBoardRuleSet.deserialize( r1 as SerializedPatternBoardRuleSet ),
];