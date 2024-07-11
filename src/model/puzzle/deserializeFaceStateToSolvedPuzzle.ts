import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { CompleteData } from '../data/combined/CompleteData.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TSolvedPuzzle } from '../generator/TSolvedPuzzle.ts';
import { getSolvablePropertyPuzzle } from '../solver/SATSolver.ts';
import { TSerializedFaceData } from './TSerializedFaceData.ts';

export const deserializeFaceStateToSolvedPuzzle = (
  board: TBoard,
  serializedFaceData: TSerializedFaceData,
): TSolvedPuzzle<TStructure, TCompleteData> | null => {
  const state = CompleteData.empty(board);

  for (let i = 0; i < serializedFaceData.length; i++) {
    const face = board.faces[i];
    const value = serializedFaceData[i];

    if (value === '.') {
      state.setFaceValue(face, null);
    } else {
      state.setFaceValue(face, parseInt(value, 10));
    }
  }

  return getSolvablePropertyPuzzle(board, state)?.solution || null;
};
