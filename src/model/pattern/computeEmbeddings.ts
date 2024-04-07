import { TPatternBoard } from './TPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import _ from '../../workarounds/_.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';

// NOTE: Only works for the specific types of patterns we create.
export const computeEmbeddings = ( pattern: TPatternBoard, board: TPatternBoard ): Embedding[] => {
  // Can't stuff bigger patterns into smaller boards
  if (
    pattern.faces.length > board.faces.length ||
    pattern.sectors.length > board.sectors.length ||
    pattern.edges.length > board.edges.length ||
    pattern.vertices.length > board.vertices.length
  ) {
    return [];
  }

  // NOTE: the "how do we ensure there are no extra edges between non-exit vertices" question is resolved by noting
  // we have "full face" coverage (i.e. every edge is part of a face), so it leaves no room for another edge to exist.

  const embeddings: Embedding[] = [];

  const realFaces = pattern.faces.filter( face => !face.isExit );

  // If we have faces, we'll find embeddings based on this
  if ( realFaces.length ) {
    // TODO: consider preprocessing things so this isn't needed every time

    const firstFace = realFaces[ 0 ];

    const orderedFaces = [ firstFace ];

    // orderedFaces[ i + 1 ].edges[ matchingEdgeIndices[ i ] ] should have a previously-matched edge
    // IMPORTANT because now we can define a unique SINGLE FaceMapping that may be valid
    const matchingEdgeIndices: number[] = [];

    // orderedFaces[ i + 1 ].vertices[ matchingVertexIndices[ i ] ] should have a previously-matched vertex
    // IMPORTANT because now we can define two FaceMappings that may be valid (one offset, two directions)
    const matchingVertexIndices: number[] = [];

    const remainingFaces = new Set( realFaces.slice( 1 ) );
    const discoveredEdges = new Set( firstFace.edges );
    const discoveredVertices = new Set( firstFace.vertices );

    while ( remainingFaces.size ) {
      const bestFace = _.maxBy( [ ...remainingFaces ], face => {
        let score = 0;
        for ( const edge of face.edges ) {
          if ( discoveredEdges.has( edge ) ) {
            score += 5;
          }
        }
        for ( const vertex of face.vertices ) {
          if ( discoveredVertices.has( vertex ) ) {
            score += 1;
          }
        }
        return score;
      } )!;
      assertEnabled() && assert( bestFace );

      orderedFaces.push( bestFace );
      matchingEdgeIndices.push( _.findIndex( bestFace.edges, edge => discoveredEdges.has( edge ) ) );
      matchingVertexIndices.push( _.findIndex( bestFace.vertices, vertex => discoveredVertices.has( vertex ) ) );

      remainingFaces.delete( bestFace );
      for ( const edge of bestFace.edges ) {
        discoveredEdges.add( edge );
      }
      for ( const vertex of bestFace.vertices ) {
        discoveredVertices.add( vertex );
      }
    }

    const checkMappingAdjacencyOrders = ( faceA: TPatternFace, faceB: TPatternFace, mapping: FaceMapping ): boolean => {
      // sanity check, probably not necessary
      if ( faceA.edges.length !== faceB.edges.length ) {
        return false;
      }

      for ( let i = 0; i < faceA.edges.length; i++ ) {
        const edgeA = faceA.edges[ i ];
        const edgeB = faceB.edges[ mapping.mapEdgeIndex( i ) ];

        assertEnabled() && assert( edgeA.faces.includes( faceA ) );
        assertEnabled() && assert( edgeB.faces.includes( faceB ) );

        const otherFaceA = edgeA.faces[ 0 ] === faceA ? edgeA.faces[ 1 ] : edgeA.faces[ 0 ];

        // Only check "real" faces on A
        if ( !otherFaceA.isExit ) {
          const otherFaceB = edgeB.faces[ 0 ] === faceB ? edgeB.faces[ 1 ] : edgeB.faces[ 0 ];

          // Which should map to "real" faces on B
          if ( otherFaceB.isExit ) {
            return false;
          }

          if ( otherFaceA.edges.length !== otherFaceB.edges.length ) {
            return false;
          }
        }
      }

      return true;
    };

    for ( const firstTargetFace of board.faces ) {
      if ( firstTargetFace.isExit ) {
        continue;
      }

      if ( firstTargetFace.edges.length !== firstFace.edges.length ) {
        continue;
      }

      for ( const firstMapping of FaceMapping.allForOrder( firstTargetFace.edges.length ) ) {
        if ( !checkMappingAdjacencyOrders( firstFace, firstTargetFace, firstMapping ) ) {
          continue;
        }

        const rootMappingMap = new Map<TPatternFace, FaceMapping>();
        const rootFaceMap = new Map<TPatternFace, TPatternFace>();
        const rootFaceInverseMap = new Map<TPatternFace, TPatternFace>(); // to ensure 1-to-1 mapping
        const rootVertexMap = new Map<TPatternVertex, TPatternVertex>();
        const rootVertexInverseMap = new Map<TPatternVertex, TPatternVertex>(); // to ensure 1-to-1 mapping

        rootMappingMap.set( firstFace, firstMapping );
        rootFaceMap.set( firstFace, firstTargetFace );
        for ( let i = 0; i < firstFace.vertices.length; i++ ) {
          rootVertexMap.set( firstFace.vertices[ i ], firstTargetFace.vertices[ firstMapping.mapVertexIndex( i ) ] );
        }

        const recur = (
          orderedFacesIndex: number,
          mappingMap: Map<TPatternFace, FaceMapping>,
          faceMap: Map<TPatternFace, TPatternFace>,
          faceInverseMap: Map<TPatternFace, TPatternFace>,
          vertexMap: Map<TPatternVertex, TPatternVertex>,
          vertexInverseMap: Map<TPatternVertex, TPatternVertex>,
        ): void => {
          if ( orderedFacesIndex === orderedFaces.length ) {
            // We found one!!!

            // TODO: create the Embedding (is it that hard?)

            assertEnabled() && assert( vertexMap.size === pattern.vertices.length );

            // Non-exit edges
            const nonExitEdgeMap = new Map<TPatternEdge, TPatternEdge>();
            const nonExitTargetEdges = new Set<TPatternEdge>();
            for ( const [ patternFace, targetFace ] of faceMap ) {
              const mapping = mappingMap.get( patternFace )!;

              for ( let i = 0; i < patternFace.edges.length; i++ ) {
                const patternEdge = patternFace.edges[ i ];
                const targetEdge = targetFace.edges[ mapping.mapEdgeIndex( i ) ];

                assertEnabled() && nonExitEdgeMap.has( patternEdge ) && assert( nonExitEdgeMap.get( patternEdge ) === targetEdge );
                nonExitEdgeMap.set( patternEdge, targetEdge );
                nonExitTargetEdges.add( targetEdge );
              }
            }
            assertEnabled() && assert( nonExitEdgeMap.size === pattern.edges.filter( edge => !edge.isExit ).length );

            // Exit edges
            const exitEdgeMap = new Map<TPatternEdge, TPatternEdge[]>();
            for ( const exitEdge of pattern.edges.filter( edge => edge.isExit ) ) {
              const exitVertex = exitEdge.exitVertex!;
              assertEnabled() && assert( exitVertex );

              const targetVertex = vertexMap.get( exitVertex )!;
              assertEnabled() && assert( targetVertex );

              exitEdgeMap.set( exitEdge, targetVertex.edges.filter( targetEdge => !nonExitTargetEdges.has( targetEdge ) ) );
            }

            // Exit faces
            for ( const exitFace of pattern.faces.filter( face => face.isExit ) ) {
              const patternEdge = exitFace.edges[ 0 ];
              assertEnabled() && assert( patternEdge && exitFace.edges.length === 1 );

              const targetEdge = nonExitEdgeMap.get( patternEdge )!;

              const otherPatternFace = patternEdge.faces[ 0 ] === exitFace ? patternEdge.faces[ 1 ] : patternEdge.faces[ 0 ];
              const otherTargetFace = faceMap.get( otherPatternFace )!;

              const exitTargetFace = targetEdge.faces[ 0 ] === otherTargetFace ? targetEdge.faces[ 1 ] : targetEdge.faces[ 0 ];
              assertEnabled() && assert( exitTargetFace );

              faceMap.set( exitFace, exitTargetFace );
            }

            // Sectors
            const sectorMap = new Map<TPatternSector, TPatternSector>();
            for ( const patternSector of pattern.sectors ) {
              const patternFace = patternSector.face;

              const targetFace = faceMap.get( patternFace )!;
              assertEnabled() && assert( targetFace );

              const patternEdgeA = patternSector.edges[ 0 ];
              const patternEdgeB = patternSector.edges[ 1 ];

              const targetEdgeA = nonExitEdgeMap.get( patternEdgeA )!;
              const targetEdgeB = nonExitEdgeMap.get( patternEdgeB )!;

              assertEnabled() && assert( targetEdgeA && targetEdgeB );

              const targetSector = targetFace.sectors.find( sector => sector.edges.includes( targetEdgeA ) && sector.edges.includes( targetEdgeB ) )!;
              assertEnabled() && assert( targetSector );

              sectorMap.set( patternSector, targetSector );
            }

            embeddings.push( new Embedding(
              vertexMap,
              nonExitEdgeMap,
              exitEdgeMap,
              sectorMap,
              faceMap,
            ) );
          }
          else {
            const patternFace = orderedFaces[ orderedFacesIndex ];
            const matchingEdgeIndex = matchingEdgeIndices[ orderedFacesIndex - 1 ];
            const matchingVertexIndex = matchingVertexIndices[ orderedFacesIndex - 1 ];

            if ( matchingEdgeIndex >= 0 ) {
              // Yay, we share an edge with a previous face! We have a FIXED face with a FIXED mapping (if it is valid at all)
              // We'll reuse faceMap/vertexMap, since if we fail here, we will fail for other mappings where no copies are made.

              const patternEdge = patternFace.edges[ matchingEdgeIndex ];
              const patternVertexA = patternEdge.vertices[ 0 ];
              const patternVertexB = patternEdge.vertices[ 1 ];
              const targetVertexA = vertexMap.get( patternVertexA )!;
              const targetVertexB = vertexMap.get( patternVertexB )!;

              const previousPatternFace = patternEdge.faces[ 0 ] === patternFace ? patternEdge.faces[ 1 ] : patternEdge.faces[ 0 ];
              const previousTargetFace = faceMap.get( previousPatternFace )!;
              assertEnabled() && assert( previousTargetFace );

              const targetEdge = previousTargetFace.edges.find( edge => edge.vertices.includes( targetVertexA ) && edge.vertices.includes( targetVertexB ) )!;
              assertEnabled() && assert( targetEdge );

              const targetFace = targetEdge.faces[ 0 ] === previousTargetFace ? targetEdge.faces[ 1 ] : targetEdge.faces[ 0 ];

              // Bail if our target face is an exit face
              if ( targetFace.isExit ) {
                return;
              }

              // Bail if we've already mapped this face (can't have duplicates)
              if ( faceInverseMap.has( targetFace ) ) {
                return;
              }

              const patternVertexAIndex = patternFace.vertices.indexOf( patternVertexA );
              const patternVertexBIndex = patternFace.vertices.indexOf( patternVertexB );

              const targetVertexAIndex = targetFace.vertices.indexOf( targetVertexA );
              const targetVertexBIndex = targetFace.vertices.indexOf( targetVertexB );

              const isPatternForward = ( ( patternVertexAIndex + 1 ) % patternFace.vertices.length ) === patternVertexBIndex;
              const isTargetForward = ( ( targetVertexAIndex + 1 ) % targetFace.vertices.length ) === targetVertexBIndex;

              const direction = isPatternForward === isTargetForward ? 1 : -1;
              const offset = ( targetVertexAIndex - patternVertexAIndex + patternFace.vertices.length ) % patternFace.vertices.length;

              const mapping = new FaceMapping( patternFace.vertices.length, offset, direction );

              // Check adjacent face orders and exit status
              if ( !checkMappingAdjacencyOrders( patternFace, targetFace, mapping ) ) {
                return;
              }

              // Process face
              faceMap.set( patternFace, targetFace );
              faceInverseMap.set( targetFace, patternFace );

              // Check and process vertices
              for ( let i = 0; i < patternFace.vertices.length; i++ ) {
                const patternVertex = patternFace.vertices[ i ];
                const targetVertex = targetFace.vertices[ mapping.mapVertexIndex( i ) ];

                if ( vertexMap.has( patternVertex ) ) {
                  if ( vertexMap.get( patternVertex ) !== targetVertex ) {
                    return;
                  }
                }
                else {
                  vertexMap.set( patternVertex, targetVertex );
                }
                if ( vertexInverseMap.has( targetVertex ) ) {
                  if ( vertexInverseMap.get( targetVertex ) !== patternVertex ) {
                    return;
                  }
                }
                else {
                  vertexInverseMap.set( targetVertex, patternVertex );
                }
              }

              mappingMap.set( patternFace, mapping );

              recur( orderedFacesIndex + 1, mappingMap, faceMap, faceInverseMap, vertexMap, vertexInverseMap );
            }
            else {
              // Well, we're connected, so we share a vertex with a previous face. For each candidate face, we'll have
              // two mappings, so we'll need to try both (backtrack) with copies of face/vertex maps. Lots of fun.

              assertEnabled() && assert( matchingVertexIndex >= 0, 'If this is not satisfied, we have disconnected components OR orderedFaces order is bad' );

              // NOTE: we can avoid previously-mapped faces AND we can avoid faces adjacent to those (since they would have a shared edge).

              const patternVertex = patternFace.vertices[ matchingVertexIndex ];
              const targetVertex = vertexMap.get( patternVertex )!;

              // NOTE: so we can avoid other checks, we'll just check all of the non-mapped faces for a match
              const candidateTargetFaces = targetVertex.faces.filter( face => !face.isExit && !faceInverseMap.has( face ) );

              for ( const targetFace of candidateTargetFaces ) {
                const patternVertexIndex = patternFace.vertices.indexOf( patternVertex );
                const targetVertexIndex = targetFace.vertices.indexOf( targetVertex );

                assertEnabled() && assert( patternVertexIndex >= 0 );
                assertEnabled() && assert( targetVertexIndex >= 0 );

                const offset = ( targetVertexIndex - patternVertexIndex + patternFace.vertices.length ) % patternFace.vertices.length;

                for ( const direction of [ 1, -1 ] as const ) {
                  const mapping = new FaceMapping( patternFace.vertices.length, offset, direction );

                  if ( !checkMappingAdjacencyOrders( patternFace, targetFace, mapping ) ) {
                    continue;
                  }


                  const newVertexMap = new Map( vertexMap );
                  const newVertexInverseMap = new Map( vertexInverseMap );

                  // Check and process vertices
                  // TODO: this code is somewhat duplicated, can we refactor?
                  for ( let i = 0; i < patternFace.vertices.length; i++ ) {
                    const patternVertex = patternFace.vertices[ i ];
                    const targetVertex = targetFace.vertices[ mapping.mapVertexIndex( i ) ];

                    if ( newVertexMap.has( patternVertex ) ) {
                      if ( newVertexMap.get( patternVertex ) !== targetVertex ) {
                        return;
                      }
                    }
                    else {
                      newVertexMap.set( patternVertex, targetVertex );
                    }
                    if ( newVertexInverseMap.has( targetVertex ) ) {
                      if ( newVertexInverseMap.get( targetVertex ) !== patternVertex ) {
                        return;
                      }
                    }
                    else {
                      newVertexInverseMap.set( targetVertex, patternVertex );
                    }
                  }

                  const newFaceMap = new Map( faceMap );
                  const newFaceInverseMap = new Map( faceInverseMap );

                  // Process face
                  newFaceMap.set( patternFace, targetFace );
                  newFaceInverseMap.set( targetFace, patternFace );

                  const newMappingMap = new Map( mappingMap );
                  newMappingMap.set( patternFace, mapping );

                  recur( orderedFacesIndex + 1, newMappingMap, newFaceMap, newFaceInverseMap, newVertexMap, newVertexInverseMap );
                }
              }
            }
          }
        };
        recur( 1, rootMappingMap, rootFaceMap, rootFaceInverseMap, rootVertexMap, rootVertexInverseMap );
      }
    }
  }
  else if ( pattern.vertices.length === 1 ) {

    // TODO: is it an exit vertex or not? we need to do "sector" matching for both, since we don't have edge orders around a vertex

    throw new Error( 'unimplemented' ); // TODO: complete!!!
  }
  else if ( pattern.vertices.length === 0 && pattern.edges.length === 1 ) {
    throw new Error( 'unimplemented' ); // TODO: complete!!!
  }
  else {
    throw new Error( 'pattern search not implemented generally yet' );
  }

  return embeddings;
};

class FaceMapping {
  // TODO: mutable, save instances?
  public constructor(
    // such that verticesA[ i ] => verticesB[ ( offset + i * direction ) % edgeCount ]
    public readonly edgeCount: number,
    public readonly offset: number,
    public readonly direction: 1 | -1,
  ) {
    assertEnabled() && assert( direction === 1 || direction === -1 );
  }

  public mapVertexIndex( i: number ): number {
    return ( this.offset + i * this.direction + this.edgeCount ) % this.edgeCount;
  }

  public mapEdgeIndex( i: number ): number {
    if ( this.direction === 1 ) {
      return ( this.offset + i ) % this.edgeCount;
    }
    else {
      // 2x edgeCount just to ensure positive
      return ( this.offset - i - 1 + 2 * this.edgeCount ) % this.edgeCount;
    }
  }

  public static allForOrder( edgeCount: number ): FaceMapping[] {
    return [
      ..._.range( 0, edgeCount ).map( offset => new FaceMapping( edgeCount, offset, 1 ) ),
      ..._.range( 0, edgeCount ).map( offset => new FaceMapping( edgeCount, offset, -1 ) ),
    ];
  }
}