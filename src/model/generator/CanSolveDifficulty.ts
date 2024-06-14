import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { LocalStorageEnumerationProperty } from '../../util/localStorage.ts';
import { iterateSolverFactory } from '../solver/TSolver.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { standardSolverFactory } from '../solver/standardSolverFactory.ts';

export default class CanSolveDifficulty extends EnumerationValue {
  public constructor(public readonly canSolve: (board: TBoard, state: TState<TCompleteData>) => boolean) {
    super();
  }

  public static readonly STANDARD = new CanSolveDifficulty((board, state) => {
    // be paranoid
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
