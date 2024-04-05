import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';

export class BasePatternEdge implements TPatternEdge {

  public readonly vertices: TPatternVertex[];
  public readonly sectors: TPatternSector[] = [];
  public readonly faces: TPatternFace[] = [];

  public constructor(
    public readonly index: number,
    public readonly isExit: boolean,
    public exitVertex: TPatternVertex | null = null
  ) {
    this.vertices = exitVertex ? [ exitVertex ] : [];
  }
}