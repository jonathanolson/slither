import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternVertex } from './TPatternVertex.ts';

export class BasePatternFace implements TPatternFace {
  public constructor(
    public readonly index: number,
    public readonly isExit: boolean,
    public readonly vertices: TPatternVertex[],
    public readonly edges: TPatternEdge[],
    public readonly sectors: TPatternSector[],
  ) {}
}
