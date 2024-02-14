import { Vector2 } from "phet-lib/dot";
import HalfEdge from "./HalfEdge";
import Edge from "./Edge";
import Face from "./Face";
import assert from "../workarounds/assert";

export default class Vertex<HalfEdgeType extends HalfEdge = HalfEdge, EdgeType extends Edge = Edge, FaceType extends Face = Face> {

  // Half-edges with this vertex as their end vertex, in CCW order
  public readonly incidentHalfEdges: HalfEdgeType[] = [];

  // Half-edges with this vertex as their start vertex, in CCW order
  public readonly reflectedHalfEdges: HalfEdgeType[] = [];

  // Edges, in CCW order
  public readonly edges: EdgeType[] = [];

  // Faces, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public readonly faces: FaceType[] = [];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2
  ) {
    // TODO: initialize all the things
  }

  public getHalfEdgeTo( otherVertex: Vertex ): HalfEdgeType {
    const halfEdge = this.reflectedHalfEdges.find( halfEdge => halfEdge.end === otherVertex );
    assert && assert( halfEdge );
    return halfEdge!;
  }

  public getHalfEdgeFrom( otherVertex: Vertex ): HalfEdgeType {
    const halfEdge = this.incidentHalfEdges.find( halfEdge => halfEdge.start === otherVertex )!;
    assert && assert( halfEdge );
    return halfEdge!;
  }

  public getEdgeTo( otherVertex: Vertex ): EdgeType {
    const edge = this.edges.find( edge => edge.start === otherVertex || edge.end === otherVertex )!;
    assert && assert( edge );
    return edge!;
  }
}
