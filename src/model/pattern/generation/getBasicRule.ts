import { TPatternBoard } from '../TPatternBoard.ts';
import { BasicSolveOptions, FeatureSet } from '../feature/FeatureSet.ts';
import { PatternRule } from '../PatternRule.ts';
import { featureSetSolved } from './featureSetSolved.ts';

export const getBasicRule = ( patternBoard: TPatternBoard, inputFeatureSet: FeatureSet, options?: BasicSolveOptions ): PatternRule | null => {
  const outputFeatureSet = featureSetSolved( inputFeatureSet, options );

  if ( outputFeatureSet ) {
    return new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );
  }
  else {
    return null;
  }
};