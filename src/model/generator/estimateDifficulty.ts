import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { getAnnotationDifficultyB } from '../data/core/TAnnotation.ts';
import { TState } from '../data/core/TState.ts';
import { simpleRegionIsSolved } from '../data/simple-region/TSimpleRegionData.ts';
import { DifficultySolver, DifficultySolverOptions } from '../solver/DifficultySolver.ts';

export const estimateDifficulty = (
  board: TBoard,
  state: TState<TCompleteData>,
  options: DifficultySolverOptions,
): number => {
  state = state.clone();

  let totalDifficulty = 0;
  let totalActions = 0;

  const getFinalDifficulty = () => {
    return Math.log(totalDifficulty / Math.sqrt(totalActions) + 1);
  };

  while (true) {
    if (getFinalDifficulty() > options.cutoffDifficulty) {
      return Number.POSITIVE_INFINITY;
    }

    const solver = new DifficultySolver(board, state, options);

    const action = solver.nextAction();

    solver.dispose();

    if (action) {
      action.apply(state);

      const difficulty = getAnnotationDifficultyB(action.annotation);
      console.log('difficulty', difficulty, action.annotation.type);
      if (difficulty > 0) {
        totalDifficulty += Math.exp(difficulty) - 1;
        totalActions += 1;
      }
    } else {
      break;
    }

    if (simpleRegionIsSolved(state)) {
      break;
    }
  }

  if (!simpleRegionIsSolved(state)) {
    return Number.POSITIVE_INFINITY;
  } else {
    return getFinalDifficulty();
  }
};
