import { PatternRule } from '../PatternRule.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { optionize3 } from 'phet-lib/phet-core';
import { NextClosure } from '../formal-concept/NextClosure.ts';
import { TablePruner } from '../formal-concept/TablePruner.ts';
import { BinaryFeatureMap } from './BinaryFeatureMap.ts';
import { PatternBoardSolver } from '../PatternBoardSolver.ts';
import { RichSolution } from './RichSolution.ts';

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

  // TODO: better options handling
  const solutionOptions = {
    solveEdges: includeEdges,
    solveSectors: includeSectors,
    solveFaceColors: includeFaces,
    highlander: highlander,
  };

  const patternBoard = featureSet.patternBoard;
  const inputFeatures = featureSet.getFeaturesArray();

  const binaryFeatureMap = new BinaryFeatureMap( patternBoard, solutionOptions );

  const numAttributes = binaryFeatureMap.numAttributes;

  const solutions = PatternBoardSolver.getSolutions( patternBoard, inputFeatures );
  const richSolutions = solutions.map( solution => new RichSolution( patternBoard, binaryFeatureMap, solution, solutionOptions ) );


  let getClosure: ( attributeSet: bigint ) => bigint;
  if ( highlander ) {
    // TODO: do highlander filtering
    throw new Error();
  }
  else {
    const tablePruner = new TablePruner( numAttributes, richSolutions.map( solution => binaryFeatureMap.getSolutionAttributeSet( solution.solutionSet ) ) );

    getClosure = ( attributeSet: bigint ) => {
      const prunedSolutionSets = tablePruner.getSolutionAttributeSets( attributeSet );

      return SolutionAttributeSet.solutionClosure( numAttributes, prunedSolutionSets, attributeSet );
    };
  }

  const invalidAttributeSet = ( 1n << BigInt( numAttributes ) ) - 1n;

  const rules: PatternRule[] = [];
  NextClosure.forEachImplication( numAttributes, getClosure, implication => {
    if ( implication.consequent === invalidAttributeSet ) {
      return;
    }

    // TODO: see if we can relax this

    const inputFeatureSet = featureSet.clone();
    const outputFeatureSet = featureSet.clone();

    const inputFeatureSetChanges = binaryFeatureMap.getBitsFeatureSet( implication.antecedent )!;
    inputFeatureSet.applyFeaturesFrom( inputFeatureSetChanges );

    const outputFeatureSetChanges = binaryFeatureMap.getBitsFeatureSet( implication.consequent )!;
    outputFeatureSet.applyFeaturesFrom( outputFeatureSetChanges );

    inputFeatureSet.applyFeaturesFrom( inputFeatureSetChanges );
    outputFeatureSet.applyFeaturesFrom( outputFeatureSetChanges );

    // TODO: reverse order eventually, after we are done testing
    // const inputFeatureSet = binaryFeatureMap.getBitsFeatureSet( implication.antecedent )!;
    // assertEnabled() && assert( inputFeatureSet );
    // inputFeatureSet.applyFeaturesFrom( featureSet );
    //
    // const outputFeatureSet = binaryFeatureMap.getBitsFeatureSet( implication.consequent )!;
    // assertEnabled() && assert( outputFeatureSet );
    // outputFeatureSet.applyFeaturesFrom( featureSet );



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

    rules.push( new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet ) );
  }, {
    logModulo: options.logModulo,
    logModuloCallback: ( count, set, implications, seconds ) => {
      // TODO: use BinaryFeatureMap to log this out better
      console.log( count.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ), `${set.toString()}`, implications.length, `${seconds}s` );
    }
  } );

  return rules;
};