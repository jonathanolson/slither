// @ts-expect-error
import HintWorker from './hintWorker.ts?worker';

let hintWorker: Worker | null = null;

export const getHintWorker = (): Worker => {
  if ( !hintWorker ) {
    hintWorker = new HintWorker();
  }

  return hintWorker!;
};