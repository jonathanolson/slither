import { Vector2 } from "phet-lib/dot";
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Orientation } from "phet-lib/phet-core";
// import assert from "../workarounds/assert";

export interface TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incidentHalfEdges: THalfEdge[];
  reflectedHalfEdges: THalfEdge[];
  edges: TEdge[];
  faces: TFace[];
  getHalfEdgeTo( otherVertex: TVertex ): THalfEdge;
  getHalfEdgeFrom( otherVertex: TVertex ): THalfEdge;
  getEdgeTo( otherVertex: TVertex ): TEdge;
};

export interface THalfEdge {
  start: TVertex;
  end: TVertex;
  isReversed: boolean;
  edge: TEdge;
  reversed: THalfEdge;
  next: THalfEdge;
  previous: THalfEdge;
  face: TFace | null;
};

export interface TEdge {
  start: TVertex;
  end: TVertex;
  forwardHalf: THalfEdge;
  reversedHalf: THalfEdge;
  forwardFace: TFace | null;
  reversedFace: TFace | null;
  getOtherVertex( vertex: TVertex ): TVertex;
  getOtherFace( face: TFace | null ): TFace | null;
};

export interface TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: THalfEdge[];
  edges: TEdge[];
  vertices: TVertex[];
};

export interface TVertexSquare extends TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incidentHalfEdges: THalfEdgeSquare[];
  reflectedHalfEdges: THalfEdgeSquare[];
  edges: TEdgeSquare[];
  faces: TFaceSquare[];
  getHalfEdgeTo( otherVertex: TVertexSquare ): THalfEdgeSquare;
  getHalfEdgeFrom( otherVertex: TVertexSquare ): THalfEdgeSquare;
  getEdgeTo( otherVertex: TVertexSquare ): TEdgeSquare;

  // Square-specific
  northIncidentHalfEdge: THalfEdgeSquare;
  eastIncidentHalfEdge: THalfEdgeSquare;
  southIncidentHalfEdge: THalfEdgeSquare;
  westIncidentHalfEdge: THalfEdgeSquare;
  northReflectedHalfEdge: THalfEdgeSquare;
  eastReflectedHalfEdge: THalfEdgeSquare;
  southReflectedHalfEdge: THalfEdgeSquare;
  westReflectedHalfEdge: THalfEdgeSquare;
  northEdge: TEdgeSquare;
  eastEdge: TEdgeSquare;
  southEdge: TEdgeSquare;
  westEdge: TEdgeSquare;
  northeastFace: TFaceSquare;
  southeastFace: TFaceSquare;
  southwestFace: TFaceSquare;
  northwestFace: TFaceSquare;
  getHalfEdge( direction: CardinalDirection ): THalfEdgeSquare;
  getEdge( direction: CardinalDirection ): TEdgeSquare;
  getFace( direction: OrdinalDirection ): TFaceSquare;
  getDirectionOfHalfEdge( halfEdge: THalfEdgeSquare ): CardinalDirection;
  getDirectionOfEdge( edge: TEdgeSquare ): CardinalDirection;
  getDirectionOfFace( face: TFaceSquare ): OrdinalDirection;
};

export interface THalfEdgeSquare extends THalfEdge {
  start: TVertexSquare;
  end: TVertexSquare;
  isReversed: boolean;
  edge: TEdgeSquare;
  reversed: THalfEdgeSquare;
  next: THalfEdgeSquare;
  previous: THalfEdgeSquare;
  face: TFaceSquare | null;

  // Square-specific
  orientation: Orientation;
  northVertex: TVertexSquare; // defined for vertical - should fire an assertion if guessed wrong orientation
  eastVertex: TVertexSquare; // defined for horizontal - should fire an assertion if guessed wrong orientation
  southVertex: TVertexSquare; // defined for vertical - should fire an assertion if guessed wrong orientation
  westVertex: TVertexSquare; // defined for horizontal - should fire an assertion if guessed wrong orientation
};

export interface TEdgeSquare extends TEdge {
  start: TVertexSquare;
  end: TVertexSquare;
  forwardHalf: THalfEdgeSquare;
  reversedHalf: THalfEdgeSquare;
  forwardFace: TFaceSquare | null;
  reversedFace: TFaceSquare | null;
  getOtherVertex( vertex: TVertexSquare ): TVertexSquare;
  getOtherFace( face: TFaceSquare | null ): TFaceSquare | null;

  // Square-specific
  orientation: Orientation;
  northVertex: TVertexSquare; // defined for vertical - should fire an assertion if guessed wrong orientation
  eastVertex: TVertexSquare; // defined for horizontal - should fire an assertion if guessed wrong orientation
  southVertex: TVertexSquare; // defined for vertical - should fire an assertion if guessed wrong orientation
  westVertex: TVertexSquare; // defined for horizontal - should fire an assertion if guessed wrong orientation
  northFace: TFaceSquare | null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  eastFace: TFaceSquare | null; // defined for vertical - should fire an assertion if guessed wrong orientation
  southFace: TFaceSquare | null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  westFace: TFaceSquare | null; // defined for vertical - should fire an assertion if guessed wrong orientation
};

export interface TFaceSquare extends TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: THalfEdgeSquare[];
  edges: TEdgeSquare[];
  vertices: TVertexSquare[];

  // Square-specific
  northHalfEdge: THalfEdgeSquare;
  eastHalfEdge: THalfEdgeSquare;
  southHalfEdge: THalfEdgeSquare;
  westHalfEdge: THalfEdgeSquare;
  northEdge: TEdgeSquare;
  eastEdge: TEdgeSquare;
  southEdge: TEdgeSquare;
  westEdge: TEdgeSquare;
  northeastVertex: TVertexSquare;
  southeastVertex: TVertexSquare;
  southwestVertex: TVertexSquare;
  northwestVertex: TVertexSquare;
  getHalfEdge( direction: CardinalDirection ): THalfEdgeSquare;
  getEdge( direction: CardinalDirection ): TEdgeSquare;
  getVertex( direction: OrdinalDirection ): TVertexSquare;
  getDirectionOfHalfEdge( halfEdge: THalfEdgeSquare ): CardinalDirection;
  getDirectionOfEdge( edge: TEdgeSquare ): CardinalDirection;
  getDirectionOfVertex( vertex: TVertexSquare ): OrdinalDirection;
};

// export class Vertex {
//
//   // Half-edges with this vertex as their end vertex, in CCW order
//   public readonly incidentHalfEdges: HalfEdge[] = [];
//
//   // Half-edges with this vertex as their start vertex, in CCW order
//   public readonly reflectedHalfEdges: HalfEdge[] = [];
//
//   // Edges, in CCW order
//   public readonly edges: Edge[] = [];
//
//   // Faces, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
//   public readonly faces: Face[] = [];
//
//   public constructor(
//     // 2d coordinates (for hex, we'll want logical/view coordinate separation)
//     public readonly logicalCoordinates: Vector2,
//     public readonly viewCoordinates: Vector2
//   ) {
//     // TODO: initialize all the things
//   }
//
//   public getHalfEdgeTo( otherVertex: Vertex ): HalfEdge {
//     const halfEdge = this.reflectedHalfEdges.find( halfEdge => halfEdge.end === otherVertex );
//     assert && assert( halfEdge );
//     return halfEdge!;
//   }
//
//   public getHalfEdgeFrom( otherVertex: Vertex ): HalfEdge {
//     const halfEdge = this.incidentHalfEdges.find( halfEdge => halfEdge.start === otherVertex )!;
//     assert && assert( halfEdge );
//     return halfEdge!;
//   }
//
//   public getEdgeTo( otherVertex: Vertex ): Edge {
//     const edge = this.edges.find( edge => edge.start === otherVertex || edge.end === otherVertex )!;
//     assert && assert( edge );
//     return edge!;
//   }
// }
//
// export class HalfEdge {
//
//   public edge!: Edge;
//
//   public reversed!: HalfEdge;
//
//   public next!: HalfEdge;
//   public previous!: HalfEdge;
//
//   // The face to the "left" of the directed half-edge
//   public face!: Face | null;
//
//   public constructor(
//     public readonly start: Vertex,
//     public readonly end: Vertex,
//     public readonly isReversed: boolean
//   ) {
//     // TODO: initialize all the things
//   }
// }
//
// export class Edge {
//
//   public forwardHalf!: HalfEdge;
//   public reversedHalf!: HalfEdge;
//
//   public forwardFace!: Face | null;
//   public reversedFace!: Face | null;
//
//   public constructor(
//     public readonly start: Vertex,
//     public readonly end: Vertex
//   ) {
//     // TODO: initialize all the things
//   }
//
//   public getOtherVertex( vertex: Vertex ): Vertex {
//     assert && assert( vertex === this.start || vertex === this.end, 'vertex must be one of the two vertices of this edge' );
//
//     return vertex === this.start ? this.end : this.start;
//   }
//
//   public getOtherFace( face: Face | null ): Face | null {
//     assert && assert( face === this.forwardFace || face === this.reversedFace, 'face must be one of the two faces of this edge' );
//
//     // We can't have null forward/reversed faces!
//     return face === this.forwardFace ? this.reversedFace : this.forwardFace;
//   }
// }
//
// export class Face {
//
//   // Half-edges, in CCW order
//   public readonly halfEdges: HalfEdge[] = [];
//
//   // Edges, in CCW order
//   public readonly edges: Edge[] = [];
//
//   // Vertices, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
//   public readonly vertices: Vertex[] = [];
//
//   public constructor(
//     // 2d coordinates (for hex, we'll want logical/view coordinate separation)
//     public readonly logicalCoordinates: Vector2,
//     public readonly viewCoordinates: Vector2 // NOTE: We may tweak the center for better "text" feel, so this might not be the centroid?
//   ) {
//     // TODO: initialize all the things
//   }
// }
