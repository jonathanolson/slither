import _ from '../../workarounds/_.ts';
import { NumberEdge, NumberFace, NumberVertex } from './FaceTopology.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TTopology } from './TTopology.ts';

// TODO: we need to know whether we have an exit vertex or not

// TODO: actually, think how vertex stuff works FOR REAL in our face topologies. We need to consider different face structures, where we ONLY have sectors for "in a face" parts

export class VertexTopology implements TTopology {

  // Face N is adjacent to edge N and edge N+1
  public readonly numFaces: number;

  public readonly numVertices = 1;

  public constructor(
    public readonly numEdges: number
  ) {
    assertEnabled() && assert( numEdges >= 2 );

    this.numFaces = numEdges;
  }

  public getFaceEdges( face: NumberFace ): NumberEdge[] {
    return _.sortBy( [ face, ( face + 1 ) % this.numEdges ] );
  }

  public getEdgeFaces( edge: NumberEdge ): NumberFace[] {
    return _.sortBy( [ edge, ( edge - 1 + this.numEdges ) % this.numEdges ] );
  }


  public getVertexOrder( vertex: NumberVertex ): number {
    assertEnabled() && assert( vertex === 0 );

    return this.numEdges;
  }

  public getVertexEdges( vertex: NumberVertex ): NumberEdge[] {
    assertEnabled() && assert( vertex === 0 );

    return _.range( 0, this.numEdges );
  }
}