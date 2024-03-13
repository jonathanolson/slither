import { serializeFaceValueData, TFaceValueData, TSerializedFaceValueData } from '../face-value/TFaceValueData.ts';
import { serializeEdgeStateData, TEdgeStateData, TSerializedEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import { serializeSimpleRegionData, TSerializedSimpleRegionData, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TAnyData } from './TAnyData.ts';
import { TSerializedState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { serializeFaceColorData, TFaceColorData, TSerializedFaceColorData } from '../face-color/TFaceColorData.ts';
import { serializeSectorStateData, TSectorStateData, TSerializedSectorStateData } from '../sector-state/TSectorStateData.ts';
import { serializeVertexStateData, TSerializedVertexStateData, TVertexStateData } from '../vertex-state/TVertexStateData.ts';

export interface TCompleteData extends TFaceValueData, TEdgeStateData, TSimpleRegionData, TFaceColorData, TSectorStateData, TVertexStateData, TAnyData {}

export interface TSerializedCompleteData extends TSerializedState {
  type: 'CompleteData';
  faceValueData: TSerializedFaceValueData;
  edgeStateData: TSerializedEdgeStateData;
  simpleRegionData: TSerializedSimpleRegionData;
  faceColorData: TSerializedFaceColorData;
  sectorStateData: TSerializedSectorStateData;
  vertexStateData: TSerializedVertexStateData;
}

export const serializeCompleteData = ( board: TBoard, data: TCompleteData ): TSerializedCompleteData => ( {
  type: 'CompleteData',
  faceValueData: serializeFaceValueData( board, data ),
  edgeStateData: serializeEdgeStateData( board, data ),
  simpleRegionData: serializeSimpleRegionData( data ),
  faceColorData: serializeFaceColorData( data ),
  sectorStateData: serializeSectorStateData( board, data ),
  vertexStateData: serializeVertexStateData( board, data )
} );
