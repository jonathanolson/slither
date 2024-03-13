import { TDelta } from './TDelta.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { GeneralFaceValueData } from '../face-value/GeneralFaceValueData.ts';
import { GeneralEdgeData } from '../edge/GeneralEdgeData.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { GeneralSimpleRegionData } from '../simple-region/GeneralSimpleRegionData.ts';
import { CompleteData } from '../combined/CompleteData.ts';

export type TState<Data> = {
  clone(): TState<Data>;
  createDelta(): TDelta<Data>;

  serializeState( board: TBoard ): TSerializedState;
} & Data;

export type TSerializedState = {
  type: string;
} & any;

// TODO: shore up typing with TState and TAction, they have diverged
export const deserializeState = ( board: TBoard, serializedState: TSerializedState ): TState<TCompleteData> => {
  const type = serializedState.type;

  if ( type === 'CompleteData' ) {
    return CompleteData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  else if ( type === 'FaceValueData' ) {
    return GeneralFaceValueData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  else if ( type === 'EdgeData' ) {
    return GeneralEdgeData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  // TODO: can we leave this out, and reconstruct it from the other data?
  else if ( type === 'SimpleRegionData' ) {
    return GeneralSimpleRegionData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  else {
    throw new Error( `Unknown action type: ${type}, could not deserialize` );
  }
};
