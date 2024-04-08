import { BasePatternBoard } from './BasePatternBoard.ts';
import { TPlanarMappedPatternBoard } from './TPlanarMappedPatternBoard.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { TPlanarPatternMap } from './TPlanarPatternMap.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { Vector2 } from 'phet-lib/dot';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getSectorFromEdgePair } from '../data/sector-state/getSectorFromEdgePair.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TEdge } from '../board/core/TEdge.ts';

export class FacesPatternBoard extends BasePatternBoard implements TPlanarMappedPatternBoard {

  public readonly patternBoard: this;
  public readonly planarPatternMap: TPlanarPatternMap;

  // TODO: identify each "unique" type of face in a source board, then start building from there
  // TODO: serialize our TPlanarPatternMap(!)
  public constructor(
    public readonly originalBoard: TBoard,
    public readonly originalBoardFaces: TFace[]
  ) {
    const boardVertices = new Set<TVertex>();
    const boardEdges = new Set<TEdge>();
    originalBoardFaces.forEach( face => {
      face.vertices.forEach( vertex => {
        boardVertices.add( vertex );
      } );
      face.edges.forEach( edge => {
        boardEdges.add( edge );
      } );
    } );
    const boardEdgeList = Array.from( boardEdges );

    const exitBoardVertices: TVertex[] = [];
    const nonExitBoardVertices: TVertex[] = [];
    for ( const vertex of boardVertices ) {
      if ( vertex.faces.every( face => originalBoardFaces.includes( face ) ) ) {
        nonExitBoardVertices.push( vertex );
      }
      else {
        exitBoardVertices.push( vertex );
      }
    }

    const orderedVertices = [
      ...nonExitBoardVertices,
      ...exitBoardVertices
    ];

    super( {
      numNonExitVertices: nonExitBoardVertices.length,
      numExitVertices: exitBoardVertices.length,
      type: 'faces',
      vertexLists: originalBoardFaces.map( face => {
        return face.vertices.map( vertex => orderedVertices.indexOf( vertex ) );
      } )
    } );

    const vertexMap: Map<TPatternVertex, Vector2> = new Map( orderedVertices.map( ( vertex, index ) => [ this.vertices[ index ], vertex.viewCoordinates ] ) );

    const edgeMap = new Map<TPatternEdge, [ Vector2, Vector2 ]>();
    this.edges.forEach( edge => {
      if ( !edge.isExit ) {
        const vertexA = orderedVertices[ edge.vertices[ 0 ].index ];
        const vertexB = orderedVertices[ edge.vertices[ 1 ].index ];

        edgeMap.set( edge, [ vertexA.viewCoordinates, vertexB.viewCoordinates ] );
      }
    } );

    const sectorMap = new Map<TPatternSector, [ Vector2, Vector2, Vector2 ]>();
    this.sectors.forEach( sector => {
      assertEnabled() && assert( sector.edges.length === 2 );

      const vertexA0 = orderedVertices[ sector.edges[ 0 ].vertices[ 0 ].index ];
      const vertexA1 = orderedVertices[ sector.edges[ 0 ].vertices[ 1 ].index ];
      const vertexB0 = orderedVertices[ sector.edges[ 1 ].vertices[ 0 ].index ];
      const vertexB1 = orderedVertices[ sector.edges[ 1 ].vertices[ 1 ].index ];

      const edgeA = boardEdgeList.find( edge => {
        return edge.vertices.includes( vertexA0 ) && edge.vertices.includes( vertexA1 );
      } )!;
      const edgeB = boardEdgeList.find( edge => {
        return edge.vertices.includes( vertexB0 ) && edge.vertices.includes( vertexB1 );
      } )!;
      assertEnabled() && assert( edgeA && edgeB );

      const boardSector = getSectorFromEdgePair( edgeA, edgeB );
      assertEnabled() && assert( boardSector );

      const startPoint = boardSector.start.viewCoordinates;
      const vertexPoint = boardSector.end.viewCoordinates;
      const endPoint = boardSector.next.end.viewCoordinates;

      sectorMap.set( sector, [ startPoint, vertexPoint, endPoint ] );
    } );

    const faceMap = new Map<TPatternFace, Vector2[]>();

    // Non-exit faces
    this.faces.forEach( face => {
      if ( !face.isExit ) {
        const boardVertices = face.vertices.map( vertex => orderedVertices[ vertex.index ] );
        const boardFace = originalBoardFaces.find( originalBoardFace => {
          return originalBoardFace.vertices.every( vertex => boardVertices.includes( vertex ) );
        } )!;
        assertEnabled() && assert( boardFace );

        const points = boardFace.vertices.map( vertex => vertex.viewCoordinates );
        faceMap.set( face, points );
      }
    } );

    // Exit faces
    this.faces.forEach( face => {
      if ( face.isExit ) {
        assertEnabled() && assert( face.edges.length === 1 );
        const edge = face.edges[ 0 ];

        const vertexA = orderedVertices[ edge.vertices[ 0 ].index ];
        const vertexB = orderedVertices[ edge.vertices[ 1 ].index ];
        assertEnabled() && assert( vertexA && vertexB );

        const boardEdge = boardEdgeList.find( edge => {
          return edge.vertices.includes( vertexA ) && edge.vertices.includes( vertexB );
        } )!;
        assertEnabled() && assert( boardEdge );

        const boardFace = originalBoardFaces.includes( boardEdge.faces[ 0 ] ) ? boardEdge.faces[ 1 ] : boardEdge.faces[ 0 ];
        assertEnabled() && assert( boardFace, 'Did we hit null as in --- edge of board? can we expand the search pattern?' );

        const points = [
          vertexA.viewCoordinates,
          vertexB.viewCoordinates,
          vertexA.viewCoordinates.average( vertexB.viewCoordinates ).average( boardFace.viewCoordinates )
        ];

        faceMap.set( face, points );
      }
    } );

    // Satisfy the TPlanarMappedPatternBoard interface
    this.patternBoard = this;
    this.planarPatternMap = {
      vertexMap: vertexMap,
      edgeMap: edgeMap,
      sectorMap: sectorMap,
      faceMap: faceMap
    };
  }
}