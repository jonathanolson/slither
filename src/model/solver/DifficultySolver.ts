import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { getAnnotationDifficultyB } from '../data/core/TAnnotation.ts';
import { TState } from '../data/core/TState.ts';
import { generalAllMixedGroup } from '../pattern/collection/generalAllMixedGroup.ts';
import { generalColorMixedGroup } from '../pattern/collection/generalColorMixedGroup.ts';
import { generalEdgeColorMixedGroup } from '../pattern/collection/generalEdgeColorMixedGroup.ts';
import { generalEdgeMixedGroup } from '../pattern/collection/generalEdgeMixedGroup.ts';
import { generalEdgeSectorMixedGroup } from '../pattern/collection/generalEdgeSectorMixedGroup.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { BinaryPatternSolver } from './BinaryPatternSolver.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { FaceColorDisconnectionSolver } from './FaceColorDisconnectionSolver.ts';
import { FaceColorParitySolver } from './FaceColorParitySolver.ts';
import { FaceToEdgeSolver } from './FaceToEdgeSolver.ts';
import { FaceToFaceColorSolver } from './FaceToFaceColorSolver.ts';
import { FaceToSectorSolver } from './FaceToSectorSolver.ts';
import { FaceToVertexSolver } from './FaceToVertexSolver.ts';
import { SafeEdgeSectorColorToVertexSolver } from './SafeEdgeSectorColorToVertexSolver.ts';
import { SafeEdgeToFaceColorSolver } from './SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSectorSolver } from './SafeEdgeToSectorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from './SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from './SafeSolvedEdgeSolver.ts';
import { SimpleFaceColorSolver } from './SimpleFaceColorSolver.ts';
import { SimpleFaceSolver } from './SimpleFaceSolver.ts';
import { SimpleLoopSolver } from './SimpleLoopSolver.ts';
import { SimpleSectorSolver } from './SimpleSectorSolver.ts';
import { SimpleVertexSolver } from './SimpleVertexSolver.ts';
import { StaticSectorSolver } from './StaticSectorSolver.ts';
import { TSolver } from './TSolver.ts';
import { VertexColorToFaceSolver } from './VertexColorToFaceSolver.ts';
import { VertexToEdgeSolver } from './VertexToEdgeSolver.ts';
import { VertexToFaceColorSolver } from './VertexToFaceColorSolver.ts';
import { VertexToSectorSolver } from './VertexToSectorSolver.ts';

export type DifficultySolverOptions = {
  solveEdges: boolean;
  solveSectors: boolean;
  solveFaceColors: boolean;
  solveVertexState: boolean;
  solveFaceState: boolean;
  cutoffDifficulty: number;
};

export class DifficultySolver<Data extends TCompleteData> implements TSolver<Data, TAnnotatedAction<Data>> {
  private _dirty = true;
  private _action: TAnnotatedAction<Data> | null = null;

  public constructor(board: TBoard, state: TState<Data>, options: DifficultySolverOptions) {
    const boardPatternBoard = BoardPatternBoard.get(board);

    const groups = [
      ...(options.solveEdges && options.solveFaceColors && options.solveSectors ? [generalAllMixedGroup] : []),
      ...(options.solveEdges && options.solveSectors ? [generalEdgeSectorMixedGroup] : []),
      ...(options.solveEdges && options.solveFaceColors ? [generalEdgeColorMixedGroup] : []),
      ...(options.solveFaceColors && !options.solveEdges ? [generalColorMixedGroup] : []),
      ...(options.solveEdges ? [generalEdgeMixedGroup] : []),
    ];

    const solverFactories = [
      () => new SafeEdgeToSimpleRegionSolver(board, state),
      () => new SafeSolvedEdgeSolver(board, state),

      ...(options.solveFaceColors ? [() => new SafeEdgeToFaceColorSolver(board, state)] : []),

      () =>
        new SimpleVertexSolver(board, state, {
          solveJointToRed: true,
          solveForcedLineToBlack: true,
          solveAlmostEmptyToRed: true,
        }),
      () =>
        new SimpleFaceSolver(board, state, {
          solveToRed: true,
          solveToBlack: true,
        }),
      () =>
        new SimpleLoopSolver(board, state, {
          solveToRed: true,
          solveToBlack: true,
          resolveAllRegions: false, // NOTE: this will be faster
        }),

      ...(options.solveSectors ?
        [
          () => new SafeEdgeToSectorSolver(board, state),
          () => new StaticSectorSolver(board, state),
          () => new SimpleSectorSolver(board, state),
        ]
      : []),

      ...(options.solveVertexState ?
        [
          () => new SafeEdgeSectorColorToVertexSolver(board, state),

          ...(options.solveEdges ?
            [
              () =>
                new VertexToEdgeSolver(board, state, {
                  solveToRed: true,
                  solveToBlack: true,
                }),
            ]
          : []),

          ...(options.solveSectors ? [() => new VertexToSectorSolver(board, state)] : []),
        ]
      : []),

      ...(options.solveFaceColors ?
        [
          // We rely on the Face colors being accurate here (should be 0-difficulty and immediately returned)
          () =>
            new SimpleFaceColorSolver(board, state, {
              solveToRed: true,
              solveToBlack: true,
            }),

          () =>
            new FaceColorParitySolver(board, state, {
              solveToRed: true,
              solveToBlack: true,
              solveColors: true,
              allowPartialReduction: true,
            }),

          () => new FaceColorDisconnectionSolver(board, state),

          ...(options.solveVertexState ? [() => new VertexToFaceColorSolver(board, state)] : []),
        ]
      : []),

      ...(options.solveFaceState ?
        [
          ...(options.solveVertexState || options.solveFaceColors ?
            [() => new VertexColorToFaceSolver(board, state)]
          : []),

          ...(options.solveEdges ?
            [
              () =>
                new FaceToEdgeSolver(board, state, {
                  solveToRed: true,
                  solveToBlack: true,
                }),
            ]
          : []),

          ...(options.solveSectors ? [() => new FaceToSectorSolver(board, state)] : []),

          ...(options.solveFaceColors ? [() => new FaceToFaceColorSolver(board, state)] : []),

          ...(options.solveVertexState ? [() => new FaceToVertexSolver(board, state)] : []),
        ]
      : []),

      ...groups.map((group) => {
        return (maxDifficulty: number) => {
          const ruleCount = group.getRuleCountWithDifficulty(Math.min(options.cutoffDifficulty, maxDifficulty));
          // console.log('size', ruleCount, 'of', group.size, 'for maxDifficulty', maxDifficulty);

          return BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, group, ruleCount);
        };
      }),
    ];

    let bestDifficulty = Number.POSITIVE_INFINITY;
    for (const solverFactory of solverFactories) {
      const solver = solverFactory(bestDifficulty);

      const action = solver.nextAction();

      solver.dispose();

      if (action) {
        const difficulty = getAnnotationDifficultyB(action.annotation);
        if (difficulty < bestDifficulty) {
          bestDifficulty = difficulty;
          this._action = action;
        }

        // Abort out if we have minimum difficulty (either "safe" actions, or something that can't be beat)
        if (bestDifficulty === 0) {
          break;
        }
      }
    }
  }

  public get dirty(): boolean {
    return this._dirty;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (this._dirty) {
      this._dirty = false;
      return this._action;
    }
    return null;
  }

  public clone(equivalentState: TState<Data>): CompositeSolver<Data, TAnnotatedAction<Data>> {
    throw new Error('unimplemented');
  }

  public dispose(): void {}
}
