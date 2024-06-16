import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { SafeEdgeSectorColorToVertexSolver } from './SafeEdgeSectorColorToVertexSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSectorSolver } from './SafeEdgeToSectorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { TSolver } from './TSolver.ts';
import { VertexColorToFaceSolver } from './VertexColorToFaceSolver.ts';

export const getSafeSolverFactory = (
  faceColors: boolean,
  sectors: boolean,
  vertexState: boolean,
  faceState: boolean,
) => {
  return (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
    const solvers: TSolver<TCompleteData, TAnnotatedAction<TCompleteData>>[] = [
      new SafeEdgeToSimpleRegionSolver(board, state),
      new SafeSolvedEdgeSolver(board, state),
    ];

    if (faceColors || sectors || vertexState || faceState) {
      solvers.push(new SafeEdgeToFaceColorSolver(board, state));

      if (sectors || vertexState || faceState) {
        solvers.push(new SafeEdgeToSectorSolver(board, state));

        if (vertexState || faceState) {
          solvers.push(new SafeEdgeSectorColorToVertexSolver(board, state));

          if (faceState) {
            solvers.push(new VertexColorToFaceSolver(board, state));
          }
        }
      }
    }

    return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>(solvers);
  };
};
