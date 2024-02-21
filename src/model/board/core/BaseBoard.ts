import { TStructure } from './TStructure.ts';
import { TBoard } from './TBoard.ts';

export class BaseBoard<Structure extends TStructure> implements TBoard<Structure> {
  public constructor(
    public readonly edges: Structure[ 'Edge' ][],
    public readonly vertices: Structure[ 'Vertex' ][],
    public readonly faces: Structure[ 'Face' ][]
  ) {}
}