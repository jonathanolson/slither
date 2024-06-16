import { sleep } from './sleep.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';

import SlitherQueryParameters from '../SlitherQueryParameters.ts';

import { InterruptedError } from '../model/solver/errors/InterruptedError.ts';


export const interruptableSleep = async function (
  milliseconds: number,
  interruptedProperty: TReadOnlyProperty<boolean>,
) {
  await sleep(milliseconds);
  SlitherQueryParameters.debugSleep && console.log('after sleep before interrupt check');

  if (interruptedProperty.value) {
    throw new InterruptedError();
  }
};
