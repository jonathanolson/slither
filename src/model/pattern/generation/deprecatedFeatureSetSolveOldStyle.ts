
// null if there is no solution
// TODO: @deprecated, but kept around because... our new solution is NOT well tested, and this would be good to use
// TODO: for comparison.
import { BASIC_SOLVE_DEFAULTS, BasicSolveOptions, FeatureSet } from '../feature/FeatureSet.ts';
import { optionize3 } from 'phet-lib/phet-core';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { SolutionSet } from '../SolutionSet.ts';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';

export const solvedOldStyle = ( originalFeatureSet: FeatureSet, providedOptions?: BasicSolveOptions ): FeatureSet | null => {
  // TODO: is this too much performance loss?
  const options = optionize3<BasicSolveOptions>()( {}, BASIC_SOLVE_DEFAULTS, providedOptions );

  const solutions = originalFeatureSet.getSolutions( options.highlander );

  if ( solutions.length === 0 ) {
    return null;
  }

  const featureSet = originalFeatureSet.clone();

  const solutionSets = solutions.map( solution => new Set( solution ) );

  if ( options.solveEdges ) {
    // TODO: should this be an instance method?
    featureSet.addSolvedEdgeFeatures( solutionSets );
  }

  if ( options.solveSectors ) {
    featureSet.addSolvedSectorFeatures( solutionSets );
  }

  if ( options.solveFaceColors ) {
    featureSet.addSolvedFaceColorDualFeatures( solutionSets );
  }

  if ( assertEnabled() ) {
    let solutionSet: SolutionSet | null = SolutionSet.fromFeatureSet( originalFeatureSet, !!options.solveEdges, !!options.solveSectors, !!options.solveFaceColors, !!options.highlander );
    if ( solutionSet && options.highlander ) {
      solutionSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( originalFeatureSet.patternBoard, originalFeatureSet.getFeaturesArray() ) );
    }

    assertEnabled() && assert( solutionSet );
    const sanityFeatureSet = solutionSet!.addToFeatureSet( originalFeatureSet.clone() )!;
    assertEnabled() && assert( sanityFeatureSet );

    assertEnabled() && assert( sanityFeatureSet.equals( featureSet ) );
  }

  return featureSet;
};
