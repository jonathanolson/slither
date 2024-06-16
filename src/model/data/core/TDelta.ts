import { TAction } from './TAction.ts';
import { TState } from './TState.ts';

export type TDelta<Data> = {
  // Refine the clone from a TState => TDelta
  clone(): TDelta<Data>;

  // TODO: we need a way of creating state here
} & TState<Data> &
  TAction<Data>;
