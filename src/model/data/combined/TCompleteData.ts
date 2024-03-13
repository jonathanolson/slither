import { serializeFaceValueData, TFaceValueData, TSerializedFaceValueData } from '../face-value/TFaceValueData.ts';
import { serializeEdgeData, TEdgeData, TSerializedEdgeData } from '../edge/TEdgeData.ts';
import { serializeSimpleRegionData, TSerializedSimpleRegionData, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TAnyData } from './TAnyData.ts';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeFaceColorData, TFaceColorData, TSerializedFaceColorData } from '../face-color/TFaceColorData.ts';
import { serializeSectorData, TSectorData, TSerializedSectorData } from '../sector/TSectorData.ts';
import { serializeVertexData, TSerializedVertexData, TVertexData } from '../vertex/TVertexData.ts';

export interface TCompleteData extends TFaceValueData, TEdgeData, TSimpleRegionData, TFaceColorData, TSectorData, TVertexData, TAnyData {}

export interface TSerializedCompleteData extends TSerializedState {
  type: 'CompleteData';
  faceData: TSerializedFaceValueData;
  edgeData: TSerializedEdgeData;
  simpleRegionData: TSerializedSimpleRegionData;
  faceColorData: TSerializedFaceColorData;
  sectorData: TSerializedSectorData;
  vertexData: TSerializedVertexData;
}

export const serializeCompleteData = ( board: TBoard, data: TCompleteData ): TSerializedCompleteData => ( {
  type: 'CompleteData',
  faceData: serializeFaceValueData( board, data ),
  edgeData: serializeEdgeData( board, data ),
  simpleRegionData: serializeSimpleRegionData( data ),
  faceColorData: serializeFaceColorData( data ),
  sectorData: serializeSectorData( board, data ),
  vertexData: serializeVertexData( board, data )
} );
