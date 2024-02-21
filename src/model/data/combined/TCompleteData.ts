import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';

export interface TCompleteData extends TFaceData, TEdgeData, TSimpleRegionData {}