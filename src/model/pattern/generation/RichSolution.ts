import { TPatternBoard } from '../TPatternBoard.ts';
import { BasicSolveOptions } from '../feature/FeatureSet.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { TEmbeddableFeature } from '../feature/TEmbeddableFeature.ts';
import { BinaryFeatureMap } from './BinaryFeatureMap.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import { VertexConnection } from '../VertexConnection.ts';
import _ from '../../../workarounds/_.ts';

export class RichSolution {

  public readonly solutionSet: Set<TPatternEdge>;
  public readonly isEdgeBlack: ( edge: TPatternEdge ) => boolean;
  public readonly solutionAttributeSet: SolutionAttributeSet;
  public readonly richEdgeStateMap: Map<TPatternEdge, RichEdgeState> = new Map();

  public readonly vertexConnection: VertexConnection[] | null = null; // sorted
  public readonly vertexConnectionKey: string | null = null;

  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly binaryFeatureMap: BinaryFeatureMap,
    public readonly solution: TPatternEdge[],
    options: Required<BasicSolveOptions>,
  ) {
    assertEnabled() && assert( this.patternBoard === binaryFeatureMap.patternBoard );

    this.solutionSet = new Set( solution );

    this.isEdgeBlack = edge => this.solutionSet.has( edge );

    this.solutionAttributeSet = binaryFeatureMap.getSolutionAttributeSet( this.solutionSet );

    // richEdgeStateMap
    for ( const edge of patternBoard.edges ) {
      let richEdgeState: RichEdgeState;
      if ( edge.isExit ) {
        if ( this.isEdgeBlack( edge ) ) {
          richEdgeState = RichEdgeState.EXIT_BLACK;
        }
        else if ( edge.exitVertex!.edges.every( e => !this.isEdgeBlack( e ) ) ) {
          richEdgeState = RichEdgeState.EXIT_SOFT_RED_DOUBLE_BLACK;
        }
        else {
          richEdgeState = RichEdgeState.EXIT_HARD_RED;
        }
      }
      else {
        richEdgeState = this.isEdgeBlack( edge ) ? RichEdgeState.NON_EXIT_BLACK : RichEdgeState.NON_EXIT_RED;
      }

      this.richEdgeStateMap.set( edge, richEdgeState );
    }

    // vertex connections
    if ( options.highlander ) {
      const remainingEdges = new Set( this.solutionSet );

      const connections: VertexConnection[] = [];

      while ( remainingEdges.size ) {
        let startExitEdge!: TPatternEdge;
        for ( const edge of remainingEdges ) {
          if ( edge.isExit ) {
            startExitEdge = edge;
            break;
          }
        }
        assertEnabled() && assert( startExitEdge );

        const getNextEdge = ( currentEdge: TPatternEdge ): TPatternEdge => {
          for ( const vertex of currentEdge.vertices ) {
            for ( const edge of vertex.edges ) {
              if ( remainingEdges.has( edge ) ) {
                return edge;
              }
            }
          }
          throw new Error( 'no next edge found' );

          // Performance-improved from below
          // const potentialEdges = currentEdge.vertices.flatMap( vertex => vertex.edges ).filter( edge => remainingEdges.has( edge ) );
          // assertEnabled() && assert( potentialEdges.length === 1 );
          //
          // return potentialEdges[ 0 ];
        };

        remainingEdges.delete( startExitEdge );
        let currentEdge = startExitEdge;

        while ( currentEdge === startExitEdge || !currentEdge.isExit ) {
          const nextEdge = getNextEdge( currentEdge );
          remainingEdges.delete( nextEdge );
          currentEdge = nextEdge;
        }

        const endExitEdge = currentEdge;

        const minVertexIndex = Math.min( startExitEdge.exitVertex!.index, endExitEdge.exitVertex!.index );
        const maxVertexIndex = Math.max( startExitEdge.exitVertex!.index, endExitEdge.exitVertex!.index );

        connections.push( new VertexConnection( minVertexIndex, maxVertexIndex ) );
      }

      const sortedConnections = _.sortBy( connections, connection => connection.minVertexIndex );

      this.vertexConnection = sortedConnections;
      this.vertexConnectionKey = sortedConnections.map( connection => `c${connection.minVertexIndex}-${connection.maxVertexIndex}`).join( ',' );
    }
  }

  public isCompatibleWithFeature( feature: TEmbeddableFeature ): boolean {
    return feature.isPossibleWith( this.isEdgeBlack );
  }

  public toDebugString(): string {
    return `[${this.binaryFeatureMap.getBinaryString( this.solutionAttributeSet.data )}] (${this.binaryFeatureMap.getFeaturesString( this.solutionAttributeSet.data )}) opt:(${this.binaryFeatureMap.getFeaturesString( this.solutionAttributeSet.optionalData )}) ${this.vertexConnectionKey ?? ''}`;
  }
}

export class RichEdgeState extends EnumerationValue {
  public static readonly NON_EXIT_RED = new RichEdgeState();
  public static readonly NON_EXIT_BLACK = new RichEdgeState();
  public static readonly EXIT_HARD_RED = new RichEdgeState();
  public static readonly EXIT_BLACK = new RichEdgeState();
  public static readonly EXIT_SOFT_RED_DOUBLE_BLACK = new RichEdgeState();

  public static readonly enumeration = new Enumeration( RichEdgeState );
}
