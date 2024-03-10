import { TEdge } from '../../board/core/TEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TFace } from '../../board/core/TFace.ts';

export type ForcedLineAnnotation = {
  type: 'ForcedLine';
  vertex: TVertex;
  blackEdge: TEdge;
  whiteEdge: TEdge;
  redEdges: TEdge[];
};

export type AlmostEmptyToRedAnnotation = {
  type: 'AlmostEmptyToRed';
  vertex: TVertex;
  whiteEdge: TEdge;
  redEdges: TEdge[];
};

export type JointToRedAnnotation = {
  type: 'JointToRed';
  vertex: TVertex;
  whiteEdges: TEdge[];
  blackEdges: [ TEdge, TEdge ];
};

export type FaceSatisfied = {
  type: 'FaceSatisfied';
  face: TFace;
  whiteEdges: TEdge[];
  blackEdges: TEdge[];
};

export type FaceAntiSatisfied = {
  type: 'FaceAntiSatisfied';
  face: TFace;
  whiteEdges: TEdge[];
  redEdges: TEdge[];
};

export type TAnnotation =
  ForcedLineAnnotation
  | AlmostEmptyToRedAnnotation
  | JointToRedAnnotation
  | FaceSatisfied
  | FaceAntiSatisfied;
