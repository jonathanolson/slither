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
    pattern.faces.filter( face => !face.isExit ).length > board.faces.filter( face => !face.isExit ).length ||
    pattern.sectors.length > board.sectors.length ||
    pattern.edges.filter( face => !face.isExit ).length > board.edges.filter( face => !face.isExit ).length ||
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
    // console.log( 'face matching' );
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
      // console.log( 'firstFace', firstTargetFace.index );

      if ( firstTargetFace.isExit ) {
        // console.log( 'abort isExit' );
        continue;
      }

      if ( firstTargetFace.edges.length !== firstFace.edges.length ) {
        // console.log( 'abort length mismatch' );
        continue;
      }

      for ( const firstMapping of FaceMapping.allForOrder( firstTargetFace.edges.length ) ) {
        // console.log( `  firstMapping: ${firstMapping}` );
        if ( !checkMappingAdjacencyOrders( firstFace, firstTargetFace, firstMapping ) ) {
          // console.log( '  abort adjacency' );
          continue;
        }

        const rootMappingMap = new Map<TPatternFace, FaceMapping>();
        const rootFaceMap = new Map<TPatternFace, TPatternFace>();
        const rootFaceInverseMap = new Map<TPatternFace, TPatternFace>(); // to ensure 1-to-1 mapping
        const rootVertexMap = new Map<TPatternVertex, TPatternVertex>();
        const rootVertexInverseMap = new Map<TPatternVertex, TPatternVertex>(); // to ensure 1-to-1 mapping

        rootMappingMap.set( firstFace, firstMapping );
        rootFaceMap.set( firstFace, firstTargetFace );
        rootFaceInverseMap.set( firstTargetFace, firstFace );
        for ( let i = 0; i < firstFace.vertices.length; i++ ) {
          const patternVertex = firstFace.vertices[ i ];
          const targetVertex = firstTargetFace.vertices[ firstMapping.mapVertexIndex( i ) ];
          rootVertexMap.set( patternVertex, targetVertex );
          rootVertexInverseMap.set( targetVertex, patternVertex );
        }

        const recur = (
          orderedFacesIndex: number,
          mappingMap: Map<TPatternFace, FaceMapping>,
          faceMap: Map<TPatternFace, TPatternFace>,
          faceInverseMap: Map<TPatternFace, TPatternFace>,
          vertexMap: Map<TPatternVertex, TPatternVertex>,
          vertexInverseMap: Map<TPatternVertex, TPatternVertex>,
        ): void => {
          assertEnabled() && assert( vertexMap.size === vertexInverseMap.size );

          // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}orderedFacesIndex: ${orderedFacesIndex}` );
          // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}mappingMap: ${[ ...mappingMap ].map( pair => `${pair[ 0 ].index} => ${pair[ 1 ]}` ).join( ', ' )}` );
          // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}faceMap: ${[ ...faceMap ].map( pair => `${pair[ 0 ].index} => ${pair[ 1 ].index}` ).join( ', ' )}` );
          // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}vertexMap: ${[ ...vertexMap ].map( pair => `${pair[ 0 ].index} => ${pair[ 1 ].index}` ).join( ', ' )}` );

          if ( orderedFacesIndex === orderedFaces.length ) {
            // We found one!!!

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

            // console.log( Embedding.fromMaps(
            //   vertexMap,
            //   nonExitEdgeMap,
            //   exitEdgeMap,
            //   sectorMap,
            //   faceMap,
            // ).toString() );

            embeddings.push( Embedding.fromMaps(
              pattern,
              board,
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

            // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}patternFace: ${patternFace.index}` );
            // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}matchingEdgeIndex: ${matchingEdgeIndex}` );
            // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}matchingVertexIndex: ${matchingVertexIndex}` );

            if ( matchingEdgeIndex >= 0 ) {
              // Yay, we share an edge with a previous face! We have a FIXED face with a FIXED mapping (if it is valid at all)
              // We'll reuse faceMap/vertexMap, since if we fail here, we will fail for other mappings where no copies are made.

              // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}edge-match` );

              const patternEdge = patternFace.edges[ matchingEdgeIndex ];
              const patternVertexA = patternEdge.vertices[ 0 ];
              const patternVertexB = patternEdge.vertices[ 1 ];
              const targetVertexA = vertexMap.get( patternVertexA )!;
              const targetVertexB = vertexMap.get( patternVertexB )!;

              // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}connecting pattern vertices ${patternVertexA.index},${patternVertexB.index} and equivalent ${targetVertexA.index},${targetVertexB.index}` );

              const previousPatternFace = patternEdge.faces[ 0 ] === patternFace ? patternEdge.faces[ 1 ] : patternEdge.faces[ 0 ];
              const previousTargetFace = faceMap.get( previousPatternFace )!;
              assertEnabled() && assert( previousTargetFace );

              const targetEdge = previousTargetFace.edges.find( edge => edge.vertices.includes( targetVertexA ) && edge.vertices.includes( targetVertexB ) )!;
              assertEnabled() && assert( targetEdge );

              const targetFace = targetEdge.faces[ 0 ] === previousTargetFace ? targetEdge.faces[ 1 ] : targetEdge.faces[ 0 ];

              // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}targetFace: ${targetFace.index}` );

              // Bail if our target face is an exit face
              if ( targetFace.isExit ) {
                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}IS_EXIT bail` );
                return;
              }

              // Bail if we've already mapped this face (can't have duplicates)
              if ( faceInverseMap.has( targetFace ) ) {
                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}DUPLICATE bail` );
                return;
              }

              const patternVertexAIndex = patternFace.vertices.indexOf( patternVertexA );
              const patternVertexBIndex = patternFace.vertices.indexOf( patternVertexB );

              const targetVertexAIndex = targetFace.vertices.indexOf( targetVertexA );
              const targetVertexBIndex = targetFace.vertices.indexOf( targetVertexB );

              // TODO: inspect the mapping we are creating, our adjacency check is failing below.
              const isPatternForward = ( ( patternVertexAIndex + 1 ) % patternFace.vertices.length ) === patternVertexBIndex;
              const isTargetForward = ( ( targetVertexAIndex + 1 ) % targetFace.vertices.length ) === targetVertexBIndex;

              const direction = isPatternForward === isTargetForward ? 1 : -1;
              // const offset = ( targetVertexAIndex - patternVertexAIndex + patternFace.vertices.length ) % patternFace.vertices.length;
              const offset = ( targetVertexAIndex - patternVertexAIndex * direction + patternFace.vertices.length ) % patternFace.vertices.length;

              const mapping = new FaceMapping( patternFace.vertices.length, offset, direction );

              // console.log( 'patternVertexAIndex', patternVertexAIndex );
              // console.log( 'patternVertexBIndex', patternVertexBIndex );
              // console.log( 'targetVertexAIndex', targetVertexAIndex );
              // console.log( 'targetVertexBIndex', targetVertexBIndex );
              // console.log( 'isPatternForward', isPatternForward );
              // console.log( 'isTargetForward', isTargetForward );
              // console.log( 'direction', direction );
              // console.log( 'offset', offset );
              // console.log( 'mapping.mapVertexIndex( patternVertexAIndex )', mapping.mapVertexIndex( patternVertexAIndex ) );
              // console.log( 'mapping.mapVertexIndex( patternVertexBIndex )', mapping.mapVertexIndex( patternVertexBIndex ) );
              assertEnabled() && assert( mapping.mapVertexIndex( patternVertexAIndex ) === targetVertexAIndex );
              assertEnabled() && assert( mapping.mapVertexIndex( patternVertexBIndex ) === targetVertexBIndex );

              // Check adjacent face orders and exit status
              if ( !checkMappingAdjacencyOrders( patternFace, targetFace, mapping ) ) {
                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}ADJANCENCY bail` );
                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}mapping ${mapping.toString()}` );
                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}mapping info ${mapping.toDetailedString( patternFace, targetFace )}` );
                return;
              }

              // Process face
              faceMap.set( patternFace, targetFace );
              faceInverseMap.set( targetFace, patternFace );
              if ( faceMap.size !== faceInverseMap.size ) {
                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}FACE MAP SIZE bail` );
                return;
              }

              // Check and process vertices
              for ( let i = 0; i < patternFace.vertices.length; i++ ) {
                const patternVertex = patternFace.vertices[ i ];
                const targetVertex = targetFace.vertices[ mapping.mapVertexIndex( i ) ];

                if ( vertexMap.has( patternVertex ) ) {
                  if ( vertexMap.get( patternVertex ) !== targetVertex ) {
                    // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}VERTEX FORWARD BAIL: ${patternVertex.index} => ${targetVertex.index}, but already have ${vertexMap.get( patternVertex )?.index}` );
                    return;
                  }
                }
                else {
                  vertexMap.set( patternVertex, targetVertex );
                }
                if ( vertexInverseMap.has( targetVertex ) ) {
                  if ( vertexInverseMap.get( targetVertex ) !== patternVertex ) {
                    // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}VERTEX INVERSE BAIL: ${targetVertex.index} => ${patternVertex.index}, but already have ${vertexInverseMap.get( targetVertex )?.index}` );
                    return;
                  }
                }
                else {
                  vertexInverseMap.set( targetVertex, patternVertex );
                }

                assertEnabled() && assert( vertexMap.size === vertexInverseMap.size );
              }

              mappingMap.set( patternFace, mapping );

              recur( orderedFacesIndex + 1, mappingMap, faceMap, faceInverseMap, vertexMap, vertexInverseMap );
            }
            else {
              // Well, we're connected, so we share a vertex with a previous face. For each candidate face, we'll have
              // two mappings, so we'll need to try both (backtrack) with copies of face/vertex maps. Lots of fun.

              assertEnabled() && assert( matchingVertexIndex >= 0, 'If this is not satisfied, we have disconnected components OR orderedFaces order is bad' );

              // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}vertex-match` );

              // NOTE: we can avoid previously-mapped faces AND we can avoid faces adjacent to those (since they would have a shared edge).

              const patternVertex = patternFace.vertices[ matchingVertexIndex ];
              const targetVertex = vertexMap.get( patternVertex )!;

              // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}patternVertex: ${patternVertex.index}` );
              // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}targetVertex: ${targetVertex.index}` );

              // console.log( `    vertex ${patternVertex.index} -> ${targetVertex.index}` );

              // console.log( `      non-exit faces: ${targetVertex.faces.filter( face => !face.isExit ).map( face => face.index ).join( ', ' )}` );
              // console.log( `      faceInverseMap keys: ${[ ...faceInverseMap.keys() ].map( face => face.index ).join( ', ' )}` );

              // NOTE: so we can avoid other checks, we'll just check all of the non-mapped faces for a match
              const candidateTargetFaces = targetVertex.faces.filter( face => !face.isExit && !faceInverseMap.has( face ) );

              for ( const targetFace of candidateTargetFaces ) {

                // console.log( `  ${_.repeat( '  ', orderedFacesIndex )}targetFace: ${targetFace.index}` );

                // console.log( `      candidate face ${targetFace.index}` );
                const patternVertexIndex = patternFace.vertices.indexOf( patternVertex );
                const targetVertexIndex = targetFace.vertices.indexOf( targetVertex );

                // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}patternVertexIndex: ${patternVertexIndex}` );
                // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}targetVertexIndex: ${targetVertexIndex}` );

                assertEnabled() && assert( patternVertexIndex >= 0 );
                assertEnabled() && assert( targetVertexIndex >= 0 );

                for ( const direction of [ 1, -1 ] as const ) {

                  // const offset = ( targetVertexIndex - patternVertexIndex + patternFace.vertices.length ) % patternFace.vertices.length;
                  const offset = ( targetVertexIndex - patternVertexIndex * direction + patternFace.vertices.length ) % patternFace.vertices.length;

                  // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}offset: ${offset}` );

                  // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}direction: ${direction}` );
                  const mapping = new FaceMapping( patternFace.vertices.length, offset, direction );

                  if ( !checkMappingAdjacencyOrders( patternFace, targetFace, mapping ) ) {
                    // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}FAIL ADJACENCY BAIL` );
                    continue;
                  }

                  // TODO: isolate things into functions, so we COULD just do a "return"
                  let success = true;

                  const newVertexMap = new Map( vertexMap );
                  const newVertexInverseMap = new Map( vertexInverseMap );

                  // Check and process vertices
                  // TODO: this code is somewhat duplicated, can we refactor?
                  for ( let i = 0; i < patternFace.vertices.length; i++ ) {
                    const patternVertex = patternFace.vertices[ i ];
                    const targetVertex = targetFace.vertices[ mapping.mapVertexIndex( i ) ];

                    if ( newVertexMap.has( patternVertex ) ) {
                      if ( newVertexMap.get( patternVertex ) !== targetVertex ) {
                        // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}FAIL VERTEX FORWARD BAIL: ${patternVertex.index} => ${targetVertex.index}, but already have ${newVertexMap.get( patternVertex )?.index}` );
                        success = false;
                        break;
                      }
                    }
                    else {
                      newVertexMap.set( patternVertex, targetVertex );
                    }
                    if ( newVertexInverseMap.has( targetVertex ) ) {
                      if ( newVertexInverseMap.get( targetVertex ) !== patternVertex ) {
                        // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}FAIL VERTEX INVERSE BAIL: ${targetVertex.index} => ${patternVertex.index}, but already have ${newVertexInverseMap.get( targetVertex )?.index}` );
                        success = false;
                        break;
                      }
                    }
                    else {
                      newVertexInverseMap.set( targetVertex, patternVertex );
                    }

                    assertEnabled() && assert( newVertexMap.size === newVertexInverseMap.size );
                  }
                  if ( !success ) {
                    continue;
                  }

                  const newFaceMap = new Map( faceMap );
                  const newFaceInverseMap = new Map( faceInverseMap );

                  // Process face
                  newFaceMap.set( patternFace, targetFace );
                  newFaceInverseMap.set( targetFace, patternFace );
                  if ( newFaceMap.size !== newFaceInverseMap.size ) {
                    // console.log( `   ${_.repeat( '  ', orderedFacesIndex )}FAIL FACE MAP SIZE BAIL` );
                    continue;
                  }

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

    // console.log( 'vertex matching' );

    const patternVertex = pattern.vertices[ 0 ];
    assertEnabled() && assert( patternVertex.edges.length === pattern.edges.length );

    const realEdges = patternVertex.edges.filter( edge => !edge.isExit );
    const patternOrder = patternVertex.edges.filter( edge => !edge.isExit ).length;
    const isExit = patternVertex.isExit;

    // We'll scan in-pattern-edge-order. We'll store the "completed" sectors at each index (where we will have assigned
    // both edges of a sector at a given point) so we can prune the search space.
    const completedSectors: TPatternSector[][] = _.range( 0, patternOrder ).map( i => {
      const edge = realEdges[ i ];
      const edges = realEdges.slice( 0, i + 1 );

      // The sector both (a) has the newest edge, and (b) all edges in the sector have been discovered so far.
      return patternVertex.sectors.filter( sector => {
        return sector.edges.includes( edge ) && sector.edges.every( otherEdge => edges.includes( otherEdge ) );
      } );
    } );

    assertEnabled() && assert( completedSectors.flat().length === patternVertex.sectors.length );

    if ( assertEnabled() ) {
      // Checks some assumptions we make about how the pattern boards are created (allows efficiency below)
      if ( !patternVertex.isExit ) {
        assert( patternVertex.sectors.length === patternOrder );

        for ( let i = 0; i < patternOrder; i++ ) {
          const startEdge = patternVertex.edges[ i ];
          const endEdge = patternVertex.edges[ ( i + 1 ) % patternOrder ];

          const sector = patternVertex.sectors[ i ];
          const face = patternVertex.faces[ i ];

          assert( sector.edges.includes( startEdge ) );
          assert( sector.edges.includes( endEdge ) );
          assert( sector.face === face );
        }
      }
    }

    for ( const targetVertex of board.vertices ) {
      // console.log( `Vertex ${targetVertex.index}` );
      if ( isExit ) {
        // We'll still need enough edges and sectors
        if ( targetVertex.edges.length < patternOrder || targetVertex.sectors.length < patternVertex.sectors.length ) {
          // console.log( 'not enough edges or sectors' );
          continue;
        }
      }
      else {
        if ( targetVertex.isExit || targetVertex.edges.length !== patternOrder ) {
          // console.log( 'exit or does not match vertex order' );
          continue;
        }
        assertEnabled() && assert( targetVertex.sectors.length === patternOrder );
      }

      const vertexMap = new Map( [ [ patternVertex, targetVertex ] ] );

      const recur = (
        edgeIndex: number,
        edgeMap: Map<TPatternEdge, TPatternEdge>,
        sectorMap: Map<TPatternSector, TPatternSector>,
        usedTargetEdges: Set<TPatternEdge>,
      ) => {
        // console.log( `  ${_.repeat( '  ', edgeIndex )}edgeIndex: ${edgeIndex}` );
        // console.log( `  ${_.repeat( '  ', edgeIndex )}edgeMap: ${[ ...edgeMap ].map( pair => `${pair[ 0 ].index} => ${pair[ 1 ].index}` ).join( ', ' )}` );
        // console.log( `  ${_.repeat( '  ', edgeIndex )}usedTargetEdges: ${[ ...usedTargetEdges ].map( targetEdge => targetEdge.index ).join( ', ' )}` );
        if ( edgeIndex === patternOrder ) {
          // We found one!!!

          assertEnabled() && assert( edgeMap.size === realEdges.length );
          assertEnabled() && assert( sectorMap.size === pattern.sectors.length );

          const exitEdgeMap: Map<TPatternEdge, TPatternEdge[]> = isExit ? new Map( [
            [ patternVertex.exitEdge!, targetVertex.edges.filter( edge => !usedTargetEdges.has( edge ) ) ],
          ] ) : new Map();

          // Initialize with face mapping from sectors (e.g. non-exit faces)
          const faceMap = new Map( [ ...sectorMap.keys() ].map( sector => {
            return [ sector.face, sectorMap.get( sector )!.face ];
          } ) );

          if ( patternVertex.sectors.length === 0 ) {
            // If we have no sectors, we'll arbitrarily assign exit faces
            for ( const [ patternEdge, targetEdge ] of edgeMap ) {
              const patternExitFaceA = patternEdge.faces[ 0 ];
              const patternExitFaceB = patternEdge.faces[ 1 ];

              assertEnabled() && assert( patternExitFaceA.isExit && patternExitFaceB.isExit );

              faceMap.set( patternExitFaceA, targetEdge.faces[ 0 ] );
              faceMap.set( patternExitFaceB, targetEdge.faces[ 1 ] );
            }
          }
          else if ( !isExit ) {
            // Assign faces based on the sectors
            for ( const patternSector of pattern.sectors ) {
              const patternFace = patternSector.face;
              const targetSector = sectorMap.get( patternSector )!;
              const targetFace = targetSector.face;

              faceMap.set( patternFace, targetFace );
            }
          }
          else {
            // Handle single-edge exit faces
            for ( const exitFace of pattern.faces.filter( face => face.isExit ) ) {
              if ( exitFace.edges.length === 1 ) {
                const patternEdge = exitFace.edges[ 0 ];
                assertEnabled() && assert( patternEdge && exitFace.edges.length === 1 );

                const targetEdge = edgeMap.get( patternEdge )!;
                assertEnabled() && assert( targetEdge );

                const otherPatternFace = patternEdge.faces[ 0 ] === exitFace ? patternEdge.faces[ 1 ] : patternEdge.faces[ 0 ];
                const otherTargetFace = faceMap.get( otherPatternFace )!;
                assertEnabled() && assert( otherTargetFace );

                const exitTargetFace = targetEdge.faces[ 0 ] === otherTargetFace ? targetEdge.faces[ 1 ] : targetEdge.faces[ 0 ];
                assertEnabled() && assert( exitTargetFace );

                faceMap.set( exitFace, exitTargetFace );
              }
            }
          }

          embeddings.push( Embedding.fromMaps(
            pattern,
            board,
            vertexMap,
            edgeMap,
            exitEdgeMap,
            sectorMap,
            faceMap
          ) );
        }
        else {
          const patternEdge = realEdges[ edgeIndex ];
          const patternSectors = completedSectors[ edgeIndex ];

          // console.log( `  ${_.repeat( '  ', edgeIndex )}patternEdge: ${patternEdge.index}` );

          for ( const targetEdge of targetVertex.edges ) {
            // We ignore exit edges so we don't map a "real" edge to an "exit"
            if ( targetEdge.isExit || usedTargetEdges.has( targetEdge ) ) {
              continue;
            }

            const targetSectors: TPatternSector[] = [];
            let success = true;

            for ( const patternSector of patternSectors ) {
              const patternEdgeA = patternSector.edges[ 0 ];
              const patternEdgeB = patternSector.edges[ 1 ];

              const targetEdgeA = patternEdgeA === patternEdge ? targetEdge : edgeMap.get( patternEdgeA )!;
              const targetEdgeB = patternEdgeB === patternEdge ? targetEdge : edgeMap.get( patternEdgeB )!;
              assertEnabled() && assert( targetEdgeA && targetEdgeB );

              const targetSector = targetVertex.sectors.find( sector => {
                // For 2-order vertices, we need to also filter to not get duplicate sectors (since both sectors have equivalent edges).
                return sector.edges.includes( targetEdgeA ) && sector.edges.includes( targetEdgeB ) && ( patternOrder > 2 || !targetSectors.includes( sector ) );
              } ) ?? null;
              if ( targetSector ) {
                targetSectors.push( targetSector );
              }
              else {
                success = false;
                break;
              }
            }

            if ( success ) {
              const newEdgeMap = new Map( edgeMap );
              newEdgeMap.set( patternEdge, targetEdge );

              const newSectorMap = new Map( sectorMap );
              for ( let i = 0; i < patternSectors.length; i++ ) {
                newSectorMap.set( patternSectors[ i ], targetSectors[ i ] );
              }

              const newUsedTargetEdges = new Set( usedTargetEdges );
              newUsedTargetEdges.add( targetEdge );

              recur( edgeIndex + 1, newEdgeMap, newSectorMap, newUsedTargetEdges );
            }
          }
        }
      };

      recur( 0, new Map(), new Map(), new Set() );
    }
  }
  else if ( pattern.vertices.length === 0 && pattern.edges.length === 1 ) {
    // NOTE: we only find one embedding per edge here, because rules and symmetry. There are actually two embeddings

    const patternEdge = pattern.edges[ 0 ];

    for ( const targetEdge of board.edges.filter( boardEdge => !boardEdge.isExit ) ) {
      embeddings.push( Embedding.fromMaps(
        pattern,
        board,
        new Map(),
        new Map( [ [ patternEdge, targetEdge ] ] ),
        new Map(),
        new Map(),
        new Map( [
          [ patternEdge.faces[ 0 ], targetEdge.faces[ 0 ] ],
          [ patternEdge.faces[ 1 ], targetEdge.faces[ 1 ] ],
        ] )
      ) );
    }
  }
  else {
    throw new Error( 'pattern search not implemented generally yet' );
  }

  if ( assertEnabled() && pattern === board ) {
    // We should have the identity somewhere
    assert( embeddings.filter( embedding => embedding.isIdentityAutomorphism ).length === 1 );
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

  public toString(): string {
    return `FaceMapping( edgeCount=${this.edgeCount}, offset=${this.offset}, direction=${this.direction} )`;
  }

  public toDetailedString( patternFace: TPatternFace, targetFace: TPatternFace ): string {
    return `FaceMapping( vertices: ${_.range( 0, this.edgeCount ).map( i => {
      return `${patternFace.vertices[ i ].index} => ${targetFace.vertices[ this.mapVertexIndex( i ) ].index}`;
    } ).join( ', ' )}, edges: ${_.range( 0, this.edgeCount ).map( i => {
      const patternEdge = patternFace.edges[ i ];
      const targetEdge = targetFace.edges[ this.mapEdgeIndex( i ) ];
      return `#${patternEdge.index} (${patternEdge.vertices.map( v => v.index ).join( ',' )}) => #${targetEdge.index} (${targetEdge.vertices.map( v => v.index ).join( ',' )})`;
    } ).join( ', ' )} )`;
  }

  public static allForOrder( edgeCount: number ): FaceMapping[] {
    return [
      ..._.range( 0, edgeCount ).map( offset => new FaceMapping( edgeCount, offset, 1 ) ),
      ..._.range( 0, edgeCount ).map( offset => new FaceMapping( edgeCount, offset, -1 ) ),
    ];
  }
}