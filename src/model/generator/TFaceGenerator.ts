import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';

export type TFaceGenerator<Structure extends TStructure, Data extends TFaceValueData> = (
  board: TBoard<Structure>,
) => TState<Data>;
