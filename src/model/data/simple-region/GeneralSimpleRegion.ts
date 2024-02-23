import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { THalfEdge } from '../../board/core/THalfEdge.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TSimpleRegion } from './TSimpleRegionData.ts';

// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta
export class GeneralSimpleRegion implements TSimpleRegion {

  public readonly edges: TEdge[];
  public readonly a: TVertex;
  public readonly b: TVertex;

  public constructor(
    public readonly id: number,
    public readonly halfEdges: THalfEdge[],
    public readonly isSolved: boolean = false
  ) {
    this.a = halfEdges[ 0 ].start;
    this.b = halfEdges[ halfEdges.length - 1 ].end;
    this.edges = halfEdges.map( halfEdge => halfEdge.edge );

    if ( assertEnabled() ) {
      assert( halfEdges.length > 0 );
      for ( let i = 0; i < halfEdges.length - 1; i++ ) {
        assert( halfEdges[ i ].end === halfEdges[ i + 1 ].start );
      }
    }
  }
}

