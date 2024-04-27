import { PatternRule } from '../PatternRule.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { PatternAttributeSetMapping, SolutionSet } from '../SolutionSet.ts';
import { AttributeSet } from '../formal-concept/AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import _ from '../../../workarounds/_.ts';
import { SolutionFormalContext } from '../formal-concept/SolutionFormalContext.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';
import { optionize3 } from 'phet-lib/phet-core';

export type GetFeatureImpliedRulesOptions = {
  logModulo?: number;
  onlyNontrivialHighlander?: boolean;
};

export const GET_FEATURE_IMPLIED_RULES_DEFAULTS = {
  logModulo: 1000000,
  onlyNontrivialHighlander: false,
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

  // NOTE: Highlander indeterminate edges (and thus which "solutions" are filtered out) are set HERE, since we won't be
  // adding in face values!
  if ( initialSolutionSet && highlander ) {
    const initialSize = initialSolutionSet.numSolutions;
    initialSolutionSet = initialSolutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( featureSet.patternBoard, featureSet.getFeaturesArray() ) );

    // If no solutions were filtered, we won't gain anything from highlander (so for now, we
    if ( options.onlyNontrivialHighlander && initialSolutionSet && initialSolutionSet.numSolutions === initialSize ) {
      return [];
    }
  }

  // We might have faces that have no solutions!
  if ( !initialSolutionSet ) {
    return [];
  }

  const solutionSet = initialSolutionSet;

  const mapping = new PatternAttributeSetMapping( solutionSet.patternBoard, solutionSet.shape );

  const formalContext = new SolutionFormalContext( mapping.numBits, _.range( 0, solutionSet.numSolutions ).map( i => {
    // TODO: factor back in?
    const baseBigint = mapping.getBigint( solutionSet.bitData, i );

    const simpleAttributeSet = AttributeSet.fromBinary( mapping.numBits, baseBigint );

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
    }

    return SolutionAttributeSet.fromSolutionBinary( mapping.numBits, baseBigint, redEdgeData );
  } ) );

  // console.log( featureSet.toCanonicalString() );
  // console.log( formalContext.toString() );
  //
  // if ( featureSet.getFeaturesArray().length === 0 ) {
  //   const input = AttributeSet.getEmpty( mapping.numBits ).withAttribute( 8 );
  //   const output = formalContext.getClosure( input );
  //
  //   console.log( 'input', input.toString() );
  //   console.log( 'output', output.toString() );
  //
  //   debugger;
  //   formalContext.getClosure( input );
  // }

  const invalidAttributeSet = AttributeSet.getFull( mapping.numBits );

  const rules: PatternRule[] = [];
  formalContext.forEachImplication( implication => {
    if ( implication.consequent.equals( invalidAttributeSet ) ) {
      return;
    }

    const inputFeatureSet = featureSet.clone();
    const inputNumbers = mapping.getNumbers( implication.antecedent.getBits() );
    SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, inputNumbers, inputFeatureSet );

    const outputFeatureSet = featureSet.clone();
    const outputNumbers = mapping.getNumbers( implication.consequent.getBits() );
    SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, outputNumbers, outputFeatureSet );

    if ( assertEnabled() ) {
      for ( let i = 0; i < solutionSet.numSolutions; i++ ) {
        const offset = i * solutionSet.shape.numNumbersPerSolution;
        let inputMatches = true;
        let outputMatches = true;

        for ( let j = 0; j < solutionSet.shape.numNumbersPerSolution; j++ ) {
          if ( ( inputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== inputNumbers[ j ] ) {
            inputMatches = false;
          }
          if ( ( outputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== outputNumbers[ j ] ) {
            outputMatches = false;
          }
        }

        // Implication
        assert( !inputMatches || outputMatches );
      }
    }

    if ( inputFeatureSet.equals( outputFeatureSet ) ) {
      return;
    }

    rules.push( new PatternRule( solutionSet.patternBoard, inputFeatureSet, outputFeatureSet ) );
  }, {
    logModulo: options.logModulo
  } );

  return rules;
};