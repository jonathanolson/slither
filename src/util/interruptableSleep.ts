import { TReadOnlyProperty } from 'phet-lib/axon';
import { sleep } from './sleep.ts';
import { InterruptedError } from '../model/solver/EdgeBacktracker.ts';

export const interruptableSleep = async function(
  milliseconds: number,
  interruptedProperty: TReadOnlyProperty<boolean>
) {
  await sleep( milliseconds );
  console.log( 'after sleep before interrupt check' );

  if ( interruptedProperty.value ) {
    throw new InterruptedError();
  }
};
