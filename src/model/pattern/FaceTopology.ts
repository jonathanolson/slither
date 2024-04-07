import assert, { assertEnabled } from '../../workarounds/assert.ts';
import _ from '../../workarounds/_.ts';
import { TTopology } from './TTopology.ts';

export type NumberVertex = number;
export type NumberEdge = number;
export type NumberSector = number;
export type NumberFace = number;

/**
  - Description
    - N vertices, NUM_EXIT exit vertices, E edges, F faces
    - Set of "exit" vertices (labeled 0 ... NUM_EXIT-1)
    - Set of "internal" vertices (labeled NUM_EXIT ... N-1)
    - Set of faces (labeled 0 ... F-1)
      - Ordered list of vertices (using labels above)
    - (implicit) Set of edges (labeled 0 ... E-1)
      - Ordered list of vertices (using labels above)
 */
// TODO: deprecate, and remove?
// TODO: deprecate, and remove?
// TODO: deprecate, and remove?
export class FaceTopology implements TTopology {

  public readonly numFaces: number;
  public readonly numEdges: number;
  public readonly numBoundaryEdges: number;

  private readonly edges: FlexiInternalEdge[];
  private readonly boundaryEdges: FlexiInternalEdge[];
  private readonly internalEdges: FlexiInternalEdge[];
  private readonly vertexEdges: FlexiInternalEdge[][]; // vertexEdges[ vertexIndex ] = [ edge1, edge2, ... ]
  private readonly faceIndexMatrix: number[][]; // faceIndexMatrix[ vertexIndex ] = [ faceIndex1, faceIndex2, ... ]
  private readonly adjacencyMatrix: boolean[][];

  public constructor(
    public readonly numVertices: number,
    public readonly numExitVertices: number,
    private readonly faceIndices: number[][]
  ) {
    this.numFaces = faceIndices.length;

    this.vertexEdges = new Array( numVertices ).fill( [] );
    this.adjacencyMatrix = _.range( 0, numVertices ).map( () => _.range( 0, numVertices ).map( () => false ) );
    this.faceIndexMatrix = _.range( 0, numVertices ).map( v => _.range( 0, this.numFaces ).map( f => faceIndices[ f ].indexOf( v ) ) );

    const edges: FlexiInternalEdge[] = [];
    for ( let i = 0; i < faceIndices.length; i++ ) {
      const faceVertices = faceIndices[ i ];

      for ( let j = 0; j < faceVertices.length; j++ ) {
        const vertexA = faceVertices[ j ];
        const vertexB = faceVertices[ ( j + 1 ) % faceVertices.length ];

        const minVertex = Math.min( vertexA, vertexB );
        const maxVertex = Math.max( vertexA, vertexB );

        const edge = edges.find( edge => edge.minVertex === minVertex && edge.maxVertex === maxVertex );

        if ( edge ) {
          edge.faces.push( i );
        }
        else {
          const edge = new FlexiInternalEdge( minVertex, maxVertex );
          edges.push( edge );

          this.vertexEdges[ vertexA ].push( edge );
          this.vertexEdges[ vertexB ].push( edge );

          this.adjacencyMatrix[ vertexA ][ vertexB ] = true;
          this.adjacencyMatrix[ vertexB ][ vertexA ] = true;

          edge.faces.push( i );
        }
      }
    }

    this.boundaryEdges = edges.filter( edge => edge.faces.length === 1 );
    this.internalEdges = edges.filter( edge => edge.faces.length > 1 );
    this.edges = [
      ...this.boundaryEdges,
      ...this.internalEdges
    ];
    this.numEdges = this.edges.length;
    for ( let i = 0; i < this.edges.length; i++ ) {
      this.edges[ i ].index = i;
    }

    this.numBoundaryEdges = this.boundaryEdges.length;
  }

  public isExitVertex( vertex: NumberVertex ): boolean {
    assertEnabled() && assert( vertex >= 0 && vertex < this.numVertices );

    return vertex < this.numExitVertices;
  }

  public isBoundaryEdge( edge: NumberEdge ): boolean {
    assertEnabled() && assert( edge >= 0 && edge < this.numEdges );

    return edge < this.numBoundaryEdges;
  }

  public getVertexOrder( vertex: NumberVertex ): number {
    assertEnabled() && assert( vertex >= 0 && vertex < this.numVertices );

    return this.vertexEdges[ vertex ].length;
  }

  public getVertexEdges( vertex: NumberVertex ): NumberEdge[] {
    assertEnabled() && assert( vertex >= 0 && vertex < this.numVertices );

    // TODO: should we allow direct access somehow?
    return this.vertexEdges[ vertex ].map( edge => edge.index );
  }

  public getVertexFaces( vertex: NumberVertex ): NumberFace[] {
    assertEnabled() && assert( vertex >= 0 && vertex < this.numVertices );

    const faces: NumberFace[] = [];
    const faceIndices = this.faceIndexMatrix[ vertex ];

    for ( let i = 0; i < faceIndices.length; i++ ) {
      if ( faceIndices[ i ] !== -1 ) {
        faces.push( i );
      }
    }

    return faceIndices;
  }

  public getFaceVertices( face: NumberFace ): NumberVertex[] {
    assertEnabled() && assert( face >= 0 && face < this.numFaces );

    return this.faceIndices[ face ];
  }

}

class FlexiInternalEdge {
  public readonly faces: number[] = [];
  public index: number = 0;

  public constructor(
    public readonly minVertex: number,
    public readonly maxVertex: number,
  ) {}
}