import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';

export interface TPatternVertex {
  index: number;
  isExit: boolean;
  exitEdge: TPatternEdge | null; // defined if isExit:true

  edges: TPatternEdge[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}
