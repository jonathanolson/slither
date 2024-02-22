import { TStructure } from './TStructure.ts';
import { TVertex } from './TVertex.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { Vector2 } from 'phet-lib/dot';

export class BaseVertex<Structure extends TStructure> implements TVertex {

  // Half-edges with this vertex as their end vertex, in CCW order
  public incomingHalfEdges!: Structure[ 'HalfEdge' ][];

  // Half-edges with this vertex as their start vertex, in CCW order
  public outgoingHalfEdges!: Structure[ 'HalfEdge' ][];

  // Edges, in CCW order
  public edges!: Structure[ 'Edge' ][];

  // Faces, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public faces!: Structure[ 'Face' ][];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2
  ) {}

  public getHalfEdgeTo( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'HalfEdge' ] {
    const halfEdge = this.outgoingHalfEdges.find( halfEdge => halfEdge.end === otherVertex )!;
    assertEnabled() && assert( halfEdge );
    return halfEdge;
  }

  public getHalfEdgeFrom( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'HalfEdge' ] {
    const halfEdge = this.incomingHalfEdges.find( halfEdge => halfEdge.start === otherVertex )!;
    assertEnabled() && assert( halfEdge );
    return halfEdge;
  }

  public getEdgeTo( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'Edge' ] {
    const edge = this.edges.find( edge => edge.start === otherVertex || edge.end === otherVertex )!;
    assertEnabled() && assert( edge );
    return edge;
  }
}