import assert from "../workarounds/assert";
import Face from "./Face";
import HalfEdge from "./HalfEdge";
import Vertex from "./Vertex";

export default class Edge {

  public forwardHalf!: HalfEdge;
  public reversedHalf!: HalfEdge;

  public forwardFace!: Face | null;
  public reversedFace!: Face | null;

  public constructor(
    public readonly start: Vertex,
    public readonly end: Vertex
  ) {
    // TODO: initialize all the things
  }

  public getOtherVertex( vertex: Vertex ): Vertex {
    assert && assert( vertex === this.start || vertex === this.end, 'vertex must be one of the two vertices of this edge' );

    return vertex === this.start ? this.end : this.start;
  }

  public getOtherFace( face: Face | null ): Face | null {
    assert && assert( face === this.forwardFace || face === this.reversedFace, 'face must be one of the two faces of this edge' );

    // We can't have null forward/reversed faces!
    return face === this.forwardFace ? this.reversedFace : this.forwardFace;
  }
}
