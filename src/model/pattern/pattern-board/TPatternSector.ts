import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternVertex } from './TPatternVertex.ts';

export interface TPatternSector {
  index: number;
  vertex: TPatternVertex;
  face: TPatternFace;

  edges: TPatternEdge[];
}
