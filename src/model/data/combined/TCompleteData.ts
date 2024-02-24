import { serializeFaceData, TFaceData, TSerializedFaceData } from '../face/TFaceData.ts';
import { serializeEdgeData, TEdgeData, TSerializedEdgeData } from '../edge/TEdgeData.ts';
import { serializeSimpleRegionData, TSerializedSimpleRegionData, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TAnyData } from './TAnyData.ts';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export interface TCompleteData extends TFaceData, TEdgeData, TSimpleRegionData, TAnyData {}

export interface TSerializedCompleteData extends TSerializedState {
  type: 'CompleteData';
  faceData: TSerializedFaceData;
  edgeData: TSerializedEdgeData;
  simpleRegionData: TSerializedSimpleRegionData;
}

export const serializeCompleteData = ( board: TBoard, edgeData: TCompleteData ): TSerializedCompleteData => ( {
  type: 'CompleteData',
  faceData: serializeFaceData( board, edgeData ),
  edgeData: serializeEdgeData( board, edgeData ),
  simpleRegionData: serializeSimpleRegionData( edgeData )
} );
