import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { generalEdgeMixedGroup } from '../pattern/collection/generalEdgeMixedGroup.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { BinaryPatternSolver } from '../solver/BinaryPatternSolver.ts';
import { CompositeSolver } from '../solver/CompositeSolver.ts';
import { SafeEdgeToFaceColorSolver } from '../solver/SafeEdgeToFaceColorSolver.ts';
import { SafeEdgeToSimpleRegionSolver } from '../solver/SafeEdgeToSimpleRegionSolver.ts';
import { SafeSolvedEdgeSolver } from '../solver/SafeSolvedEdgeSolver.ts';
import { SimpleLoopSolver } from '../solver/SimpleLoopSolver.ts';
import { iterateSolverFactory } from '../solver/TSolver.ts';
import { standardSolverFactory } from '../solver/standardSolverFactory.ts';

import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

import { LocalStorageEnumerationProperty } from '../../util/localStorage.ts';

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

  public static readonly STANDARD = new CanSolveDifficulty((board, state) => {
    state = state.clone();

    iterateSolverFactory(standardSolverFactory, board, state, true);

    return simpleRegionIsSolved(state);
  });

  public static readonly NO_LIMIT = new CanSolveDifficulty(() => true);

  public static readonly enumeration = new Enumeration(CanSolveDifficulty);
}

export const canSolveDifficultyProperty = new LocalStorageEnumerationProperty(
  'canSolveDifficulty',
  CanSolveDifficulty.STANDARD,
);
