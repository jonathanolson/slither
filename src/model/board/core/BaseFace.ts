import { TStructure } from './TStructure.ts';
import { TFace } from './TFace.ts';
import { Vector2 } from 'phet-lib/dot';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class BaseFace<Structure extends TStructure> implements TFace {
  // Half-edges, in CCW order
  public halfEdges!: Structure['HalfEdge'][];

  // Edges, in CCW order
  public edges!: Structure['Edge'][];

  // Vertices, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public vertices!: Structure['Vertex'][];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2, // NOTE: We may tweak the center for better "text" feel, so this might not be the centroid?
  ) {
    assertEnabled() && assert(logicalCoordinates);
    assertEnabled() && assert(viewCoordinates);
  }
}
