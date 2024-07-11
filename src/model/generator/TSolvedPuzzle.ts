import { TBoard } from '../board/core/TBoard.ts';
import { TSerializedBoard } from '../board/core/TSerializedBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TSerializedState } from '../data/core/TSerializedState.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';

export interface TSolvedPuzzle<Structure extends TStructure, Data extends TFaceValueData> {
  board: TBoard<Structure>;
  cleanState: TState<Data>;

  solvedState: TState<Data>;
  blackEdges: Set<Structure['Edge']>;
}

export interface TSerializedSolvedPuzzle {
  board: TSerializedBoard;
  cleanState: TSerializedState;
  solvedState: TSerializedState;
  blackEdges: number[];
}
