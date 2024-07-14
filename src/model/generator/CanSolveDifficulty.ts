import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { generalAllMixedGroup } from '../pattern/collection/generalAllMixedGroup.ts';
import { generalEdgeColorMixedGroup } from '../pattern/collection/generalEdgeColorMixedGroup.ts';
import { generalEdgeMixedGroup } from '../pattern/collection/generalEdgeMixedGroup.ts';
import { generalEdgeSectorMixedGroup } from '../pattern/collection/generalEdgeSectorMixedGroup.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { BinaryPatternSolver } from '../solver/BinaryPatternSolver.ts';
import { CompositeSolver } from '../solver/CompositeSolver.ts';
import { FaceColorDisconnectionSolver } from '../solver/FaceColorDisconnectionSolver.ts';
import { SafeEdgeToFaceColorSolver } from '../solver/SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from '../solver/SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from '../solver/SafeSolvedEdgeSolver.ts';
import { SimpleFaceSolver } from '../solver/SimpleFaceSolver.ts';
import { SimpleLoopSolver } from '../solver/SimpleLoopSolver.ts';
import { SimpleVertexSolver } from '../solver/SimpleVertexSolver.ts';
import { iterateSolverFactory } from '../solver/TSolver.ts';
import { standardSolverFactory } from '../solver/standardSolverFactory.ts';

import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

export default class CanSolveDifficulty extends EnumerationValue {
  public constructor(public readonly canSolve: (board: TBoard, state: TState<TCompleteData>) => boolean) {
    super();
  }

  public static readonly EASY = new CanSolveDifficulty((board, state) => {
    state = state.clone();

    iterateSolverFactory(
      (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
        const boardPatternBoard = BoardPatternBoard.get(board);

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

          new SimpleLoopSolver(board, state, {
            solveToRed: true,
            solveToBlack: true,
            resolveAllRegions: false, // NOTE: this will be faster
          }),

          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeMixedGroup, 120),
        ]);
      },
      board,
      state,
      true,
    );

    return simpleRegionIsSolved(state);
  });

  public static readonly MEDIUM = new CanSolveDifficulty((board, state) => {
    state = state.clone();

    iterateSolverFactory(
      (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
        const boardPatternBoard = BoardPatternBoard.get(board);

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

          new SimpleLoopSolver(board, state, {
            solveToRed: true,
            solveToBlack: true,
            resolveAllRegions: false, // NOTE: this will be faster
          }),

          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeSectorMixedGroup, 50),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeMixedGroup, 360),
        ]);
      },
      board,
      state,
      true,
    );

    return simpleRegionIsSolved(state);
  });

  public static readonly HARD = new CanSolveDifficulty((board, state) => {
    state = state.clone();

    iterateSolverFactory(
      (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
        const boardPatternBoard = BoardPatternBoard.get(board);

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

          new SimpleLoopSolver(board, state, {
            solveToRed: true,
            solveToBlack: true,
            resolveAllRegions: false, // NOTE: this will be faster
          }),

          standardSolverFactory(board, state, dirty),

          new FaceColorDisconnectionSolver(board, state),

          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeColorMixedGroup, 600),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeSectorMixedGroup, 100),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeMixedGroup, 1000),
        ]);
      },
      board,
      state,
      true,
    );

    return simpleRegionIsSolved(state);
  });

  public static readonly VERY_HARD = new CanSolveDifficulty((board, state) => {
    state = state.clone();

    iterateSolverFactory(
      (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
        const boardPatternBoard = BoardPatternBoard.get(board);

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

          new SimpleLoopSolver(board, state, {
            solveToRed: true,
            solveToBlack: true,
            resolveAllRegions: false, // NOTE: this will be faster
          }),

          standardSolverFactory(board, state, dirty),

          new FaceColorDisconnectionSolver(board, state),

          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalAllMixedGroup, 1000),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeColorMixedGroup, 2000),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeSectorMixedGroup, 1000),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeMixedGroup, 3000),
        ]);
      },
      board,
      state,
      true,
    );

    return simpleRegionIsSolved(state);
  });

  public static readonly FULL = new CanSolveDifficulty((board, state) => {
    state = state.clone();

    iterateSolverFactory(
      (board: TBoard, state: TState<TCompleteData>, dirty?: boolean) => {
        const boardPatternBoard = BoardPatternBoard.get(board);

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

          new SimpleLoopSolver(board, state, {
            solveToRed: true,
            solveToBlack: true,
            resolveAllRegions: false, // NOTE: this will be faster
          }),

          standardSolverFactory(board, state, dirty),

          new FaceColorDisconnectionSolver(board, state),

          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalAllMixedGroup),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeColorMixedGroup),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeSectorMixedGroup),
          BinaryPatternSolver.fromGroup(board, boardPatternBoard, state, generalEdgeMixedGroup),
        ]);
      },
      board,
      state,
      true,
    );

    return simpleRegionIsSolved(state);
  });

  public static readonly NO_LIMIT = new CanSolveDifficulty(() => true);

  public static readonly enumeration = new Enumeration(CanSolveDifficulty);
}
