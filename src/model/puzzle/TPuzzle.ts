import { TStructure } from '../board/core/TStructure.ts';
import { deserializeState, TSerializedState, TState } from '../data/core/TState.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { deserializeBoard, serializeBoard, TBoard, TSerializedBoard } from '../board/core/TBoard.ts';
import { TProperty } from 'phet-lib/axon';
import { BasicPuzzle } from './BasicPuzzle.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';

// TODO: parameterize over Data instead of State
export type TPuzzle<Structure extends TStructure = TStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TBoard<Structure>;
  stateProperty: TProperty<State>;
};

export interface TSerializedPuzzle {
  board: TSerializedBoard;
  state: TSerializedState;
}

export const serializePuzzle = ( puzzle: TPuzzle ): TSerializedPuzzle => ( {
  board: serializeBoard( puzzle.board ),
  state: puzzle.stateProperty.value.serializeState( puzzle.board )
} );

export const deserializePuzzle = ( serializedPuzzle: TSerializedPuzzle ): TPuzzle<TStructure, TState<TCompleteData>> => {
  const deserializedBoard = deserializeBoard( serializedPuzzle.board );
  const deserializedState = deserializeState( deserializedBoard, serializedPuzzle.state );

  return new BasicPuzzle( deserializedBoard, deserializedState );
};
