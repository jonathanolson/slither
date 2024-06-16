import { TVertex } from '../../board/core/TVertex.ts';
import { TSector } from './TSector.ts';

export const getSectorsFromVertex = (vertex: TVertex): TSector[] => {
  return vertex.incomingHalfEdges;
};
