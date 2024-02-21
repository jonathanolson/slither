import { TStructure } from '../board/core/TStructure.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TReadOnlyProperty } from 'phet-lib/axon';

export type TReadOnlyPuzzle<Structure extends TStructure = TStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TBoard<Structure>;
  stateProperty: TReadOnlyProperty<State>;
};
