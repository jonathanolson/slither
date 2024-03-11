import { TEdge } from '../core/TEdge.ts';
import { TVertex } from '../core/TVertex.ts';

// TODO: use this more
export const edgeHasVertex = ( edge: TEdge, vertex: TVertex ): boolean => {
  return edge.start === vertex || edge.end === vertex;
};
