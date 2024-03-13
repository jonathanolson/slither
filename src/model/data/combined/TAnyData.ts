import { TEmitter } from 'phet-lib/axon';

export interface TAnyData {
  anyStateChangedEmitter: TEmitter;
}

export type TAnyStateListener = () => void;
