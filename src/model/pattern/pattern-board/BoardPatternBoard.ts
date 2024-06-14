// Adapter from TBoard to TPatternBoard
import { BasePatternBoard } from './BasePatternBoard.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TSector } from '../../data/sector-state/TSector.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TPatternFace } from './TPatternFace.ts';
import { getSectorFromEdgePair } from '../../data/sector-state/getSectorFromEdgePair.ts';

export class BoardPatternBoard extends BasePatternBoard {
  private readonly vertexToIndexMap: Map<TVertex, number>;

  private readonly edgeToPatternEdgeMap: Map<TEdge, TPatternEdge> = new Map();
  private readonly patternEdgeToEdgeMap: Map<TPatternEdge, TEdge> = new Map();

  private readonly sectorToPatternSectorMap: Map<TSector, TPatternSector> = new Map();
  private readonly patternSectorToSectorMap: Map<TPatternSector, TSector> = new Map();

  private outsidePatternFace: TPatternFace | null = null;
  private readonly faceToPatternFaceMap: Map<TFace, TPatternFace> = new Map();
  private readonly patternFaceToFaceMap: Map<TPatternFace, TFace | null> = new Map();

  public constructor(public readonly board: TBoard) {
    const vertexToIndexMap = new Map(board.vertices.map((vertex, index) => [vertex, index]));
    const getVertexIndex = (vertex: TVertex) => {
      const index = vertexToIndexMap.get(vertex)!;
      assertEnabled() && assert(index !== undefined);
      return index;
    };

    super({
      numNonExitVertices: board.vertices.length,
      numExitVertices: 0,
      type: 'faces',
      vertexLists: [
        ...board.faces.map((face) => face.vertices.map(getVertexIndex)),
        board.outerBoundary.map((halfEdge) => getVertexIndex(halfEdge.start)),
        ...board.innerBoundaries.map((innerBoundary) =>
          innerBoundary.map((halfEdge) => getVertexIndex(halfEdge.start)),
        ),
      ],
    });

    // We shouldn't have "exit" anything in the board
    assertEnabled() && assert(this.vertices.length === board.vertices.length);
    assertEnabled() && assert(this.edges.length === board.edges.length);
    assertEnabled() && assert(this.faces.length === board.faces.length + 1 + board.innerBoundaries.length);

    this.vertexToIndexMap = vertexToIndexMap;

    this.edges.forEach((patternEdge, index) => {
      assertEnabled() && assert(patternEdge.vertices.length === 2);

      const vertexA = this.getVertex(patternEdge.vertices[0]);
      const vertexB = this.getVertex(patternEdge.vertices[1]);

      const edge = vertexA.getEdgeTo(vertexB)!;
      assertEnabled() && assert(edge);

      this.edgeToPatternEdgeMap.set(edge, patternEdge);
      this.patternEdgeToEdgeMap.set(patternEdge, edge);
    });

    this.sectors.forEach((patternSector) => {
      assertEnabled() && assert(patternSector.edges.length === 2);

      const edgeA = this.getEdge(patternSector.edges[0]);
      const edgeB = this.getEdge(patternSector.edges[1]);

      const sector = getSectorFromEdgePair(edgeA, edgeB);

      this.sectorToPatternSectorMap.set(sector, patternSector);
      this.patternSectorToSectorMap.set(patternSector, sector);
    });

    this.faces.forEach((patternFace) => {
      assertEnabled() && assert(patternFace.sectors.length >= 3);

      const sector = this.getSector(patternFace.sectors[0]);

      const face = sector.face;

      if (face === null) {
        // TODO: support holes better
        this.outsidePatternFace = patternFace;
      } else {
        this.faceToPatternFaceMap.set(face, patternFace);
      }
      this.patternFaceToFaceMap.set(patternFace, face);
    });
  }

  public getVertex(patternVertex: TPatternVertex): TVertex {
    const index = patternVertex.index;
    assertEnabled() && assert(index >= 0 && index < this.vertices.length);

    return this.board.vertices[index];
  }

  public getPatternVertex(vertex: TVertex): TPatternVertex {
    const index = this.vertexToIndexMap.get(vertex)!;
    assertEnabled() && assert(index !== undefined);

    return this.vertices[index];
  }

  public getEdge(patternEdge: TPatternEdge): TEdge {
    const edge = this.patternEdgeToEdgeMap.get(patternEdge)!;
    assertEnabled() && assert(edge !== undefined);

    return edge;
  }

  public getPatternEdge(edge: TEdge): TPatternEdge {
    const patternEdge = this.edgeToPatternEdgeMap.get(edge)!;
    assertEnabled() && assert(patternEdge !== undefined);

    return patternEdge;
  }

  public getSector(patternSector: TPatternSector): TSector {
    const sector = this.patternSectorToSectorMap.get(patternSector)!;
    assertEnabled() && assert(sector !== undefined);

    return sector;
  }

  public getPatternSector(sector: TSector): TPatternSector {
    const patternSector = this.sectorToPatternSectorMap.get(sector)!;
    assertEnabled() && assert(patternSector !== undefined);

    return patternSector;
  }

  public getFace(patternFace: TPatternFace): TFace | null {
    const face = this.patternFaceToFaceMap.get(patternFace)!;
    assertEnabled() && assert(face !== undefined);

    return face;
  }

  public getPatternFace(face: TFace): TPatternFace {
    const patternFace = this.faceToPatternFaceMap.get(face)!;
    assertEnabled() && assert(patternFace !== undefined);

    return patternFace;
  }

  public getOutsidePatternFace(): TPatternFace {
    assertEnabled() && assert(this.outsidePatternFace !== null);
    return this.outsidePatternFace!;
  }
}
