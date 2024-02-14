import Edge from "./Edge";
import Face from "./Face";
import Vertex from "./Vertex";

export default class HalfEdge {

  public edge!: Edge;

  public reversed!: HalfEdge;

  public next!: HalfEdge;
  public previous!: HalfEdge;

  // The face to the "left" of the directed half-edge
  public face!: Face | null;

  public constructor(
    public readonly start: Vertex,
    public readonly end: Vertex,
    public readonly isReversed: boolean
  ) {
    // TODO: initialize all the things
  }
}
