import { FeatureSet } from '../feature/FeatureSet.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { BinaryFeatureMap } from './BinaryFeatureMap.ts';
import { PatternBoardSolver } from '../PatternBoardSolver.ts';
import { RichSolution } from './RichSolution.ts';
import { HighlanderPruner } from '../formal-concept/HighlanderPruner.ts';
import { IncompatibleFeatureError } from '../feature/IncompatibleFeatureError.ts';
import { FaceFeature } from '../feature/FaceFeature.ts';
import { RedEdgeFeature } from '../feature/RedEdgeFeature.ts';

export const getFeatureSetClosure = (
  featureSet: FeatureSet,
  includeEdges: boolean,
  includeSectors: boolean,
  includeFaces: boolean,
  highlander: boolean,
): FeatureSet | null => {
  // TODO: better options handling
  const solutionOptions = {
    solveEdges: includeEdges,
    solveSectors: includeSectors,
    solveFaceColors: includeFaces,
    highlander: highlander,
  };

  const patternBoard = featureSet.patternBoard;

  const binaryFeatureMap = new BinaryFeatureMap( patternBoard, solutionOptions );
  const numAttributes = binaryFeatureMap.numAttributes;
  const patternBits = binaryFeatureMap.getFeatureSetBits( featureSet );

  let inputSolveFeatures = featureSet.getFeaturesArray();
  if ( highlander ) {
    inputSolveFeatures = inputSolveFeatures.filter( feature => feature instanceof FaceFeature || ( feature instanceof RedEdgeFeature && feature.edge.isExit ) );
  }

  const solutions = PatternBoardSolver.getSolutions( patternBoard, inputSolveFeatures );
  let richSolutions = solutions.map( solution => new RichSolution( patternBoard, binaryFeatureMap, solution, solutionOptions ) );

  if ( highlander ) {
    richSolutions = HighlanderPruner.filterWithFeatureSet( richSolutions, featureSet );
  }
  const closureBits = SolutionAttributeSet.solutionClosure( numAttributes, richSolutions.map( richSolution => richSolution.solutionAttributeSet ), patternBits );

  const outputFeatureSetChanges = binaryFeatureMap.getBitsFeatureSet( closureBits );

  if ( outputFeatureSetChanges ) {
    const outputFeatureSet = featureSet.clone();

    try {
      outputFeatureSet.applyFeaturesFrom( outputFeatureSetChanges );
    }
    catch ( e ) {
      if ( e instanceof IncompatibleFeatureError ) {
        return null;
      }
      else {
        throw e;
      }
    }

    return outputFeatureSet;
  }
  else {
    return null;
  }
};