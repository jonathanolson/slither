import { Vector2 } from "phet-lib/dot";
import HalfEdge from "./HalfEdge";
import Edge from "./Edge";
import Vertex from "./Vertex";

export default class Face {

  // Half-edges, in CCW order
  public readonly halfEdges: HalfEdge[] = [];

  // Edges, in CCW order
  public readonly edges: Edge[] = [];

  // Vertices, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public readonly vertices: Vertex[] = [];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2 // NOTE: We may tweak the center for better "text" feel, so this might not be the centroid?
  ) {
    // TODO: initialize all the things
  }
}
