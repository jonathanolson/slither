import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternVertex } from './TPatternVertex.ts';

export interface TPatternBoard {
  name?: string;
  descriptor: TPatternBoardDescriptor;

  vertices: TPatternVertex[];
  edges: TPatternEdge[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}
