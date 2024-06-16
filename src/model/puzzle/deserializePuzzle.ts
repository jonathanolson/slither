import { TStructure } from '../board/core/TStructure.ts';
import { deserializeBoard } from '../board/core/deserializeBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { deserializeState } from '../data/core/deserializeState.ts';
import { BasicPuzzle } from './BasicPuzzle.ts';
import { TPropertyPuzzle, TSerializedPuzzle } from './TPuzzle.ts';

export const deserializePuzzle = (serializedPuzzle: TSerializedPuzzle): TPropertyPuzzle<TStructure, TCompleteData> => {
  if (serializedPuzzle.version !== 1) {
    throw new Error(`Unsupported puzzle version: ${serializedPuzzle.version}`);
  }

  const deserializedBoard = deserializeBoard(serializedPuzzle.board);
  const deserializedState = deserializeState(deserializedBoard, serializedPuzzle.state);

  return new BasicPuzzle(deserializedBoard, deserializedState);
};
