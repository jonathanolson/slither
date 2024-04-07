import { NumberEdge, NumberVertex } from './FaceTopology.ts';

// TODO: deprecate, and remove?
// TODO: deprecate, and remove?
// TODO: deprecate, and remove?
export interface TTopology {
  // TODO: ... do we want ... these?
  numFaces: number;
  numVertices: number;
  numEdges: number;

  // TODO: automorphisms
  // TODO: find embeddings in other topologies(!) --- what do we need to represent this?
  // TODO: find embeddings in boards
  // TODO: --- when finding embeddings, pass in symmetries

  getVertexOrder( vertex: NumberVertex ): number;
  getVertexEdges( vertex: NumberVertex ): NumberEdge[];
}