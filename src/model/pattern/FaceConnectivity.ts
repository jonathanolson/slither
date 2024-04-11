import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternFace } from './TPatternFace.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TPatternEdge } from './TPatternEdge.ts';

const cacheMap = new WeakMap<TPatternBoard, FaceConnectivity>();

export class FaceConnectivity {

  // TODO: Also record "all possible edge paths" for our nonzero-crossings (or 2+ crossings) features

  public readonly connectedFacePairs: ConnectedFacePair[] = [];
  public readonly connectedExitFacePairs: ConnectedFacePair[] = []; // just with both faces are exit faces
  public readonly connectedComponents: TPatternFace[][] = [];

  public static get( patternBoard: TPatternBoard ): FaceConnectivity {
    let connectivity = cacheMap.get( patternBoard );
    if ( !connectivity ) {
      connectivity = new FaceConnectivity( patternBoard );
      cacheMap.set( patternBoard, connectivity );
    }
    return connectivity;
  }

  private constructor(
    public readonly patternBoard: TPatternBoard
  ) {
    for ( const rootFace of patternBoard.faces ) {

      const visitedFaces = new Set<TPatternFace>( [ rootFace ] );

      const queue = [ new CandidatePath( rootFace, [] ) ];
      let isSmallestFace = true;

      while ( queue.length ) {
        const candidate = queue.shift()!;
        const { face, edges } = candidate;

        for ( const edge of face.edges ) {
          if ( edge.faces.length === 2 ) {
            const neighborFace = edge.faces[ 0 ] === face ? edge.faces[ 1 ] : edge.faces[ 0 ];
            if ( !visitedFaces.has( neighborFace ) ) {
              const path = [ ...edges, edge ];

              visitedFaces.add( neighborFace );
              queue.push( new CandidatePath( neighborFace, path ) );

              if ( rootFace.index < neighborFace.index ) {
                const pair = new ConnectedFacePair( rootFace, neighborFace, path );
                this.connectedFacePairs.push( pair );
                if ( face.isExit && neighborFace.isExit ) {
                  this.connectedExitFacePairs.push( pair );
                }
              }
              else {
                isSmallestFace = false;
              }
            }
          }
        }
      }

      if ( isSmallestFace ) {
        this.connectedComponents.push( [ ...visitedFaces ] );
      }
    }
  }
}

export class ConnectedFacePair {
  public constructor(
    public readonly a: TPatternFace,
    public readonly b: TPatternFace,

    // e.g. a => edge => face => ... => face => => edge => b
    public readonly shortestPath: TPatternEdge[],
    // TODO: allPossibleEdgePaths: TPatternEdge[][]
  ) {
    assertEnabled() && assert( a.index < b.index );
  }
}

class CandidatePath {
  public constructor(
    public readonly face: TPatternFace,
    public readonly edges: TPatternEdge[]
  ) {}
}