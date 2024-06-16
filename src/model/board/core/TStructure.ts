import { TEdge } from './TEdge.ts';
import { TFace } from './TFace.ts';
import { THalfEdge } from './THalfEdge.ts';
import { TVertex } from './TVertex.ts';

export type TStructure = {
  HalfEdge: THalfEdge;
  Edge: TEdge;
  Face: TFace;
  Vertex: TVertex;
};
