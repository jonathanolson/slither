import { TVertex } from './TVertex.ts';
import { TEdge } from './TEdge.ts';
import { TFace } from './TFace.ts';

export interface THalfEdge {
  start: TVertex;
  end: TVertex;
  isReversed: boolean;
  edge: TEdge;
  reversed: THalfEdge;
  next: THalfEdge;
  previous: THalfEdge;
  face: TFace | null;
}
