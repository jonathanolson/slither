import { PolygonGenerator } from '../../board/PolygonGenerator.ts';
import { PolygonGeneratorBoard } from '../../board/core/PolygonGeneratorBoard.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { getSectorFromEdgePair } from '../../data/sector-state/getSectorFromEdgePair.ts';
import { BasePatternBoard } from './BasePatternBoard.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { arePatternBoardsIsomorphic } from './arePatternBoardsIsomorphic.ts';
import { TPlanarMappedPatternBoard } from './planar-map/TPlanarMappedPatternBoard.ts';
import { TPlanarPatternMap } from './planar-map/TPlanarPatternMap.ts';

import { Vector2 } from 'phet-lib/dot';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class FacesPatternBoard extends BasePatternBoard implements TPlanarMappedPatternBoard {
  // TODO: can we remove this self-reference?
  public readonly patternBoard: this;
  public readonly planarPatternMap: TPlanarPatternMap;

  public constructor(
    public readonly originalBoard: TBoard,
    public readonly originalBoardFaces: TFace[],
  ) {
    const boardVertices = new Set<TVertex>();
    const boardEdges = new Set<TEdge>();
    originalBoardFaces.forEach((face) => {
      face.vertices.forEach((vertex) => {
        boardVertices.add(vertex);
      });
      face.edges.forEach((edge) => {
        boardEdges.add(edge);
      });
    });
    const boardEdgeList = Array.from(boardEdges);

    const exitBoardVertices: TVertex[] = [];
    const nonExitBoardVertices: TVertex[] = [];
    for (const vertex of boardVertices) {
      if (vertex.faces.every((face) => originalBoardFaces.includes(face))) {
        nonExitBoardVertices.push(vertex);
      } else {
        exitBoardVertices.push(vertex);
      }
    }

    const orderedVertices = [...nonExitBoardVertices, ...exitBoardVertices];

    super({
      numNonExitVertices: nonExitBoardVertices.length,
      numExitVertices: exitBoardVertices.length,
      type: 'faces',
      vertexLists: originalBoardFaces.map((face) => {
        return face.vertices.map((vertex) => orderedVertices.indexOf(vertex));
      }),
    });

    const vertexMap: Map<TPatternVertex, Vector2> = new Map(
      orderedVertices.map((vertex, index) => [this.vertices[index], vertex.viewCoordinates]),
    );

    const edgeMap = new Map<TPatternEdge, [Vector2, Vector2]>();
    this.edges.forEach((edge) => {
      if (!edge.isExit) {
        const vertexA = orderedVertices[edge.vertices[0].index];
        const vertexB = orderedVertices[edge.vertices[1].index];

        edgeMap.set(edge, [vertexA.viewCoordinates, vertexB.viewCoordinates]);
      }
    });

    const sectorMap = new Map<TPatternSector, [Vector2, Vector2, Vector2]>();
    this.sectors.forEach((sector) => {
      assertEnabled() && assert(sector.edges.length === 2);

      const vertexA0 = orderedVertices[sector.edges[0].vertices[0].index];
      const vertexA1 = orderedVertices[sector.edges[0].vertices[1].index];
      const vertexB0 = orderedVertices[sector.edges[1].vertices[0].index];
      const vertexB1 = orderedVertices[sector.edges[1].vertices[1].index];

      const edgeA = boardEdgeList.find((edge) => {
        return edge.vertices.includes(vertexA0) && edge.vertices.includes(vertexA1);
      })!;
      const edgeB = boardEdgeList.find((edge) => {
        return edge.vertices.includes(vertexB0) && edge.vertices.includes(vertexB1);
      })!;
      assertEnabled() && assert(edgeA && edgeB);

      const boardSector = getSectorFromEdgePair(edgeA, edgeB);
      assertEnabled() && assert(boardSector);

      const startPoint = boardSector.start.viewCoordinates;
      const vertexPoint = boardSector.end.viewCoordinates;
      const endPoint = boardSector.next.end.viewCoordinates;

      sectorMap.set(sector, [startPoint, vertexPoint, endPoint]);
    });

    const faceMap = new Map<TPatternFace, Vector2[]>();

    // Non-exit faces
    this.faces.forEach((face) => {
      if (!face.isExit) {
        const boardVertices = face.vertices.map((vertex) => orderedVertices[vertex.index]);
        const boardFace = originalBoardFaces.find((originalBoardFace) => {
          return originalBoardFace.vertices.every((vertex) => boardVertices.includes(vertex));
        })!;
        assertEnabled() && assert(boardFace);

        const points = boardFace.vertices.map((vertex) => vertex.viewCoordinates);
        faceMap.set(face, points);
      }
    });

    // Exit faces
    this.faces.forEach((face) => {
      if (face.isExit) {
        assertEnabled() && assert(face.edges.length === 1);
        const edge = face.edges[0];

        const vertexA = orderedVertices[edge.vertices[0].index];
        const vertexB = orderedVertices[edge.vertices[1].index];
        assertEnabled() && assert(vertexA && vertexB);

        const boardEdge = boardEdgeList.find((edge) => {
          return edge.vertices.includes(vertexA) && edge.vertices.includes(vertexB);
        })!;
        assertEnabled() && assert(boardEdge);

        const boardFace = originalBoardFaces.includes(boardEdge.faces[0]) ? boardEdge.faces[1] : boardEdge.faces[0];
        assertEnabled() &&
          assert(boardFace, 'Did we hit null as in --- edge of board? can we expand the search pattern?');

        const points = [
          vertexA.viewCoordinates,
          vertexB.viewCoordinates,
          vertexA.viewCoordinates.average(vertexB.viewCoordinates).average(boardFace.viewCoordinates),
        ];

        faceMap.set(face, points);
      }
    });

    // Satisfy the TPlanarMappedPatternBoard interface
    this.patternBoard = this;
    this.planarPatternMap = {
      vertexMap: vertexMap,
      edgeMap: edgeMap,
      sectorMap: sectorMap,
      faceMap: faceMap,
    };
  }

  public static getSemiAdjacentFaces(board: TBoard, face: TFace): Set<TFace> {
    const set = new Set<TFace>();
    face.vertices.forEach((vertex) => {
      vertex.faces.forEach((f) => {
        if (f !== face) {
          set.add(f);
        }
      });
    });
    return set;
  }

  public static getFirstGeneration(board: TBoard): FacesPatternBoard[] {
    const orders = _.uniq(board.faces.map((face) => face.vertices.length));

    const averageVertex = board.vertices
      .map((v) => v.viewCoordinates)
      .reduce((a, b) => a.plus(b))
      .timesScalar(1 / board.vertices.length);

    return orders.map((order) => {
      const centermostFace = _.minBy(
        board.faces.filter((face) => face.vertices.length === order),
        (face) => face.viewCoordinates.distanceSquared(averageVertex),
      )!;
      assertEnabled() && assert(centermostFace);

      return new FacesPatternBoard(board, [centermostFace]);
    });
  }

  public static getNextGeneration(patternBoards: FacesPatternBoard[]): FacesPatternBoard[] {
    const nextGeneration: FacesPatternBoard[] = [];
    patternBoards.forEach((patternBoard) => {
      const potentialFaces = new Set<TFace>();
      patternBoard.originalBoardFaces.forEach((face) => {
        FacesPatternBoard.getSemiAdjacentFaces(patternBoard.originalBoard, face).forEach((f) => {
          if (!patternBoard.originalBoardFaces.includes(f)) {
            potentialFaces.add(f);
          }
        });
      });

      potentialFaces.forEach((face) => {
        const newFaces = [...patternBoard.originalBoardFaces, face];
        const newPatternBoard = new FacesPatternBoard(patternBoard.originalBoard, newFaces);
        if (!nextGeneration.some((p) => arePatternBoardsIsomorphic(p, newPatternBoard))) {
          nextGeneration.push(newPatternBoard);
        }
      });
    });
    return nextGeneration;
  }

  public static getFirstNGenerations(board: TBoard, n: number): FacesPatternBoard[][] {
    const firstGeneration = FacesPatternBoard.getFirstGeneration(board);

    const generations: FacesPatternBoard[][] = [firstGeneration];
    for (let i = 0; i < n - 1; i++) {
      generations.push(FacesPatternBoard.getNextGeneration(generations[generations.length - 1]));
    }
    return generations;
  }

  public static getUniformTilingGenerations(generator: PolygonGenerator, n: number): FacesPatternBoard[][] {
    const board = PolygonGeneratorBoard.get(generator, {
      // TODO: make this variable
      width: 15,
      height: 15,
    });

    return FacesPatternBoard.getFirstNGenerations(board, n);
  }
}
