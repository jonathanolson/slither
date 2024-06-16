import { DisplayTiling } from './DisplayTiling.js';
import { getBestDisplayEmbedding } from './getBestDisplayEmbedding.js';

import { DisplayEmbedding } from '../../model/pattern/embedding/DisplayEmbedding.js';
import { PatternRule } from '../../model/pattern/pattern-rule/PatternRule.js';

export const getBestDisplayEmbeddingForRule = (
  rule: PatternRule,
  displayTiling: DisplayTiling,
): DisplayEmbedding | null => {
  return getBestDisplayEmbedding(rule.patternBoard, displayTiling, DisplayEmbedding.getOptionsForRule(rule));
};
