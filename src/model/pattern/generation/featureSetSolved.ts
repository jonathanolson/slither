
// null if there is no solution
import { BASIC_SOLVE_DEFAULTS, BasicSolveOptions, FeatureSet } from '../feature/FeatureSet.ts';
import { optionize3 } from 'phet-lib/phet-core';
import { SolutionSet } from '../SolutionSet.ts';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';

export const featureSetSolved = ( featureSet: FeatureSet, providedOptions?: BasicSolveOptions ): FeatureSet | null => {
  // TODO: is this too much performance loss?
  const options = optionize3<BasicSolveOptions>()( {}, BASIC_SOLVE_DEFAULTS, providedOptions );

  let solutionSet: SolutionSet | null = SolutionSet.fromFeatureSet( featureSet, !!options.solveEdges, !!options.solveSectors, !!options.solveFaceColors, !!options.highlander );

  if ( solutionSet && options.highlander ) {
    solutionSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( featureSet.patternBoard, featureSet.getFeaturesArray() ) );
  }

  if ( solutionSet ) {
    return solutionSet.addToFeatureSet( featureSet.clone() );
  }
  else {
    return null;
  }
};