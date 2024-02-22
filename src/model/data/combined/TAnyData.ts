import { TEmitter } from 'phet-lib/axon';

export interface TAnyData {
  anyStateChangedEmitter: TEmitter;
}

export type TAnyDataListener = () => void;
