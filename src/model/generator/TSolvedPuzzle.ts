import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { TState } from '../data/core/TState.ts';

export interface TSolvedPuzzle<Structure extends TStructure, Data extends TFaceData> {
  board: TBoard<Structure>;
  state: TState<Data>;
  blackEdges: Set<Structure[ 'Edge' ]>;
}
