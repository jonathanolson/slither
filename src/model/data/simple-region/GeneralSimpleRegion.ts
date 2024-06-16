import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { THalfEdge } from '../../board/core/THalfEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { deserializeHalfEdge } from '../../board/core/deserializeHalfEdge.ts';
import { TSerializedSimpleRegion, TSimpleRegion } from './TSimpleRegionData.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';


// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta
export class GeneralSimpleRegion implements TSimpleRegion {
  public readonly edges: TEdge[];
  public readonly a: TVertex;
  public readonly b: TVertex;

  public constructor(
    public readonly id: number,
    public readonly halfEdges: THalfEdge[],
    public readonly isSolved: boolean = false,
  ) {
    this.a = halfEdges[0].start;
    this.b = halfEdges[halfEdges.length - 1].end;
    this.edges = halfEdges.map((halfEdge) => halfEdge.edge);

    if (assertEnabled()) {
      assert(halfEdges.length > 0);
      for (let i = 0; i < halfEdges.length - 1; i++) {
        assert(halfEdges[i].end === halfEdges[i + 1].start);
      }
    }
  }

  public static deserializeSimpleRegion(board: TBoard, serializedSimpleRegion: TSerializedSimpleRegion): TSimpleRegion {
    return new GeneralSimpleRegion(
      serializedSimpleRegion.id,
      serializedSimpleRegion.halfEdges.map((halfEdge) => deserializeHalfEdge(board, halfEdge)),
      serializedSimpleRegion.isSolved,
    );
  }
}
