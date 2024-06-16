import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternVertex } from './TPatternVertex.ts';

export interface TPatternEdge {
  index: number;
  isExit: boolean;
  exitVertex: TPatternVertex | null; // defined if isExit:true

  vertices: TPatternVertex[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}
