import { Implication } from './Implication.ts';

export class NextClosure {
  public static forEachImplication(
    numAttributes: number,
    getClosure: ( attributeSet: bigint ) => bigint,
    callback: ( implication: Implication ) => void,
    options?: { 
      logModulo?: number;
      logModuloCallback?: ( count: number, set: bigint, implications: Implication[], seconds: number ) => void;
    }
  ): void {
    const logModulo = options?.logModulo ?? 1000000;
    const logModuloCallback = options?.logModuloCallback;

    // NOTE: We need to store implications to handle implication set closure(!)
    const implications: Implication[] = [];

    let set: bigint | null = 0n;

    // TODO: this was bad logic. it works for "closure" in general, but we are doing the implication closure!
    // TODO: it feels like there IS a way to accelerate this, I just don't have it yet.
    // /*
    //   - For each bit i, find all bits k > i that are incompatible (never in a solution with i)
    //     - Have a mask for this. If our set INTERSECTS this, skip to next i (closure would be the full set)
    //   - For each bit i, find all bits k > i that are IMPLIED by just i
    //     - Have a mask for this. If (set & mask) !== mask (at least one bit missing from set in mask), skip to next i (closure would include this higher bit that is missing)
    //   - Actually, we can COMBINE this into an input/output mask, e.g.
    //     - see if ( set & inputMask ) === outputMask
    //       - inputMask is incompatibleMask | impliedMask
    //       - outputMask is impliedMask
    //  */
    //
    // const inputMasks: bigint[] = [];
    // const outputMasks: bigint[] = [];
    //
    // for ( let i = 0; i < numAttributes; i++ ) {
    //   // First start with all bits
    //   let incompatibleMask = ( 1n << BigInt( numAttributes ) ) - 1n;
    //   let impliedMask = ( 1n << BigInt( numAttributes ) ) - 1n;
    //
    //   // Then remove i and below
    //   const greaterThanIMask = ~( ( 1n << BigInt( i + 1 ) ) - 1n );
    //   incompatibleMask &= greaterThanIMask;
    //   impliedMask &= greaterThanIMask;
    //
    //   for ( let k = 0; k < this.objectAttributeSets.length; k++ ) {
    //     const objectAttributeSet = this.objectAttributeSets[ k ];
    //
    //     if ( objectAttributeSet.hasAttribute( i ) ) {
    //       incompatibleMask &= ~objectAttributeSet.data;
    //       impliedMask &= objectAttributeSet.data;
    //     }
    //   }
    //
    //   inputMasks.push( incompatibleMask | impliedMask );
    //   outputMasks.push( impliedMask );
    // }
    // TODO: what if we watch for these in the implications, and NOTE POTENTIALLY both:
    // TODO: - each implication that is just a single input bit --- THEN we can note that the implication exists
    // TODO: - BUT NOT for the "NOT this bit", since that isn't how our implications work.
    // TODO: --- this seems like information we could POTENTIALLY still use, look for nextClosure extensions
    // TODO: --- THIS requires we don't care about implications TO THE FULL SET
    // TODO: ----- if we get into an "pair-incompatible" state (two bits that are never together in a solution):
    // TODO:         - CAN WE FAST FORWARD TO WHERE THE LOWER BIT IS ZERO'ED OUT?
    // TODO:      IF WE DO NOT RECORD SOME "implications" THAT GO TO FULL SET, does NextClosure become invalid?
    const impliedGreaterMasks = new Array<bigint>( numAttributes ).fill( 0n );

    let count = 0;
    const initialTime = Date.now();

    while ( set !== null ) {
      count++;
      if ( count % logModulo === 0 ) {
        logModuloCallback && logModuloCallback( count, set, implications, Math.round( ( Date.now() - initialTime ) / 1000 ) );
      }

      const closedSet = getClosure( set );

      if ( set !== closedSet ) {
        // Is a pseudo-intent
        const implication = new Implication( set, closedSet );
        callback( implication );
        implications.push( implication );

        // Check if a single bit is set (we can mark that in impliedGreaterMasks, and hopefully get some acceleration)
        let data = set;
        // See if clearing the lowest bit results in 0
        if ( data !== 0n && ( data & data - 1n ) === 0n ) {
          // Get i
          let i = 0;
          while ( data > 1n ) {
            data >>= 1n;
            i++;
          }

          const greaterThanIMask = ~( ( 1n << BigInt( i + 1 ) ) - 1n );
          impliedGreaterMasks[ i ] |= greaterThanIMask & closedSet;
          // console.log( `${i} implies ${impliedGreaterMasks[ i ].toString( 2 )}` );
        }
      }

      let nextSet: bigint | null = null;
      for ( let i = 0; i < numAttributes; i++ ) {
        // NOTE: below is a performance-optimized version of this, where we can bail early
        // const withLowestBit = set.withLowestBitSet( i );
        //
        // const closedWithLowestBit = Implication.implicationSetClosure( implications, withLowestBit );
        //
        // if ( set.isLessThanI( closedWithLowestBit, i ) ) {
        //   nextSet = closedWithLowestBit;
        //   break;
        // }

        // Check if we imply a higher bit that we don't yet have in our set. If so, skip immediately
        if ( ( set & impliedGreaterMasks[ i ] ) !== impliedGreaterMasks[ i ] ) {
          continue;

          // TODO: can we have slow assertions that check that potentialNextSet would be null here? Did assert in the code below
          // if ( ( set.data & impliedGreaterMasks[ i ] ) !== impliedGreaterMasks[ i ] ) {
          //   if ( potentialNextSet ) {
          //     throw new Error( 'I guessed wrong' );
          //   }
          //   else {
          //     console.log( 'hit' );
          //   }
          // }
        }

        const potentialNextSet = Implication.implicationSetClosureLessThanI( implications, set, i );


        // if ( ( set.data & inputMasks[ i ] ) !== outputMasks[ i ] ) {
        //   if ( potentialNextSet ) {
        //     throw new Error( 'I guessed wrong' );
        //   }
        // }

        if ( potentialNextSet !== null ) {
          nextSet = potentialNextSet;
          break;
        }
      }

      if ( nextSet !== null ) {
        set = nextSet;
      }
      else {
        // done!
        break;
      }
    }
  }
}