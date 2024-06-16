import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from './TDelta.ts';
import { TSerializedState } from './TSerializedState.ts';

export type TState<Data> = {
  clone(): TState<Data>;
  createDelta(): TDelta<Data>;

  serializeState(board: TBoard): TSerializedState;
} & Data;
