import { AttributeSet } from './AttributeSet.ts';

export class Implication {
  public constructor(
    public readonly antecedent: AttributeSet,
    public readonly consequent: AttributeSet
  ) {}
}