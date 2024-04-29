import { AttributeSet } from './AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { Implication } from './Implication.ts';

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

  // NextClosure
  public getIntents(): AttributeSet[] {
    const intents: AttributeSet[] = [];

    // let count = 0;

    let intent: AttributeSet | null = this.getClosure( AttributeSet.getEmpty( this.numAttributes ) );
    while ( intent ) {
      intents.push( intent );

      intent = this.getNextClosure( intent );

      // if ( count++ % 10000 === 0 ) {
      //   console.log( count, `${intent}` );
      // }
    }

    return intents;
  }

  public forEachImplication( callback: ( implication: Implication ) => void, options?: { logModulo?: number } ): void {
    const logModulo = options?.logModulo ?? 1000000;

    // NOTE: We need to store implications to handle implication set closure(!)
    const implications: Implication[] = [];

    let set: AttributeSet | null = AttributeSet.getEmpty( this.numAttributes );

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
    // for ( let i = 0; i < this.numAttributes; i++ ) {
    //   // First start with all bits
    //   let incompatibleMask = ( 1n << BigInt( this.numAttributes ) ) - 1n;
    //   let impliedMask = ( 1n << BigInt( this.numAttributes ) ) - 1n;
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
    const impliedGreaterMasks = new Array<bigint>( this.numAttributes ).fill( 0n );

    let count = 0;
    const initialTime = Date.now();

    while ( set ) {
      count++;
      if ( count % logModulo === 0 ) {
        console.log( count.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ), `${set.toString()}`, implications.length, `${Math.round( ( Date.now() - initialTime ) / 1000 )}s` );
      }

      const closedSet = this.getClosure( set );

      if ( !set.equals( closedSet ) ) {
        // Is a pseudo-intent
        const implication = new Implication( set, closedSet );
        callback( implication );
        implications.push( implication );

        // Check if a single bit is set (we can mark that in impliedGreaterMasks, and hopefully get some acceleration)
        let data = set.data;
        // See if clearing the lowest bit results in 0
        if ( data !== 0n && ( data & data - 1n ) === 0n ) {
          // Get i
          let i = 0;
          while ( data > 1n ) {
            data >>= 1n;
            i++;
          }

          const greaterThanIMask = ~( ( 1n << BigInt( i + 1 ) ) - 1n );
          impliedGreaterMasks[ i ] |= greaterThanIMask & closedSet.data;
          // console.log( `${i} implies ${impliedGreaterMasks[ i ].toString( 2 )}` );
        }
      }

      let nextSet: AttributeSet | null = null;
      for ( let i = 0; i < this.numAttributes; i++ ) {
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
        if ( ( set.data & impliedGreaterMasks[ i ] ) !== impliedGreaterMasks[ i ] ) {
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

        if ( potentialNextSet ) {
          nextSet = potentialNextSet;
          break;
        }
      }

      if ( nextSet ) {
        set = nextSet;
      }
      else {
        // done!
        break;
      }
    }
  }

  // TODO: can we filter out isomorphisms???
  public getIntentsAndImplications(): {
    intents: AttributeSet[];
    implications: Implication[];
  } {
    const intents: AttributeSet[] = [];
    const implications: Implication[] = [];

    let set: AttributeSet | null = AttributeSet.getEmpty( this.numAttributes );

    while ( set ) {
      const closedSet = this.getClosure( set );

      if ( set.equals( closedSet ) ) {
        // Is a concept intent
        intents.push( set );
      }
      else {
        // Is a pseudo-intent
        implications.push( new Implication( set, closedSet ) );
      }

      let nextSet: AttributeSet | null = null;
      for ( let i = 0; i < this.numAttributes; i++ ) {
        // TODO: can we get away without clearing the other bits? no, right?
        const withLowestBit = set.withLowestBitSet( i );

        const closedWithLowestBit = Implication.implicationSetClosure( implications, withLowestBit );

        if ( set.isLessThanI( closedWithLowestBit, i ) ) {
          nextSet = closedWithLowestBit;
          break;
        }
      }

      if ( nextSet ) {
        set = nextSet;
      }
      else {
        // done!
        break;
      }
    }

    return {
      intents,
      implications,
    };
  }

  // NextClosures TODO allow pre-existing implications (embedded)
  public getIntentsAndImplicationsParallelizable(): {
    intents: AttributeSet[];
    implications: Implication[];
  } {
    let k = 0;
    let currentCandidates: AttributeSet[] = [];
    let nextCandidates: AttributeSet[] = [ AttributeSet.getEmpty( this.numAttributes ) ];
    const intents: AttributeSet[] = [];
    const implications: Implication[] = [];

    const intentKeys = new Set<string>();
    const implicationKeys = new Set<string>();

    while ( k <= this.numAttributes ) {
      currentCandidates = nextCandidates;
      nextCandidates = [];

      if ( currentCandidates.length === 0 ) {
        break;
      }

      currentCandidates.sort( ( a, b ) => a.isLessThanOrEqual( b ) ? -1 : a.equals( b ) ? 0 : 1 );

      const uniqueCandidates: AttributeSet[] = [
        currentCandidates[ 0 ]
      ];
      for ( let i = 1; i < currentCandidates.length; i++ ) {
        if ( !currentCandidates[ i ].equals( currentCandidates[ i - 1 ] ) ) {
          uniqueCandidates.push( currentCandidates[ i ] );
        }
      }

      // console.log( k, currentCandidates.length, uniqueCandidates.length );

      for ( const candidate of uniqueCandidates ) {
        // TODO: maybe store cardinality...?
        const cardinality = candidate.getCardinality();

        if ( cardinality === k ) {
          let impliedCandidate = Implication.implicationSetClosure( implications, candidate );

          if ( candidate.equals( impliedCandidate ) ) {
            const closedCandidate = this.getClosure( candidate );

            if ( !candidate.equals( closedCandidate ) ) {
              const implicationKey = candidate.toString();
              if ( !implicationKeys.has( implicationKey ) ) {
                implicationKeys.add( implicationKey );
                implications.push( new Implication( candidate, closedCandidate ) );
              }
            }

            const closedCandidateKey = closedCandidate.toString();
            if ( !intentKeys.has( closedCandidateKey ) ) {
              intentKeys.add( closedCandidateKey );
              intents.push( closedCandidate );
            }

            for ( let i = 0; i < this.numAttributes; i++ ) {
              if ( !closedCandidate.hasAttribute( i ) ) {
                const nextCandidate = closedCandidate.clone();
                nextCandidate.set( i );
                nextCandidates.push( nextCandidate );
              }
            }
          }
          else {
            nextCandidates.push( impliedCandidate );
          }
        }
        else {
          nextCandidates.push( candidate );
        }
      }

      k++;
    }

    return {
      intents,
      implications,
    };
  }

  public toString(): string {
    return `FormalContext( #${this.numAttributes}\n${this.objectAttributeSets.map( set => `  ${set.toString()}` ).join( '\n' )}\n)`;
  }
}