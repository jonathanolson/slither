import { TBoard } from '../../board/core/TBoard.ts';
import { TSerializedState } from './TSerializedState.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { CompleteData } from '../combined/CompleteData.ts';
import { GeneralFaceValueData } from '../face-value/GeneralFaceValueData.ts';
import { GeneralEdgeStateData } from '../edge-state/GeneralEdgeStateData.ts';
import { GeneralSimpleRegionData } from '../simple-region/GeneralSimpleRegionData.ts';
import { TState } from './TState.ts';

export const deserializeState = ( board: TBoard, serializedState: TSerializedState ): TState<TCompleteData> => {
  const type = serializedState.type;

  if ( type === 'CompleteData' ) {
    return CompleteData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  else if ( type === 'FaceValueData' ) {
    return GeneralFaceValueData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  else if ( type === 'EdgeData' ) {
    return GeneralEdgeStateData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  // TODO: can we leave this out, and reconstruct it from the other data?
  else if ( type === 'SimpleRegionData' ) {
    return GeneralSimpleRegionData.deserializeState( board, serializedState ) as unknown as TState<TCompleteData>;
  }
  else {
    throw new Error( `Unknown action type: ${type}, could not deserialize` );
  }
};