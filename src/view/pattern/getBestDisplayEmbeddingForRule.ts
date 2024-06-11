import { PatternRule } from '../../model/pattern/pattern-rule/PatternRule.js';
import { DisplayTiling } from './DisplayTiling.js';
import { DisplayEmbedding } from '../../model/pattern/embedding/DisplayEmbedding.js';
import { getBestDisplayEmbedding } from './getBestDisplayEmbedding.js';

export const getBestDisplayEmbeddingForRule = (
  rule: PatternRule,
  displayTiling: DisplayTiling
): DisplayEmbedding | null => {
  return getBestDisplayEmbedding(
    rule.patternBoard,
    displayTiling,
    {
      sourceFaceFilter: face => {
        return rule.inputFeatureSet.getAffectedFaces().has( face ) || rule.outputFeatureSet.getAffectedFaces().has( face );
      }
    }
  );
};