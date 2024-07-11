import { TStructure } from '../board/core/TStructure.ts';
import { serializeBoard } from '../board/core/serializeBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TSolvedPuzzle } from '../generator/TSolvedPuzzle.ts';
import { estimateDifficulty } from '../generator/estimateDifficulty.ts';
import { TSerializedRatedPuzzle } from './TSerializedRatedPuzzle.ts';
import { serializeFaceData } from './serializeFaceState.ts';

export const getSerializedRatedPuzzle = <Structure extends TStructure, Data extends TCompleteData>(
  solvedPuzzle: TSolvedPuzzle<Structure, Data>,
): TSerializedRatedPuzzle => {
  const edgeColorSectorDifficulty = estimateDifficulty(solvedPuzzle.board, solvedPuzzle.cleanState, {
    solveEdges: true,
    solveSectors: true,
    solveFaceColors: true,
    solveVertexState: false,
    solveFaceState: false,
    cutoffDifficulty: Number.POSITIVE_INFINITY,
  });

  const edgeColorDifficulty =
    isFinite(edgeColorSectorDifficulty) ?
      estimateDifficulty(solvedPuzzle.board, solvedPuzzle.cleanState, {
        solveEdges: true,
        solveSectors: false,
        solveFaceColors: true,
        solveVertexState: false,
        solveFaceState: false,
        cutoffDifficulty: Number.POSITIVE_INFINITY,
      })
    : Number.POSITIVE_INFINITY;

  const edgeDifficulty =
    isFinite(edgeColorDifficulty) ?
      estimateDifficulty(solvedPuzzle.board, solvedPuzzle.cleanState, {
        solveEdges: true,
        solveSectors: false,
        solveFaceColors: false,
        solveVertexState: false,
        solveFaceState: false,
        cutoffDifficulty: Number.POSITIVE_INFINITY,
      })
    : Number.POSITIVE_INFINITY;

  return {
    board: serializeBoard(solvedPuzzle.board),
    faceData: serializeFaceData(solvedPuzzle.board, solvedPuzzle.cleanState),
    edgeDifficulty,
    edgeColorDifficulty,
    edgeColorSectorDifficulty,
  };
};
