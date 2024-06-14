import { TStructure } from './TStructure.ts';
import { TEdge } from './TEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class BaseEdge<Structure extends TStructure> implements TEdge {
  public forwardHalf!: Structure['HalfEdge'];
  public reversedHalf!: Structure['HalfEdge'];

  public forwardFace!: Structure['Face'] | null;
  public reversedFace!: Structure['Face'] | null;

  public vertices!: Structure['Vertex'][];
  public faces!: Structure['Face'][];

  public constructor(
    public readonly start: Structure['Vertex'],
    public readonly end: Structure['Vertex'],
  ) {
    assertEnabled() && assert(start);
    assertEnabled() && assert(end);
  }

  public getOtherVertex(vertex: Structure['Vertex']): Structure['Vertex'] {
    assertEnabled() &&
      assert(vertex === this.start || vertex === this.end, 'vertex must be one of the two vertices of this edge');

    return vertex === this.start ? this.end : this.start;
  }

  public getOtherFace(face: Structure['Face'] | null): Structure['Face'] | null {
    assertEnabled() &&
      assert(face === this.forwardFace || face === this.reversedFace, 'face must be one of the two faces of this edge');

    // We can't have null forward/reversed faces!
    return face === this.forwardFace ? this.reversedFace : this.forwardFace;
  }
}
