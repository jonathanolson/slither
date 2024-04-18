import { TVertex } from './TVertex.ts';
import { THalfEdge } from './THalfEdge.ts';

import { TFace } from './TFace.ts';

export interface TEdge {
  start: TVertex;
  end: TVertex;
  forwardHalf: THalfEdge;
  reversedHalf: THalfEdge;
  forwardFace: TFace | null;
  reversedFace: TFace | null;
  vertices: TVertex[];
  faces: TFace[];

  getOtherVertex( vertex: TVertex ): TVertex;

  getOtherFace( face: TFace | null ): TFace | null;
}

