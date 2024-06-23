// @ts-expect-error
import GenerationAdditiveConstrainedWorker from './generationAdditiveConstrainedWorker.ts?worker';

import { TEmitter, TReadOnlyProperty, TinyProperty } from 'phet-lib/axon';

import { TBoard } from '../model/board/core/TBoard.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { serializeBoard } from '../model/board/core/serializeBoard.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import FaceValue from '../model/data/face-value/FaceValue.ts';
import CanSolveDifficulty from '../model/generator/CanSolveDifficulty.ts';
import { TSerializedSolvedPuzzle, TSolvedPuzzle } from '../model/generator/TSolvedPuzzle.ts';
import { deserializeSolvedPuzzle } from '../model/generator/deserializeSolvedPuzzle.ts';

let generationAdditiveConstrainedWorker: Worker | null = null;

export const generationAdditiveConstrainedWorkerLoadedProperty = new TinyProperty(false);

export const getGenerationAdditiveConstrainedWorker = (): Worker => {
  if (!generationAdditiveConstrainedWorker) {
    generationAdditiveConstrainedWorker = new GenerationAdditiveConstrainedWorker();

    generationAdditiveConstrainedWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'generation-additive-constrained-worker-loaded') {
        generationAdditiveConstrainedWorkerLoadedProperty.value = true;
      }
    });
  }

  return generationAdditiveConstrainedWorker!;
};

// Load on startup (for now)
getGenerationAdditiveConstrainedWorker();

export const generateAdditiveConstrainedWithWorker = async (
  board: TBoard,
  canSolveDifficulty: CanSolveDifficulty,
  interruptedProperty: TReadOnlyProperty<boolean>,
  faceDefineEmitter: TEmitter<[index: number, state: FaceValue]>,
  faceMinimizeEmitter: TEmitter<[index: number, state: FaceValue]>,
  faceResetEmitter: TEmitter,
): Promise<TSolvedPuzzle<TStructure, TCompleteData> | null> => {
  return new Promise((resolve, reject) => {
    const worker = getGenerationAdditiveConstrainedWorker();

    const id = Math.random();

    worker.postMessage({
      type: 'generation-additive-constrained-request',
      id: id,
      board: serializeBoard(board),
      canSolveDifficulty: canSolveDifficulty.name,
    });

    const cleanup = () => {
      interruptedProperty.unlink(interruptedListener);
      worker.removeEventListener('message', generationListener);
    };

    const interruptedListener = (interrupted: boolean) => {
      if (interrupted) {
        worker.postMessage({
          type: 'generation-additive-constrained-interrupt',
          id: id,
        });
        cleanup();
        resolve(null);
      }
    };

    // TODO: fix up the message type, is a union
    const generationListener = (
      event: MessageEvent<{
        type: string;
        id: number;
        solvedPuzzle: TSerializedSolvedPuzzle | null;
        index: number;
        faceValue: FaceValue;
      }>,
    ) => {
      if (event.data.id === id) {
        if (event.data.type === 'generation-additive-constrained-response') {
          const result = event.data.solvedPuzzle ? deserializeSolvedPuzzle(event.data.solvedPuzzle) : null;

          cleanup();
          resolve(result);
        } else if (event.data.type === 'generation-additive-constrained-face-define') {
          faceDefineEmitter.emit(event.data.index, event.data.faceValue);
        } else if (event.data.type === 'generation-additive-constrained-face-minimize') {
          faceMinimizeEmitter.emit(event.data.index, event.data.faceValue);
        } else if (event.data.type === 'generation-additive-constrained-face-reset') {
          faceResetEmitter.emit();
        }
      }
    };
    interruptedProperty.lazyLink(interruptedListener);
    worker.addEventListener('message', generationListener);
  });
};
