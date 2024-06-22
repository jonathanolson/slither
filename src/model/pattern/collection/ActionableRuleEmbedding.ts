import { Embedding } from '../embedding/Embedding.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';

export class ActionableRuleEmbedding {
  public constructor(
    public readonly ruleIndex: number,
    public readonly embeddingIndex: number,
    public readonly rule: PatternRule,
    public readonly embeddedRule: PatternRule,
    public readonly embedding: Embedding,
  ) {}
}
