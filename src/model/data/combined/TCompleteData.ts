import { TBoard } from '../../board/core/TBoard.ts';
import { TSerializedState } from '../core/TSerializedState.ts';
import { TEdgeStateData, TSerializedEdgeStateData, serializeEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import { TFaceColorData, TSerializedFaceColorData, serializeFaceColorData } from '../face-color/TFaceColorData.ts';
import { TFaceStateData, TSerializedFaceStateData, serializeFaceStateData } from '../face-state/TFaceStateData.ts';
import { TFaceValueData, TSerializedFaceValueData, serializeFaceValueData } from '../face-value/TFaceValueData.ts';
import {
  TSectorStateData,
  TSerializedSectorStateData,
  serializeSectorStateData,
} from '../sector-state/TSectorStateData.ts';
import {
  TSerializedSimpleRegionData,
  TSimpleRegionData,
  serializeSimpleRegionData,
} from '../simple-region/TSimpleRegionData.ts';
import {
  TSerializedVertexStateData,
  TVertexStateData,
  serializeVertexStateData,
} from '../vertex-state/TVertexStateData.ts';
import { TAnyData } from './TAnyData.ts';

export interface TCompleteData
  extends TFaceValueData,
    TEdgeStateData,
    TSimpleRegionData,
    TFaceColorData,
    TSectorStateData,
    TVertexStateData,
    TFaceStateData,
    TAnyData {}

export interface TSerializedCompleteData extends TSerializedState {
  type: 'CompleteData';
  faceValueData: TSerializedFaceValueData;
  edgeStateData: TSerializedEdgeStateData;
  simpleRegionData: TSerializedSimpleRegionData;
  faceColorData: TSerializedFaceColorData;
  sectorStateData: TSerializedSectorStateData;
  vertexStateData: TSerializedVertexStateData;
  faceStateData: TSerializedFaceStateData;
}

export const serializeCompleteData = (board: TBoard, data: TCompleteData): TSerializedCompleteData => ({
  type: 'CompleteData',
  faceValueData: serializeFaceValueData(board, data),
  edgeStateData: serializeEdgeStateData(board, data),
  simpleRegionData: serializeSimpleRegionData(data),
  faceColorData: serializeFaceColorData(data),
  sectorStateData: serializeSectorStateData(board, data),
  vertexStateData: serializeVertexStateData(board, data),
  faceStateData: serializeFaceStateData(board, data),
});
