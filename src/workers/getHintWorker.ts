// @ts-expect-error
import HintWorker from './hintWorker.ts?worker';
import { TinyProperty } from 'phet-lib/axon';

let hintWorker: Worker | null = null;

export const hintWorkerLoadedProperty = new TinyProperty(false);

export const getHintWorker = (): Worker => {
  if (!hintWorker) {
    hintWorker = new HintWorker();

    hintWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'hint-worker-loaded') {
        hintWorkerLoadedProperty.value = true;
      }
    });
  }

  return hintWorker!;
};
