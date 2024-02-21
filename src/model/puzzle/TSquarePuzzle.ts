import { TSquareStructure } from '../board/square/TSquareStructure.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { TSquareBoard } from '../board/square/TSquareBoard.ts';
import { TProperty } from 'phet-lib/axon';

export type TSquarePuzzle<Structure extends TSquareStructure = TSquareStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TSquareBoard<Structure>;
  stateProperty: TProperty<State>;
};