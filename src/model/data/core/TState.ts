import { TDelta } from './TDelta.ts';

export type TState<Data> = {
  clone(): TState<Data>;
  createDelta(): TDelta<Data>;
} & Data;
