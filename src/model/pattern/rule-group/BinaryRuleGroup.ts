import { BinaryRuleCollection } from '../BinaryRuleCollection.ts';

export class BinaryRuleGroup {
  public constructor(
    public readonly mainCollection: BinaryRuleCollection,
    public readonly fallbackCollection: BinaryRuleCollection | null,
    public readonly highlanderCollection: BinaryRuleCollection | null,
    public readonly highlanderFallbackCollection: BinaryRuleCollection | null,
  ) {}
}