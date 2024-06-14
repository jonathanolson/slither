import { TSector } from './TSector.ts';
import { TEdge } from '../../board/core/TEdge.ts';

export const getSectorsFromEdge = (edge: TEdge): TSector[] => [
  edge.forwardHalf,
  edge.reversedHalf,
  edge.forwardHalf.previous,
  edge.reversedHalf.previous,
];
