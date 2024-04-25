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

  public forEachImplication( callback: ( implication: Implication ) => void ): void {
    // NOTE: We need to store implications to handle implication set closure(!)
    const implications: Implication[] = [];

    let set: AttributeSet | null = AttributeSet.getEmpty( this.numAttributes );

    while ( set ) {
      const closedSet = this.getClosure( set );

      if ( !set.equals( closedSet ) ) {
        // Is a pseudo-intent
        const implication = new Implication( set, closedSet );
        callback( implication );
        implications.push( implication );
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