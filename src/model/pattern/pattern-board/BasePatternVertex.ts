import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternVertex } from './TPatternVertex.ts';

export class BasePatternVertex implements TPatternVertex {
  public exitEdge: TPatternEdge | null = null;
  public edges: TPatternEdge[] = [];
  public sectors: TPatternSector[] = [];
  public faces: TPatternFace[] = [];

  public constructor(
    public readonly index: number,
    public readonly isExit: boolean,
  ) {}
}
