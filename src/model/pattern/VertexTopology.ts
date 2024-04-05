import _ from '../../workarounds/_.ts';
import { NumberEdge, NumberFace } from './FaceTopology.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

export class VertexTopology {

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
}