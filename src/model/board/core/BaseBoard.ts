import { TStructure } from './TStructure.ts';
import { TBoard } from './TBoard.ts';
import { TBoardDescriptor } from './createBoardDescriptor.ts';

export class BaseBoard<Structure extends TStructure> implements TBoard<Structure> {
  public readonly edges: Structure['Edge'][];
  public readonly vertices: Structure['Vertex'][];
  public readonly faces: Structure['Face'][];
  public readonly halfEdges: Structure['HalfEdge'][];
  public readonly outerBoundary: Structure['HalfEdge'][];
  public readonly innerBoundaries: Structure['HalfEdge'][][];

  public constructor(public readonly boardDescriptor: TBoardDescriptor<Structure>) {
    this.edges = boardDescriptor.edges;
    this.vertices = boardDescriptor.vertices;
    this.faces = boardDescriptor.faces;
    this.halfEdges = boardDescriptor.halfEdges;
    this.outerBoundary = boardDescriptor.outerBoundary;
    this.innerBoundaries = boardDescriptor.innerBoundaries;
  }
}
