import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';

export interface TPatternSector {
  index: number;
  vertex: TPatternVertex;
  isExit: boolean;
  exitEdge: TPatternEdge | null; // defined if isExit:true
  face: TPatternFace | null; // defined if isExit:false

  edges: TPatternEdge[];
}