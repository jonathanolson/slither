import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { satSolve } from '../solver/SATSolver.ts';
import { MultipleSolutionsError } from '../solver/errors/MultipleSolutionsError.ts';
import { TSolvedPuzzle, getSolvedPuzzle } from './TSolvedPuzzle.ts';

import { TEmitter, TReadOnlyProperty } from 'phet-lib/axon';
import { dotRandom } from 'phet-lib/dot';

import { interruptableSleep } from '../../util/interruptableSleep.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

// TODO: what happens if we take... the "average" of greedy face minimizes?
// TODO: or, given a number of minimizes, we get an "order" of faces, from "usually can remove" to "usually can't remove"
export const greedyFaceMinimize = async <Structure extends TStructure, Data extends TCompleteData>(
  solvedPuzzle: TSolvedPuzzle<Structure, Data>,
  isEasyEnough: (board: TBoard, state: TState<Data>) => boolean = () => true,
  interruptedProperty?: TReadOnlyProperty<boolean>,
  faceProcessedEmitter?: TEmitter<[index: number, state: FaceValue]>,
): Promise<TSolvedPuzzle<Structure, Data>> => {
  const board = solvedPuzzle.board;
  const state = solvedPuzzle.cleanState.clone();

  const faceOrder: TFace[] = dotRandom.shuffle(board.faces);

  const hasMultipleSolutions = (state: TState<Data>): boolean => {
    try {
      // TODO: try to invoke our normal solver first?
      satSolve(board, state, {
        maxIterations: 10000,
        failOnMultipleSolutions: true,
      });
      return false;
    } catch (e) {
      if (e instanceof MultipleSolutionsError) {
        return true;
      } else {
        throw e;
      }
    }
  };

  assertEnabled() && assert(!hasMultipleSolutions(state), 'Initial state has multiple solutions');
  // TODO: consider getting rid of the defensive copy
  assertEnabled() && assert(isEasyEnough(board, state.clone()), 'Initial state is not easy enough');

  for (const face of faceOrder) {
    interruptedProperty && (await interruptableSleep(0, interruptedProperty));

    const previousValue = state.getFaceValue(face);

    if (previousValue === null) {
      faceProcessedEmitter && faceProcessedEmitter.emit(board.faces.indexOf(face), null);
      continue;
    }

    const delta = state.createDelta();

    delta.setFaceValue(face, null);

    // TODO: consider getting rid of the defensive copy
    if (!hasMultipleSolutions(delta) && isEasyEnough(board, delta.clone())) {
      delta.apply(state);
      faceProcessedEmitter && faceProcessedEmitter.emit(board.faces.indexOf(face), null);
    } else {
      faceProcessedEmitter && faceProcessedEmitter.emit(board.faces.indexOf(face), previousValue);
    }
  }

  return getSolvedPuzzle(solvedPuzzle.board, state, solvedPuzzle.blackEdges);
};
