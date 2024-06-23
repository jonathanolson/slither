import { TinyEmitter, TinyProperty } from 'phet-lib/axon';

import { deserializeBoard } from '../model/board/core/deserializeBoard.ts';
import FaceValue from '../model/data/face-value/FaceValue.ts';
import CanSolveDifficulty from '../model/generator/CanSolveDifficulty.ts';
import { generateAdditiveConstrained } from '../model/generator/generateAdditiveConstrained.ts';
import { serializeSolvedPuzzle } from '../model/generator/serializeSolvedPuzzle.ts';

// TODO: also see web worker cases where this is used
// TODO: factor out
// @ts-expect-error
if (window.assertions && !import.meta.env.PROD) {
  // TODO: We should actually... have stripped these, something is going wrong
  console.log('enabling generationAdditiveConstrainedWorker assertions');
  // @ts-expect-error
  window.assertions.enableAssert();
}

self.postMessage({
  type: 'generation-additive-constrained-worker-loaded',
});

const interruptionPropertyMap = new Map<number, TinyProperty<boolean>>();

self.addEventListener('message', async (event) => {
  const data = event.data;

  if (data.type === 'generation-additive-constrained-request') {
    const interruptedProperty = new TinyProperty(false);
    const faceDefineEmitter = new TinyEmitter<[index: number, state: FaceValue]>();
    const faceMinimizeEmitter = new TinyEmitter<[index: number, state: FaceValue]>();
    const faceResetEmitter = new TinyEmitter();

    const id = data.id;

    faceDefineEmitter.addListener((index, faceValue) => {
      self.postMessage({
        type: 'generation-additive-constrained-face-define',
        id: id,
        index: index,
        faceValue: faceValue,
      });
    });
    faceMinimizeEmitter.addListener((index, faceValue) => {
      self.postMessage({
        type: 'generation-additive-constrained-face-minimize',
        id: id,
        index: index,
        faceValue: faceValue,
      });
    });
    faceResetEmitter.addListener(() => {
      self.postMessage({
        type: 'generation-additive-constrained-face-reset',
        id: id,
      });
    });

    try {
      const board = deserializeBoard(data.board);
      const canSolveDifficulty = CanSolveDifficulty.enumeration.getValue(data.canSolveDifficulty);

      interruptionPropertyMap.set(id, interruptedProperty);

      const result = await generateAdditiveConstrained(
        board,
        canSolveDifficulty,
        interruptedProperty,
        faceDefineEmitter,
        faceMinimizeEmitter,
        faceResetEmitter,
      );

      self.postMessage({
        type: 'generation-additive-constrained-response',
        id: id,
        solvedPuzzle: result ? serializeSolvedPuzzle(result) : null,
      });
    } catch (e) {
      // If we encounter a failure, send back a null
      self.postMessage({
        type: 'generation-additive-constrained-response',
        id: id,
        solvedPuzzle: null,
      });
    }

    interruptionPropertyMap.delete(id);
  } else if (data.type === 'generation-additive-constrained-interrupt') {
    const id = data.id;
    const interruptedProperty = interruptionPropertyMap.get(id);
    if (interruptedProperty) {
      interruptedProperty.value = true;
    }
  }
});
