import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternEdge } from './TPatternEdge.ts';

export interface TPatternFace {
  index: number;
  isExit: boolean;

  // if isExit:false, then vertices.length >= 3 AND it is an ordered list of vertices
  vertices: TPatternVertex[];

  // if isExit:false, then edges.length >= 3 AND it is an ordered list of edges
  // NOTE: should have edge[ 0 ] = vertex[ 0 ] -> vertex[ 1 ], edge[ 1 ] = vertex[ 1 ] -> vertex[ 2 ], etc.
  edges: TPatternEdge[];

  // if isExit:false, then sectors.length >= 3 AND it is an ordered list of sectors
  // NOTE: should have sector[ 0 ] = edge[ 0 ] -> edge[ 1 ], sector[ 1 ] = edge[ 1 ] -> edge[ 2 ], etc.
  sectors: TPatternSector[];
}