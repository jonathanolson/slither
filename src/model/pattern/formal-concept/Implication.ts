export class Implication {
  public constructor(
    public readonly antecedent: bigint,
    public readonly consequent: bigint
  ) {}

  public toString(): string {
    return `${this.antecedent.toString()} -> ${this.consequent.toString()}`;
  }

  // Only applies non-full rules
  public static implicationSetClosure(
    implications: Implication[],
    attributeSet: bigint
  ): bigint {
    // We will mutate
    let impliedAttributeSet = attributeSet;

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

        const antecedent = implication.antecedent;
        const consequent = implication.consequent;
        const setData = impliedAttributeSet;

        // isProperSubsetOf: return this.isSubsetOf( other ) && !this.equals( other );
        // isSubsetOf: return ( this.data & other.data ) === this.data;
        // equals: return this.data === other.data;
        // or: this.data = this.data | other.data;

        if (
          // implication.antecedent.isProperSubsetOf( impliedAttributeSet )
          ( antecedent & setData ) === antecedent &&
          antecedent !== setData &&

          // !implication.consequent.isSubsetOf( impliedAttributeSet )
          ( consequent & setData ) !== consequent
        ) {
          // impliedAttributeSet.or( implication.consequent );
          impliedAttributeSet |= consequent;
          changed = true;
        }
      }
    }

    return impliedAttributeSet;
  }

  // Like implicationSetClosure, but because we're usually guarding against isLessThanI, we can bail if we set a NEW
  // bit above i, instead of continuing to check all implications.
  // We can also bail of i is ALREADY in the attribute set.
  // Basically, we want to encapsulate the logic previously used, of:
  //
  //   const withLowestBit = set.withLowestBitSet( i );
  //
  //   const closedWithLowestBit = Implication.implicationSetClosure( implications, withLowestBit );
  //
  //   if ( set.isLessThanI( closedWithLowestBit, i ) ) {
  //     nextSet = closedWithLowestBit;
  //     break;
  //   }
  //
  // and replace it with:
  //
  //   const potentialNextSet = Implication.implicationSetClosureLessThanI( implications, set, i );
  //   if ( potentialNextSet ) {
  //     set = potentialNextSet;
  //     break;
  //   }
  //
  // NOTE: example isLessThanI behavior:
  //   public isLessThanI( other: AttributeSet, i: number ): boolean {
  //     assertEnabled() && assert( this.numAttributes === other.numAttributes );
  //
  //     if ( !other.hasAttribute( i ) || this.hasAttribute( i ) ) {
  //       return false;
  //     }
  //
  //     const mask = ~( ( 1n << BigInt( i + 1 ) ) - 1n );
  //
  //     const highBits = this.data & mask;
  //     const otherHighBits = other.data & mask;
  //
  //     return highBits === otherHighBits;
  //   }
  //
  // TODO: check with built-in assertions checking equality with the old version, AND check a bunch of sets.
  public static implicationSetClosureLessThanI(
    implications: Implication[],
    attributeSet: bigint,
    i: number,
  ): bigint | null {
    // Must not be set. If it is set, we would fail the isLessThanI check
    // (see if it has the attribute set)
    if ( ( attributeSet & ( 1n << BigInt( i ) ) ) !== 0n ) {
      return null;
    }

    // withLowestBitSet( i )
    let bits = ( attributeSet & ~( ( 1n << BigInt( i ) ) - 1n ) ) | ( 1n << BigInt( i ) );

    let abortRegion = ~( ( 1n << BigInt( i + 1 ) ) - 1n ); // all bits above i
    let abortMask = abortRegion & ~bits;

    // TODO: improve complexity --- console.log HOW MANY iterations and counts we are doing, to see if we can optimize
    let changed = true;
    while ( changed ) {
      changed = false;

      // NOTE: This is the main logic
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

        const antecedent = implication.antecedent;
        const consequent = implication.consequent;

        // isProperSubsetOf: return this.isSubsetOf( other ) && !this.equals( other );
        // isSubsetOf: return ( this.data & other.data ) === this.data;
        // equals: return this.data === other.data;
        // or: this.data = this.data | other.data;

        if (
          // implication.antecedent.isProperSubsetOf( impliedAttributeSet )
          ( antecedent & bits ) === antecedent &&
          antecedent !== bits &&

          // !implication.consequent.isSubsetOf( impliedAttributeSet )
          ( consequent & bits ) !== consequent
        ) {
          // If it sets a bit above i, abort!
          if ( consequent & abortMask ) {
            return null;
          }

          // impliedAttributeSet.or( implication.consequent );
          bits |= consequent;
          changed = true;
        }
      }
    }

    return bits;
  }
}