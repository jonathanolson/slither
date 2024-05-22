import { PatternRule } from './PatternRule.ts';
import { getPatternBoardGenericRichSolutions } from './getPatternBoardGenericRichSolutions.ts';
import { HighlanderPruner } from './formal-concept/HighlanderPruner.ts';

// TODO: PatternRule SHOULD keep track of whether it is a highlander rule, right?
export const isPatternRuleValid = ( patternRule: PatternRule, highlander: boolean ): boolean => {

  const inputFeatures = patternRule.inputFeatureSet.getFeaturesArray();
  const outputFeatures = patternRule.outputFeatureSet.getFeaturesArray();

  // All solution for the PatternBoard (should be effectively cached)
  let inputSolutions = getPatternBoardGenericRichSolutions( patternRule.patternBoard );

  // Highlander filter
  if ( highlander ) {
    inputSolutions = HighlanderPruner.filterWithFeatureSet( inputSolutions, patternRule.inputFeatureSet );
  }

  // Input feature filter
  inputSolutions = inputSolutions.filter( solution => inputFeatures.every( feature => feature.isPossibleWith( solution.isEdgeBlack ) ) );

  for ( const solution of inputSolutions ) {
    if ( !outputFeatures.every( feature => feature.isPossibleWith( solution.isEdgeBlack ) ) ) {
      return false;
    }
  }

  return true;
};