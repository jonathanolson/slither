import { TStructure } from './TStructure.ts';

export type TBoard<Structure extends TStructure = TStructure> = {
  edges: Structure[ 'Edge' ][];
  vertices: Structure[ 'Vertex' ][];
  faces: Structure[ 'Face' ][];
  halfEdges: Structure[ 'HalfEdge' ][];
  outerBoundary: Structure[ 'HalfEdge' ][];
  innerBoundaries: Structure[ 'HalfEdge' ][][];
};
