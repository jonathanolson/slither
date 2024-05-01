import { FormalContext } from './FormalContext.ts';
import { SolutionAttributeSet } from './SolutionAttributeSet.ts';
import { AttributeSet } from './AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import _ from '../../../workarounds/_.ts';

const hasWithOptionalAttribute = ( set: SolutionAttributeSet, i: number ): boolean => {
  return ( set.withOptionalData & ( 1n << BigInt( i ) ) ) !== 0n;
};

const enableObjectPruning = true;

export class SolutionFormalContext extends FormalContext {

  public singleAttributeObjectsMap: SolutionAttributeSet[][] | null;
  public doubleAttributeObjectsMap: SolutionAttributeSet[][][] | null; // IMPORTANT, second index is [0] for [i+1], so we have better memory locality
  // TODO: consider trying a THIRD level here?

  public constructor(
    numAttributes: number,
    public readonly solutionAttributeSets: SolutionAttributeSet[],

    // Whether we are running highlander filtering
    public readonly highlander: boolean,
  ) {
    super( numAttributes, solutionAttributeSets );

    /*
      NOTE: For larger sets of solutionAttributeSets, it makes sense to "prune" what is possible for getClosure().
      When given a set (to get a closure of), instead of having to check ALL of our "objects", we can create look-up
      tables to arrays of objects that only have CERTAIN attributes.

      The simple case is the "single" case, where each look-up table is for a single attribute. We can further
      approximately-halve things if we go to a look-up table where we consider a pair of attributes
     */

    // NOTE threshold 110s for single on 389, 116s for none.
    // for getImpliedColorGeneralBoardRules( 1, 11, { logModulo: 100000 } )
    if ( solutionAttributeSets.length > 350 ) {
      this.singleAttributeObjectsMap = _.range( 0, numAttributes ).map( i => {
        return solutionAttributeSets.filter( solutionAttributeSet => hasWithOptionalAttribute( solutionAttributeSet, i ) );
      } );
      console.log( `single filter size: ${_.sum( this.singleAttributeObjectsMap.map( arr => arr.length ) )}` );
      // console.log( `single filter sizes (#${_.sum( this.singleAttributeObjectsMap.map( arr => arr.length ) )}): ${this.singleAttributeObjectsMap.map( arr => arr.length ).join( ', ' )}` );

      // NOTE threshold 105s for >1000, 102s for >2000 (on a 1583-count problem), so we're estimating a break-even of about 1500?
      // for getImpliedColorGeneralBoardRules( 1, 2, { logModulo: 100000 } )
      if ( solutionAttributeSets.length > 1500 ) {
        this.doubleAttributeObjectsMap = _.range( 0, numAttributes ).map( i => {
          return _.range( i + 1, numAttributes ).map( j => {
            return this.singleAttributeObjectsMap![ i ].filter( solutionAttributeSet => hasWithOptionalAttribute( solutionAttributeSet, j ) );
          } );
        } );
        console.log( `double filter size: ${_.sum( this.doubleAttributeObjectsMap.map( arr => _.sum( arr.map( subArr => subArr.length ) ) ) )}` );
        // console.log( `double filter min sizes: ${this.doubleAttributeObjectsMap.map( arr => Math.min( ...arr.map( arr2 => arr2.length ) ) ).join( ', ' )}` );
        // console.log( `double filter max sizes: ${this.doubleAttributeObjectsMap.map( arr => Math.max( ...arr.map( arr2 => arr2.length ) ) ).join( ', ' )}` );
      }
      else {
        this.doubleAttributeObjectsMap = null;
      }
    }
    else {
      this.singleAttributeObjectsMap = null;
      this.doubleAttributeObjectsMap = null;
    }
  }

  public override getClosure( attributeSet: AttributeSet ): AttributeSet {
    assertEnabled() && assert( this.numAttributes === attributeSet.numAttributes );

    let closure = AttributeSet.getFull( this.numAttributes );

    // // TODO: we're directly grabbing the data field, decent for performance, OK to have public?
    // for ( const solutionAttributeSet of this.solutionAttributeSets ) {
    //   if ( ( attributeSet.data & solutionAttributeSet.withOptionalData ) === attributeSet.data ) {
    //     // TODO: can we perhaps just OR it with attributeSet.data? Why do we need to filter optionalData? We are... a closure, right?
    //     // TODO: Unclear whether that is correct. This is not too bad, leave it for now for correctness?
    //     closure.data = closure.data & ( solutionAttributeSet.data | ( attributeSet.data & solutionAttributeSet.optionalData ) );
    //   }
    // }

    let solutionAttributeSets = this.solutionAttributeSets;
    const attributeSetData = attributeSet.data;

    if ( this.highlander ) {
      throw new Error( 'reimplement!' ); // TODO
    }
    // See if we can find a shorter list of solutionAttributeSets efficiently
    else if ( enableObjectPruning && this.singleAttributeObjectsMap ) {
      // get attribute indices that are set
      let indices = [];
      let n = attributeSet.data;
      let index = 0;
      while ( n > 0n ) {
        if ( n & 1n ) {
          indices.push( index );
        }
        n >>= 1n;
        index++;

        // Seems twice as slow in our 40,000 solution example
        // if ( indices.length === 2 ) {
        //   break;
        // }
      }

      if ( this.doubleAttributeObjectsMap && indices.length >= 2 ) {
        // // Just check a single one (seems twice as slow in our 40,000 solution example
        // {
        //   const i = indices[ 0 ];
        //   const j = indices[ 1 ];
        //   const potentialSolutionAttributeSets = this.doubleAttributeObjectsMap[ i ][ j - ( i + 1 ) ];
        //
        //   if ( potentialSolutionAttributeSets.length < solutionAttributeSets.length ) {
        //     solutionAttributeSets = potentialSolutionAttributeSets;
        //   }
        // }

        // Compare adjacent pairs
        for ( let pairIndex = 0; pairIndex < indices.length - 1; pairIndex++ ) {
          const i = indices[ pairIndex ];
          const j = indices[ pairIndex + 1 ];
          const potentialSolutionAttributeSets = this.doubleAttributeObjectsMap[ i ][ j - ( i + 1 ) ];

          if ( potentialSolutionAttributeSets.length < solutionAttributeSets.length ) {
            solutionAttributeSets = potentialSolutionAttributeSets;
          }
        }

        // // Compare "opposites"
        // for ( let pairIndex = 0; pairIndex < Math.floor( indices.length / 2 ); pairIndex++ ) {
        //   if ( pairIndex >= ( indices.length - 1 - pairIndex ) ) {
        //     throw new Error( 'eek' );
        //   }
        //   const i = indices[ pairIndex ];
        //   const j = indices[ indices.length - 1 - pairIndex ];
        //   const potentialSolutionAttributeSets = this.doubleAttributeObjectsMap[ i ][ j - ( i + 1 ) ];
        //
        //   if ( potentialSolutionAttributeSets.length < solutionAttributeSets.length ) {
        //     solutionAttributeSets = potentialSolutionAttributeSets;
        //   }
        // }
      }
      else if ( indices.length >= 1 ) {
        // TODO: OR WE JUST GRAB ONE INDEX, OMG THIS LOOKS EXPENSIVE
        for ( let i = 0; i < indices.length; i++ ) {
          const potentialSolutionAttributeSets = this.singleAttributeObjectsMap[ indices[ i ] ];
          if ( potentialSolutionAttributeSets.length < solutionAttributeSets.length ) {
            solutionAttributeSets = potentialSolutionAttributeSets;
          }
        }
      }
    }

    let closureData = closure.data;

    // Higher-performance version
    const numSolutionAttributeSets = solutionAttributeSets.length;
    for ( let i = 0; i < numSolutionAttributeSets; i++ ) {
      const solutionAttributeSet = solutionAttributeSets[ i ];

      if ( ( attributeSetData & solutionAttributeSet.withOptionalData ) === attributeSetData ) {
        closureData &= solutionAttributeSet.data | ( attributeSetData & solutionAttributeSet.optionalData );

        // NOTE: error checking code if this goes wrong
        // if ( !solutionAttributeSets.includes( solutionAttributeSet ) ) {
        //   throw new Error( 'eek' );
        // }
      }
    }

    closure.data = closureData;

    return closure;
  }
}