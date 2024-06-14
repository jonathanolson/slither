import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';

export interface TPatternVertex {
  index: number;
  isExit: boolean;
  exitEdge: TPatternEdge | null; // defined if isExit:true

  edges: TPatternEdge[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}
