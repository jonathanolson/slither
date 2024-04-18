import { THalfEdge } from './THalfEdge.ts';
import { TEdge } from './TEdge.ts';
import { TVertex } from './TVertex.ts';
import { Vector2 } from 'phet-lib/dot';

export interface TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: THalfEdge[];
  edges: TEdge[];
  vertices: TVertex[];
}

