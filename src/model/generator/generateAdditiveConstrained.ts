import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { InterruptedError } from '../solver/errors/InterruptedError.ts';
import CanSolveDifficulty from './CanSolveDifficulty.ts';
import { TSolvedPuzzle } from './TSolvedPuzzle.ts';
import { generateFaceAdditive } from './generateFaceAdditive.ts';
import { greedyFaceMinimize } from './greedyFaceMinimize.ts';
import { withAllFacesFilled } from './withAllFacesFilled.ts';

import { TEmitter, TReadOnlyProperty } from 'phet-lib/axon';

import { interruptableSleep } from '../../util/interruptableSleep.ts';

export const generateAdditiveConstrained = async (
  board: TBoard,
  canSolveDifficulty: CanSolveDifficulty,
  interruptedProperty: TReadOnlyProperty<boolean>,
  faceDefineEmitter: TEmitter<[index: number, state: FaceValue]>,
  faceMinimizeEmitter: TEmitter<[index: number, state: FaceValue]>,
  faceResetEmitter: TEmitter,
): Promise<TSolvedPuzzle<TStructure, TCompleteData> | null> => {
  try {
    const canSolve = canSolveDifficulty.canSolve;

    const getUniquePuzzle = async () => {
      return await generateFaceAdditive(board, interruptedProperty, faceDefineEmitter);
    };

    const getMinimizablePuzzle = async () => {
      let uniquePuzzle = await getUniquePuzzle();

      if (canSolveDifficulty === CanSolveDifficulty.NO_LIMIT) {
        return uniquePuzzle;
      } else {
        // TODO: should we do this on everything? probably not, because it ... doesn't change the distribution? BUT might make it harder?

        const blankFaces = board.faces.filter((face) => uniquePuzzle.cleanState.getFaceValue(face) === null);
        const minimizablePuzzle = withAllFacesFilled(uniquePuzzle);
        blankFaces.forEach((face) => {
          faceDefineEmitter.emit(board.faces.indexOf(face), minimizablePuzzle.cleanState.getFaceValue(face));
        });
        return minimizablePuzzle;
      }
    };

    let minimizablePuzzle = await getMinimizablePuzzle();
    while (
      // Don't allow the "fully full" state, e.g. 4 in square, since it will be boring trivial puzzles, and for
      // https://github.com/jonathanolson/slither/issues/2
      minimizablePuzzle.board.faces.some(
        (face) => minimizablePuzzle.solvedState.getFaceValue(face) === face.edges.length,
      ) ||
      !canSolve(minimizablePuzzle.board, minimizablePuzzle.cleanState.clone())
    ) {
      faceResetEmitter.emit();
      minimizablePuzzle = await getMinimizablePuzzle();
    }

    const minimizedPuzzle = await greedyFaceMinimize(
      minimizablePuzzle,
      canSolve,
      interruptedProperty,
      faceMinimizeEmitter,
    );

    // Maybe... let it complete on the screen before we do complicated time consuming things
    interruptableSleep(17, interruptedProperty);

    // console.log(
    //   'total difficulty',
    //   estimateDifficulty(minimizedPuzzle.board, minimizedPuzzle.cleanState, {
    //     solveEdges: true,
    //     solveSectors: true,
    //     solveFaceColors: true,
    //     solveVertexState: true,
    //     solveFaceState: true,
    //     cutoffDifficulty: Number.POSITIVE_INFINITY,
    //   }),
    // );

    return minimizedPuzzle;
  } catch (e) {
    if (e instanceof InterruptedError) {
      // do nothing, we got interrupted and that's fine. Handled elsewhere
      return null;
    } else {
      throw e;
    }
  }
};
