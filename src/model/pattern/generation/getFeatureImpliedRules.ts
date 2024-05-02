import { PatternRule } from '../PatternRule.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { PatternAttributeSetMapping, SolutionSet } from '../SolutionSet.ts';
import { AttributeSet } from '../formal-concept/AttributeSet.ts';
import _ from '../../../workarounds/_.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { optionize3 } from 'phet-lib/phet-core';
import { NextClosure } from '../formal-concept/NextClosure.ts';
import { TablePruner } from '../formal-concept/TablePruner.ts';

export type GetFeatureImpliedRulesOptions = {
  logModulo?: number;
};

export const GET_FEATURE_IMPLIED_RULES_DEFAULTS = {
  logModulo: 1000000,
};

export const getFeatureImpliedRules = (
  featureSet: FeatureSet,
  includeEdges: boolean,
  includeSectors: boolean,
  includeFaces: boolean,
  highlander: boolean,
  providedOptions?: GetFeatureImpliedRulesOptions
): PatternRule[] => {
  const options = optionize3<GetFeatureImpliedRulesOptions>()( {}, GET_FEATURE_IMPLIED_RULES_DEFAULTS, providedOptions );

  let initialSolutionSet = SolutionSet.fromFeatureSet(
    featureSet,
    includeEdges,
    includeSectors,
    includeFaces,
    highlander
  );

  // We might have faces that have no solutions!
  if ( !initialSolutionSet ) {
    return [];
  }

  console.log( 'solutions', initialSolutionSet.numSolutions );

  const solutionSet = initialSolutionSet;

  const mapping = new PatternAttributeSetMapping( solutionSet.patternBoard, solutionSet.shape );

  const numAttributes = mapping.numBits;

  // let edgeHighlanderCodeMask = 0n;
  //
  // // Holds pairs that detect features (red exit edge features) in the attribute set, and then IF that matches, the
  // // bit pattern to & to the mask to get the (reduced) highlander mask.
  // const edgeHighlanderCodePairs: [ bigint, bigint ][] = [];
  //
  // if ( highlander ) {
  //   // TODO NOTE: if we fully rule out all solutions FROM THE START... we should potentially create a rule that says "all determinate edges are red?"
  //   // maybe NO: "everything red" will be a solution
  //   // TODO: if it is an "invalid" pattern for highlander, all will be filtered, including "everything red"
  //
  //   const indeterminateEdges = getIndeterminateEdges( featureSet.patternBoard, featureSet.getFeaturesArray() );
  //
  //   for ( const indeterminateEdge of indeterminateEdges ) {
  //     edgeHighlanderCodeMask |= 0x3n << BigInt( 2 * indeterminateEdge.index );
  //   }
  //
  //   // Attribute mask with all bits set
  //   const fullMask = ( 1n << BigInt( 2 * featureSet.patternBoard.edges.length ) ) - 1n;
  //
  //   for ( const edge of featureSet.patternBoard.edges ) {
  //     if ( edge.isExit ) {
  //       const redSolutionEdgeIndex = 3 * edge.index + 1;
  //       const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );
  //
  //       edgeHighlanderCodePairs.push( [
  //         // a mask to detect the presence of a red exit edge in an attribute set
  //         1n << BigInt( redAttributeEdgeIndex ),
  //
  //         // a mask with all bits set EXCEPT those that should be removed from the edgeHighlanderCodeMask when this
  //         // feature is present
  //         fullMask - ( 0x3n << BigInt( 2 * edge.index ) )
  //       ] );
  //     }
  //   }
  // }

  const solutionAttributeSets = _.range( 0, solutionSet.numSolutions ).map( solutionIndex => {
    // TODO: factor back in?
    const baseBigint = mapping.getBigint( solutionSet.bitData, solutionIndex );

    const simpleAttributeSet = AttributeSet.fromBinary( numAttributes, baseBigint );

    let redEdgeData = BigInt( 0 );

    if ( includeEdges ) {
      featureSet.patternBoard.edges.forEach( edge => {
        if ( !edge.isExit ) {
          return;
        }

        const redSolutionEdgeIndex = 3 * edge.index + 1;
        const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );

        // TODO: map directly from solutions ideally
        if ( simpleAttributeSet.hasAttribute( redAttributeEdgeIndex ) ) {
          return;
        }

        const hasNoBlackNonExitEdges = edge.exitVertex!.edges.every( edge => {
          return edge.isExit || !simpleAttributeSet.hasAttribute( mapping.mapBitIndex( 3 * edge.index ) );
        } );

        if ( hasNoBlackNonExitEdges ) {
          redEdgeData |= BigInt( 1 ) << BigInt( redAttributeEdgeIndex );
        }
      } );

      if ( highlander ) {
        throw new Error( 'unimplemented, reimplement new way' );
      }
    }

    return SolutionAttributeSet.fromSolutionBinary( numAttributes, baseBigint, redEdgeData );
  } );

  if ( highlander ) {
    // TODO: do highlander filtering
  }

  let getClosure: ( attributeSet: bigint ) => bigint;
  if ( highlander ) {
    throw new Error();
  }
  else {
    const tablePruner = new TablePruner( numAttributes, solutionAttributeSets );

    getClosure = ( attributeSet: bigint ) => {
      const prunedSolutionSets = tablePruner.getSolutionAttributeSets( attributeSet );

      return SolutionAttributeSet.solutionClosure( numAttributes, prunedSolutionSets, attributeSet );
    };
  }

  // console.log( featureSet.toCanonicalString() );
  // console.log( formalContext.toString() );
  //
  // if ( featureSet.getFeaturesArray().length === 0 ) {
  //   const input = AttributeSet.getEmpty( numAttributes ).withAttribute( 8 );
  //   const output = formalContext.getClosure( input );
  //
  //   console.log( 'input', input.toString() );
  //   console.log( 'output', output.toString() );
  //
  //   debugger;
  //   formalContext.getClosure( input );
  // }

  const invalidAttributeSet = ( 1n << BigInt( numAttributes ) ) - 1n;

  const rules: PatternRule[] = [];
  NextClosure.forEachImplication( numAttributes, getClosure, implication => {
    if ( implication.consequent === invalidAttributeSet ) {
      return;
    }

    const inputFeatureSet = featureSet.clone();
    const inputNumbers = mapping.getNumbers( implication.antecedent );
    SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, inputNumbers, inputFeatureSet );

    const outputFeatureSet = featureSet.clone();
    const outputNumbers = mapping.getNumbers( implication.consequent );
    SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, outputNumbers, outputFeatureSet );

    // if ( assertEnabled() ) {
    //   for ( let i = 0; i < solutionSet.numSolutions; i++ ) {
    //     const offset = i * solutionSet.shape.numNumbersPerSolution;
    //     let inputMatches = true;
    //     let outputMatches = true;
    //
    //     for ( let j = 0; j < solutionSet.shape.numNumbersPerSolution; j++ ) {
    //       if ( ( inputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== inputNumbers[ j ] ) {
    //         inputMatches = false;
    //       }
    //       if ( ( outputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== outputNumbers[ j ] ) {
    //         outputMatches = false;
    //       }
    //     }
    //
    //     // Implication
    //     assert( !inputMatches || outputMatches );
    //   }
    // }

    if ( inputFeatureSet.equals( outputFeatureSet ) ) {
      return;
    }

    rules.push( new PatternRule( solutionSet.patternBoard, inputFeatureSet, outputFeatureSet ) );
  }, {
    logModulo: options.logModulo,
    logModuloCallback: ( count, set, implications, seconds ) => {
      // TODO: use BinaryFeatureMap to log this out better
      console.log( count.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ), `${set.toString()}`, implications.length, `${seconds}s` );
    }
  } );

  return rules;
};