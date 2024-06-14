import { PatternRule } from './PatternRule.ts';
import { getPatternBoardGenericRichSolutions } from '../solve/getPatternBoardGenericRichSolutions.ts';
import { HighlanderPruner } from '../formal-concept/HighlanderPruner.ts';
import { GenericRichSolution } from '../solve/GenericRichSolution.ts';

// TODO: PatternRule SHOULD keep track of whether it is a highlander rule, right?
export const isPatternRuleValid = (
  patternRule: PatternRule,
  highlander: boolean,
  // optional, prevents things from being cached globally (which seems to use a lot of memory)
  patternBoardSolutions?: GenericRichSolution[],
): boolean => {
  const inputFeatures = patternRule.inputFeatureSet.getFeaturesArray();
  const outputFeatures = patternRule.outputFeatureSet.getFeaturesArray();

  // All solution for the PatternBoard (should be effectively cached)
  let inputSolutions = patternBoardSolutions ?? getPatternBoardGenericRichSolutions(patternRule.patternBoard);

  // Highlander filter
  if (highlander) {
    inputSolutions = HighlanderPruner.filterWithFeatureSet(inputSolutions, patternRule.inputFeatureSet);
  }

  // Input feature filter
  inputSolutions = inputSolutions.filter((solution) =>
    inputFeatures.every((feature) => feature.isPossibleWith(solution.isEdgeBlack)),
  );

  for (const solution of inputSolutions) {
    if (!outputFeatures.every((feature) => feature.isPossibleWith(solution.isEdgeBlack))) {
      return false;
    }
  }

  return true;
};
