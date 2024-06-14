import { TSector } from './TSector.ts';
import { TVertex } from '../../board/core/TVertex.ts';

export const getSectorsFromVertex = (vertex: TVertex): TSector[] => {
  return vertex.incomingHalfEdges;
};
