import { TPatternSector } from './TPatternSector.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';

export class BasePatternSector implements TPatternSector {
  public face: TPatternFace | null = null;

  public constructor(
    public readonly index: number,
    public readonly vertex: TPatternVertex,
    public readonly isExit: boolean,
    public readonly exitEdge: TPatternEdge | null,
    public readonly edges: TPatternEdge[],
  ) {}
}