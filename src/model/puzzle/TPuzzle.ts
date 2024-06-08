import { TStructure } from '../board/core/TStructure.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TProperty } from 'phet-lib/axon';
import { TSolvedPuzzle } from '../generator/TSolvedPuzzle.ts';
import { TSerializedBoard } from '../board/core/TSerializedBoard.ts';
import { TSerializedState } from '../data/core/TSerializedState.ts';

export type TPuzzle<Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData> = {
  board: TBoard<Structure>;
  state: TState<Data>;
};

export type TPropertyPuzzle<Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData> = {
  board: TBoard<Structure>;
  stateProperty: TProperty<TState<Data>>;
};

export type TSolvablePropertyPuzzle<Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData> = {
  solution: TSolvedPuzzle<Structure, Data>;
} & TPropertyPuzzle<Structure, Data>;

export interface TSerializedPuzzle {
  version: number;
  board: TSerializedBoard;
  state: TSerializedState;
}

export type TSerializedSolvablePuzzle = {
  puzzle: TSerializedPuzzle;
  cleanState: TSerializedState;
  solvedState: TSerializedState;
  blackEdges: number[];
};

