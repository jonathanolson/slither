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

      // for ( const implication of implications ) {
      //   if (
      //     implication.antecedent.isProperSubsetOf( impliedAttributeSet ) &&
      //     !implication.consequent.isSubsetOf( impliedAttributeSet )
      //   ) {
      //     impliedAttributeSet.or( implication.consequent );
      //     changed = true;
      //   }
      // }

      // optimized inlined version of above
      const numImplications = implications.length;
      for ( let i = 0; i < numImplications; i++ ) {
        // for ( const implication of implications ) {
        const implication = implications[ i ];

        const antecedentData = implication.antecedent.data;
        const consequentData = implication.consequent.data;
        const setData = impliedAttributeSet.data;

        // isProperSubsetOf: return this.isSubsetOf( other ) && !this.equals( other );
        // isSubsetOf: return ( this.data & other.data ) === this.data;
        // equals: return this.data === other.data;
        // or: this.data = this.data | other.data;

        if (
          // implication.antecedent.isProperSubsetOf( impliedAttributeSet )
          ( antecedentData & setData ) === antecedentData &&
          antecedentData !== setData &&

          // !implication.consequent.isSubsetOf( impliedAttributeSet )
          ( consequentData & setData ) !== consequentData
        ) {
          // impliedAttributeSet.or( implication.consequent );
          impliedAttributeSet.data |= consequentData;
          changed = true;
        }
      }
    }

    return impliedAttributeSet;
  }
}