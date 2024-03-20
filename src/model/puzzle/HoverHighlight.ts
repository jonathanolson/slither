import { TSimpleRegion } from '../data/simple-region/TSimpleRegionData.ts';
import { TEdge } from '../board/core/TEdge.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TFaceColor } from '../data/face-color/TFaceColorData.ts';
import { TFace } from '../board/core/TFace.ts';
import { TSector } from '../data/sector-state/TSector.ts';

export type HoverHighlight = {
  type: 'edge-state';
  edge: TEdge;
  simpleRegion: TSimpleRegion | null;
  potentialEdgeState: EdgeState; // TODO: update this when shift is pressed, etc.
} | {
  type: 'face-color';
  faceColor: TFaceColor;
  face: TFace | null;
  faces: TFace[];
} | {
  type: 'sector';
  sector: TSector;
};