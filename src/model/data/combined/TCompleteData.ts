import { serializeFaceData, TFaceData, TSerializedFaceData } from '../face/TFaceData.ts';
import { serializeEdgeData, TEdgeData, TSerializedEdgeData } from '../edge/TEdgeData.ts';
import { serializeSimpleRegionData, TSerializedSimpleRegionData, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TAnyData } from './TAnyData.ts';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeFaceColorData, TFaceColorData, TSerializedFaceColorData } from '../face-color/TFaceColorData.ts';

export interface TCompleteData extends TFaceData, TEdgeData, TSimpleRegionData, TFaceColorData, TAnyData {}

export interface TSerializedCompleteData extends TSerializedState {
  type: 'CompleteData';
  faceData: TSerializedFaceData;
  edgeData: TSerializedEdgeData;
  simpleRegionData: TSerializedSimpleRegionData;
  faceColorData: TSerializedFaceColorData;
}

export const serializeCompleteData = ( board: TBoard, data: TCompleteData ): TSerializedCompleteData => ( {
  type: 'CompleteData',
  faceData: serializeFaceData( board, data ),
  edgeData: serializeEdgeData( board, data ),
  simpleRegionData: serializeSimpleRegionData( data ),
  faceColorData: serializeFaceColorData( data )
} );
