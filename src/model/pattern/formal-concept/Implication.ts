import { AttributeSet } from './AttributeSet.ts';

export class Implication {
  public constructor(
    public readonly antecedent: AttributeSet,
    public readonly consequent: AttributeSet
  ) {}

  public toString(): string {
    return `${this.antecedent.toString()} -> ${this.consequent.toString()}`;
  }

  // Only applies non-full rules
  public static implicationSetClosure(
    implications: Implication[],
    attributeSet: AttributeSet
  ): AttributeSet {
    // We will mutate
    let impliedAttributeSet = attributeSet.clone();

    // TODO: improve complexity
    let changed = true;
    while ( changed ) {
      changed = false;

      for ( const implication of implications ) {
        if (
          implication.antecedent.isProperSubsetOf( impliedAttributeSet ) &&
          !implication.consequent.isSubsetOf( impliedAttributeSet )
        ) {
          impliedAttributeSet.or( implication.consequent );
          changed = true;
        }
      }
    }

    return impliedAttributeSet;
  }
}