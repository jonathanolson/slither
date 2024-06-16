import { TEdge } from '../../board/core/TEdge.ts';
import { TSector } from './TSector.ts';

export const getSectorsFromEdge = (edge: TEdge): TSector[] => [
  edge.forwardHalf,
  edge.reversedHalf,
  edge.forwardHalf.previous,
  edge.reversedHalf.previous,
];
