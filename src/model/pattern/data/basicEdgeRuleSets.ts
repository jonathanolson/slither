import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import basicEdge from '../../../../data/basic-edge/basic-edge.json';

export const basicEdgeRuleSets = [
  // PatternBoardRuleSet.deserialize( JSON.parse( '' ) ),
  PatternBoardRuleSet.deserialize( basicEdge )
];