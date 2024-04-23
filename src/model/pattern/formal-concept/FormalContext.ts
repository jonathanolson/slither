import { AttributeSet } from './AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class FormalContext {
  public constructor(
    public readonly numAttributes: number,
    public readonly objectAttributeSets: AttributeSet[],
  ) {}

  public getClosure( attributeSet: AttributeSet ): AttributeSet {
    assertEnabled() && assert( this.numAttributes === attributeSet.numAttributes );

    let closure = AttributeSet.getFull( this.numAttributes );

    for ( const otherAttributeSet of this.objectAttributeSets ) {
      if ( attributeSet.isSubsetOf( otherAttributeSet ) ) {
        closure.and( otherAttributeSet );
      }
    }

    return closure;
  }

  public getNextClosure( attributeSet: AttributeSet ): AttributeSet | null {
    assertEnabled() && assert( this.numAttributes === attributeSet.numAttributes );

    for ( let i = 0; i < this.numAttributes; i++ ) {
      const withLowestBit = attributeSet.withLowestBitSet( i );

      const closedWithLowestBit = this.getClosure( withLowestBit );

      if ( attributeSet.isLessThanI( closedWithLowestBit, i ) ) {
        return closedWithLowestBit;
      }
    }

    return null;
  }

  public toString(): string {
    return `FormalContext( #${this.numAttributes}\n${this.objectAttributeSets.map( set => `  ${set.toString()}` ).join( '\n' )}\n)`;
  }
}