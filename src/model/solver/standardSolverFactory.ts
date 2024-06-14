import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SimpleVertexSolver } from './SimpleVertexSolver.ts';
import { SimpleFaceSolver } from './SimpleFaceSolver.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';
import { StaticDoubleMinusOneFacesSolver } from './StaticDoubleMinusOneFacesSolver.ts';
import { SafeEdgeToSectorSolver } from './SafeEdgeToSectorSolver.ts';
import { StaticSectorSolver } from './StaticSectorSolver.ts';
import { SimpleSectorSolver } from './SimpleSectorSolver.ts';
import { SafeEdgeSectorColorToVertexSolver } from './SafeEdgeSectorColorToVertexSolver.ts';
import { VertexToEdgeSolver } from './VertexToEdgeSolver.ts';
import { VertexToSectorSolver } from './VertexToSectorSolver.ts';
import { SimpleFaceColorSolver } from './SimpleFaceColorSolver.ts';
import { FaceColorParitySolver } from './FaceColorParitySolver.ts';
import { VertexToFaceColorSolver } from './VertexToFaceColorSolver.ts';
import { VertexColorToFaceSolver } from './VertexColorToFaceSolver.ts';
import { FaceToEdgeSolver } from './FaceToEdgeSolver.ts';
import { FaceToSectorSolver } from './FaceToSectorSolver.ts';
import { FaceToFaceColorSolver } from './FaceToFaceColorSolver.ts';
import { FaceToVertexSolver } from './FaceToVertexSolver.ts';

export const standardSolverFactory = (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>([
    new SafeEdgeToSimpleRegionSolver(board, state),
    new SafeSolvedEdgeSolver(board, state),
    new SafeEdgeToFaceColorSolver(board, state),

    new SimpleVertexSolver(board, state, {
      solveJointToRed: true,
      solveForcedLineToBlack: true,
      solveAlmostEmptyToRed: true,
    }),
    new SimpleFaceSolver(board, state, {
      solveToRed: true,
      solveToBlack: true,
    }),

    // We rely on the Simple Regions being accurate here, so they are lower down
    new SimpleLoopSolver(board, state, {
      solveToRed: true,
      solveToBlack: true,
      resolveAllRegions: false, // NOTE: this will be faster
    }),

    // e.g. double-3s adjacent in square form
    new StaticDoubleMinusOneFacesSolver(board, state),

    new SafeEdgeToSectorSolver(board, state),
    new StaticSectorSolver(board, state),
    new SimpleSectorSolver(board, state),

    new SafeEdgeSectorColorToVertexSolver(board, state),

    new VertexToEdgeSolver(board, state, {
      solveToRed: true,
      solveToBlack: true,
    }),
    new VertexToSectorSolver(board, state),

    // We rely on the Face colors being accurate here
    new SimpleFaceColorSolver(board, state, {
      solveToRed: true,
      solveToBlack: true,
    }),

    new FaceColorParitySolver(board, state, {
      solveToRed: true,
      solveToBlack: true,
      solveColors: true,
      allowPartialReduction: true,
    }),

    new VertexToFaceColorSolver(board, state),

    new VertexColorToFaceSolver(board, state),
    new FaceToEdgeSolver(board, state, {
      solveToRed: true,
      solveToBlack: true,
    }),
    new FaceToSectorSolver(board, state),
    new FaceToFaceColorSolver(board, state),
    new FaceToVertexSolver(board, state),
  ]);
};
