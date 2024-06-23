import { sleep } from './sleep.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';

import { InterruptedError } from '../model/solver/errors/InterruptedError.ts';

const debugSleep = false;

export const interruptableSleep = async function (
  milliseconds: number,
  interruptedProperty: TReadOnlyProperty<boolean>,
) {
  await sleep(milliseconds);
  debugSleep && console.log('after sleep before interrupt check');

  if (interruptedProperty.value) {
    throw new InterruptedError();
  }
};
