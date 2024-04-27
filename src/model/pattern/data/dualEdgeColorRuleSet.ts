import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/dual-edge-color/dual-edge-color.json';

export const dualEdgeColorRuleSet = PatternBoardRuleSet.deserialize( r0 as SerializedPatternBoardRuleSet );