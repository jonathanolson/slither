import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';

export interface TPatternBoard {
  name?: string;
  descriptor: TPatternBoardDescriptor;

  vertices: TPatternVertex[];
  edges: TPatternEdge[];
  sectors: TPatternSector[];
  faces: TPatternFace[];
}