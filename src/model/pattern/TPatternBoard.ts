import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';

export interface TPatternBoard {
  vertices: TPatternVertex[];
  edges: TPatternEdge[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}