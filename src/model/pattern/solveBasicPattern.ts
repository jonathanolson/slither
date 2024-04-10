import { TPatternBoard } from './TPatternBoard.ts';
import { TEmbeddableFeature } from './feature/TEmbeddableFeature.ts';
import { PatternBoardSolver } from './PatternBoardSolver.ts';
import { coalesceEdgeFeatures } from './coalesceEdgeFeatures.ts';
import { coalesceFaceColorFeatures } from './coalesceFaceColorFeatures.ts';
import { coalesceSectorFeatures } from './coalesceSectorFeatures.ts';
import { filterRedundantFeatures } from './feature/filterRedundantFeatures.ts';
import { FaceColorDualFeature } from './feature/FaceColorDualFeature.ts';

export const solveBasicPattern = (
  patternBoard: TPatternBoard,
  features: TEmbeddableFeature[],
  solveEdges: boolean,
  solveFaceColors: boolean,
  solveSectors: boolean
): TEmbeddableFeature[] => {
  const solutions = PatternBoardSolver.getSolutions( patternBoard, features );

  const addedEdgeFeatures = solveEdges ? coalesceEdgeFeatures( patternBoard, solutions ) : [];
  const addedFaceColorFeatures = solveFaceColors ? coalesceFaceColorFeatures( patternBoard, solutions ) : [];
  const addedSectorFeatures = solveSectors ? coalesceSectorFeatures( patternBoard, solutions ) : [];

  return filterRedundantFeatures( [
    // Strip face color duals, because we can't vet redundancy (we generate a new set)
    ...( solveFaceColors ? features.filter( feature => !( feature instanceof FaceColorDualFeature ) ) : features ),
    ...addedEdgeFeatures,
    ...addedFaceColorFeatures,
    ...addedSectorFeatures
  ] );
};