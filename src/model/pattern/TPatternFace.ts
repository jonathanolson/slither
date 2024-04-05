import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternEdge } from './TPatternEdge.ts';

export interface TPatternFace {
  index: number;
  isExit: boolean;
  vertices: TPatternVertex[]; // if isExit:false, then vertices.length >= 3 AND it is an ordered list of vertices
  edges: TPatternEdge[]; // if isExit:false, then edges.length >= 3 AND it is an ordered list of edges
  sectors: TPatternSector[]; // if isExit:false, then sectors.length >= 3 AND it is an ordered list of sectors
}