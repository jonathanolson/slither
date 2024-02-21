import { TState } from './TState.ts';
import { TAction } from './TAction.ts';

export type TDelta<Data> = {
  // Refine the clone from a TState => TDelta
  clone(): TDelta<Data>;

  // TODO: we need a way of creating state here
} & TState<Data> & TAction<Data>;
