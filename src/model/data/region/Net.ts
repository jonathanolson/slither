// "There will be one (and only one) strongly-connecting chain between the vertices through edges in the edge set"
// (it will not contain the entire loop)
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import SetRelation from './SetRelation.ts';
import _ from '../../../workarounds/_.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TEdgeStateData } from '../edge-state/TEdgeStateData.ts';

export class Net {
  public constructor(
    public readonly a: TVertex,
    public readonly b: TVertex,
    public readonly edges: Set<TEdge>
  ) {
    assertEnabled() && assert( a !== b );
  }

  // If all of the edges are black (for regions, this will be one subchain)
  public isComplete(
    data: TEdgeStateData
  ): boolean {
    return [ ...this.edges ].every( edge => data.getEdgeState( edge ) === EdgeState.BLACK );
  }

  public getSharedVertexCount( other: Net ): number {
    return ( this.a === other.a ? 1 : 0 ) + ( this.a === other.b ? 1 : 0 ) + ( this.b === other.a ? 1 : 0 ) + ( this.b === other.b ? 1 : 0 );
  }

  public hasSameVertices( other: Net ): boolean {
    return ( this.a === other.a && this.b === other.b ) || ( this.a === other.b && this.b === other.a );
  }

  public getSetRelation( other: Net ): SetRelation {
    let hasInThisOnly = false;
    let hasInOtherOnly = false;
    let hasInBoth = false;

    for ( const edge of this.edges ) {
      if ( other.edges.has( edge ) ) {
        hasInBoth = true;
      }
      else {
        hasInThisOnly = true;
      }

      if ( hasInBoth && hasInThisOnly ) {
        break;
      }
    }

    for ( const edge of other.edges ) {
      if ( !this.edges.has( edge ) ) {
        hasInOtherOnly = true;
        break;
      }
    }

    if ( hasInBoth ) {
      if ( !hasInThisOnly && !hasInOtherOnly ) {
        return SetRelation.EQUALS;
      }
      else if ( hasInThisOnly ) {
        return SetRelation.SUBSET;
      }
      else if ( hasInOtherOnly ) {
        return SetRelation.SUPERSET;
      }
      else {
        return SetRelation.OVERLAPS;
      }
    }
    else {
      return SetRelation.DISJOINT;
    }
  }

  public findAllSimplePaths(): TEdge[][] {
    const paths: TEdge[][] = [];
    const visited = new Set<TVertex>();
    const stack: TEdge[] = [];

    const recur = ( vertex: TVertex ) => {
      visited.add( vertex );
      for ( const edge of vertex.edges ) {
        if ( !this.edges.has( edge ) ) {
          continue;
        }
        const other = edge.getOtherVertex( vertex );
        if ( visited.has( other ) ) {
          continue;
        }
        stack.push( edge );
        if ( other === this.b ) {
          paths.push( [ ...stack ] );
        }
        else {
          recur( other );
        }
        stack.pop();
      }
      visited.delete( vertex );
    };
    recur( this.a );

    return paths;
  }

  // TODO: use forced loop removal BEFORE finding bridges/etc.
  /**
   * Find a group of edges where if any one of them is "black", it will loop around (forced) to the same vertex.
   * In nets, this means the edges aren't part of the net, and should be excluded from "bridge" computations
   * In regions, this means THOSE SHOULD BE SET TO RED.
   */
  public findForcedLoopEdges(): Set<TEdge> {
    const forcedLoopEdges = new Set<TEdge>();
    const scannedEdges = new Set<TEdge>();

    const getFilteredEdges = ( vertex: TVertex, badEdge: TEdge ) => vertex.edges.filter( edge => this.edges.has( edge ) && edge !== badEdge );

    for ( const edge of this.edges ) {
      // Already scanned
      if ( scannedEdges.has( edge ) ) { continue; }

      let startEdges = getFilteredEdges( edge.start, edge );
      let endEdges = getFilteredEdges( edge.end, edge );

      // If we aren't part of a forced loop (due to vertex edge counts), then skip
      if ( startEdges.length !== 1 && endEdges.length !== 1 ) {
        scannedEdges.add( edge );
        continue;
      }

      let loopEdges: TEdge[] = [ edge ];
      let startVertex = edge.start;
      let endVertex = edge.end;

      while ( startEdges.length === 1 && startVertex !== endVertex ) {
        const nextEdge = startEdges[ 0 ];
        loopEdges.push( nextEdge );
        startVertex = nextEdge.getOtherVertex( startVertex );
        startEdges = getFilteredEdges( startVertex, nextEdge );
      }
      while ( endEdges.length === 1 && startVertex !== endVertex ) {
        const nextEdge = endEdges[ 0 ];
        loopEdges.push( nextEdge );
        endVertex = nextEdge.getOtherVertex( endVertex );
        endEdges = getFilteredEdges( endVertex, nextEdge );
      }

      if ( startVertex === endVertex ) {
        loopEdges.forEach( edge => forcedLoopEdges.add( edge ) );
      }
      loopEdges.forEach( edge => scannedEdges.add( edge ) );
    }

    return forcedLoopEdges;
  }

  public getPossibleEdgesAndBridges(): {
    possibleEdges: TEdge[];
    bridges: TEdge[];
  } {
    let time = 0;
    const disc = new Map<TVertex, number>();
    const low = new Map<TVertex, number>();
    const visited = new Set<TVertex>();
    const parent = new Map<TVertex, TVertex>();

    // keep track of the edges to parent vertices
    const edgeToParent = new Map<TVertex, TEdge>();

    const stack: TEdge[] = [];
    const biconnectedComponents: TEdge[][] = [];
    const bridges: TEdge[] = [];
    const pathEdges: TEdge[] = [];

    const recur = ( vertex: TVertex ) => {
      visited.add( vertex );
      disc.set( vertex, time );
      low.set( vertex, time );
      time++;

      vertex.edges.forEach( edge => {
        if ( !this.edges.has( edge ) ) {
          return;
        }
        const otherVertex = edge.getOtherVertex( vertex );

        if ( !visited.has( otherVertex ) ) {
          parent.set( otherVertex, vertex );
          edgeToParent.set( otherVertex, edge );
          stack.push( edge );

          recur( otherVertex );

          if ( low.get( otherVertex )! >= disc.get( vertex )! ) {
            const component: TEdge[] = [];
            let poppedEdge;
            do {
              poppedEdge = stack.pop()!;
              component.push( poppedEdge );
            } while ( poppedEdge !== edge );
            biconnectedComponents.push( component );
          }

          if ( low.get( otherVertex )! > disc.get( vertex )! ) {
            bridges.push( edge );
          }

          low.set( vertex, Math.min( low.get( vertex )!, low.get( otherVertex )! ) );
        }
        else if ( otherVertex !== parent.get( vertex ) ) {
          low.set( vertex, Math.min( low.get( vertex )!, disc.get( otherVertex )! ) );
          if ( disc.get( otherVertex )! < disc.get( vertex )! ) {
            stack.push( edge );
          }
        }
      } );
    };

    recur( this.a );

    // Reconstruct the path from a to b using the edgeToParent map
    let currentVertex = this.b;
    while ( currentVertex !== this.a && edgeToParent.has( currentVertex ) ) {
      const edge = edgeToParent.get( currentVertex )!;
      pathEdges.unshift( edge ); // Add the edge to the beginning of the path
      currentVertex = parent.get( currentVertex )!; // Move to the parent vertex
    }

    // If currentVertex is not a and we're out of the loop, there's no path from a to b
    if ( currentVertex !== this.a ) {
      return {
        possibleEdges: [],
        bridges: []
      };
    }

    const possibleEdges: TEdge[] = [];
    for ( let component of biconnectedComponents ) {
      if ( pathEdges.some( edge => component.includes( edge ) ) ) {
        possibleEdges.push( ...component );
      }
    }

    return {
      possibleEdges: possibleEdges,
      bridges: bridges.filter( bridgeEdge => possibleEdges.includes( bridgeEdge ) )
    };
  }

  public static test( numVertices: number, numEdges: number ): void {
    if ( numVertices > 26 ) {
      throw new Error( 'Too many vertices' );
    }

    const vertices: TVertex[] = _.range( 0, numVertices ).map( i => {
      return {
        id: String.fromCharCode( 65 + i ),
        edges: []
      } as unknown as TVertex; // Forgive me
    } );

    const allEdges: TEdge[] = [];
    let number = 0;
    for ( let i = 0; i < vertices.length; i++ ) {
      for ( let j = i + 1; j < vertices.length; j++ ) {
        const edge = {
          id: `(${number++},${( vertices[ i ] as any ).id},${( vertices[ j ] as any ).id})`, // Forgive me
          start: vertices[ i ],
          end: vertices[ j ],
          vertices: [ vertices[ i ], vertices[ j ] ],
          getOtherVertex( vertex: TVertex ): TVertex {
            return vertex === vertices[ i ] ? vertices[ j ] : vertices[ i ];
          }
        } as unknown as TEdge;

        vertices[ i ].edges.push( edge );
        vertices[ j ].edges.push( edge );
        allEdges.push( edge );
      }
    }

    const edges = _.sampleSize( allEdges, numEdges );
    const [
      a,
      b
    ] = _.sampleSize( vertices, 2 );

    console.log( `Vertex start: ${( a as any ).id}` );
    console.log( `Vertex end: ${( b as any ).id}` );
    console.log( `Edges:\n${_.sortBy( edges, x => ( x as any ).id ).map( edge => ( edge as any ).id ).join( '\n' )}` );

    const net = new Net( a, b, new Set( edges ) );

    const allSimplePaths = net.findAllSimplePaths();
    const allEdgesInSimplePaths = _.sortBy( [ ...new Set( allSimplePaths.flat() ) ], x => ( x as any ).id );
    const expectedBridgeEdges = _.sortBy( allEdgesInSimplePaths.filter( edge => allSimplePaths.every( path => path.includes( edge ) ) ), x => ( x as any ).id );

    console.log( `All simple paths:\n${allSimplePaths.map( path => path.map( edge => `${( edge as any ).id}` ).join( ', ' ) ).join( '\n' )}` );

    console.log( `All edges in simple paths:\n${[ ...allEdgesInSimplePaths ].map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );
    console.log( `Expected bridge edges:\n${expectedBridgeEdges.map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );

    const {
      possibleEdges,
      bridges
    } = net.getPossibleEdgesAndBridges();

    console.log( `Possible edges:\n${_.sortBy( possibleEdges, x => ( x as any ).id ).map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );
    console.log( `Bridge edges:\n${_.sortBy( bridges, x => ( x as any ).id ).map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );

    if ( possibleEdges.length !== allEdgesInSimplePaths.length ) {
      throw new Error( 'Possible edges length mismatch' );
    }
    if ( !allEdgesInSimplePaths.every( edge => possibleEdges.includes( edge ) ) ) {
      throw new Error( 'Possible edges mismatch' );
    }
    if ( bridges.length !== expectedBridgeEdges.length ) {
      throw new Error( 'Bridge edges length mismatch' );
    }
    if ( !bridges.every( edge => expectedBridgeEdges.includes( edge ) ) ) {
      throw new Error( 'Bridge edges mismatch' );
    }
  }

  public equals( other: Net ): boolean {
    return ( ( this.a === other.a && this.b === other.b ) || ( this.a === other.b && this.b === other.a ) ) &&
           this.edges.size === other.edges.size &&
           [ ...this.edges ].every( edge => other.edges.has( edge ) );
  }
}