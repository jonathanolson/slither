import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';

export interface TPatternEdge {
  index: number;
  isExit: boolean;
  exitVertex: TPatternVertex | null; // defined if isExit:true

  vertices: TPatternVertex[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}