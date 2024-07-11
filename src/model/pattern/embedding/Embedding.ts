import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { TPatternFace } from '../pattern-board/TPatternFace.ts';
import { TPatternSector } from '../pattern-board/TPatternSector.ts';
import { TPatternVertex } from '../pattern-board/TPatternVertex.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class Embedding {
  public readonly isAutomorphism: boolean;
  public readonly isIdentityAutomorphism: boolean;

  // Defined if it is an automorphism
  private readonly vertexInverseMap?: Map<TPatternVertex, TPatternVertex>;
  private readonly edgeInverseMap?: Map<TPatternEdge, TPatternEdge>;
  private readonly sectorInverseMap?: Map<TPatternSector, TPatternSector>;
  private readonly faceInverseMap?: Map<TPatternFace, TPatternFace>;

  private constructor(
    public readonly sourcePatternBoard: TPatternBoard,
    public readonly targetPatternBoard: TPatternBoard,
    // TODO: consider alternate implementation with fewer objects?
    private readonly vertexMap: Map<TPatternVertex, TPatternVertex>,
    private readonly nonExitEdgeMap: Map<TPatternEdge, TPatternEdge>,
    private readonly exitEdgeMap: Map<TPatternEdge, TPatternEdge[]>,
    private readonly sectorMap: Map<TPatternSector, TPatternSector>,
    private readonly faceMap: Map<TPatternFace, TPatternFace>,
  ) {
    this.isAutomorphism = sourcePatternBoard === targetPatternBoard;

    if (this.isAutomorphism) {
      this.vertexInverseMap = new Map(Array.from(vertexMap).map(([key, value]) => [value, key]));
      this.sectorInverseMap = new Map(Array.from(sectorMap).map(([key, value]) => [value, key]));
      this.faceInverseMap = new Map(Array.from(faceMap).map(([key, value]) => [value, key]));

      this.edgeInverseMap = new Map([
        ...(Array.from(nonExitEdgeMap).map(([key, value]) => [value, key]) as [TPatternEdge, TPatternEdge][]),
        ...(Array.from(exitEdgeMap).map(([key, value]) => {
          assertEnabled() && assert(value.length === 1);

          return [value[0], key];
        }) as [TPatternEdge, TPatternEdge][]),
      ]);
    }

    this.isIdentityAutomorphism = this.computeIsIdentityAutomorphism();
  }

  public static fromMaps(
    sourcePatternBoard: TPatternBoard,
    targetPatternBoard: TPatternBoard,
    // TODO: consider alternate implementation with fewer objects?
    vertexMap: Map<TPatternVertex, TPatternVertex>,
    nonExitEdgeMap: Map<TPatternEdge, TPatternEdge>,
    exitEdgeMap: Map<TPatternEdge, TPatternEdge[]>,
    sectorMap: Map<TPatternSector, TPatternSector>,
    faceMap: Map<TPatternFace, TPatternFace>,
  ) {
    return new Embedding(
      sourcePatternBoard,
      targetPatternBoard,
      vertexMap,
      nonExitEdgeMap,
      exitEdgeMap,
      sectorMap,
      faceMap,
    );
  }

  public getVertexMap(): Map<TPatternVertex, TPatternVertex> {
    return this.vertexMap;
  }

  public getNonExitEdgeMap(): Map<TPatternEdge, TPatternEdge> {
    return this.nonExitEdgeMap;
  }

  public getExitEdgeMap(): Map<TPatternEdge, TPatternEdge[]> {
    return this.exitEdgeMap;
  }

  public getSectorMap(): Map<TPatternSector, TPatternSector> {
    return this.sectorMap;
  }

  public getFaceMap(): Map<TPatternFace, TPatternFace> {
    return this.faceMap;
  }

  public mapVertex(vertex: TPatternVertex): TPatternVertex {
    const result = this.vertexMap.get(vertex)!;
    assertEnabled() && assert(result);

    return result;
  }

  public mapNonExitEdge(edge: TPatternEdge): TPatternEdge {
    const result = this.nonExitEdgeMap.get(edge)!;
    // assertEnabled() && assert(result);

    return result;
  }

  public mapExitEdges(edge: TPatternEdge): TPatternEdge[] {
    const result = this.exitEdgeMap.get(edge)!;
    // assertEnabled() && assert(result);

    return result;
  }

  public mapSector(sector: TPatternSector): TPatternSector {
    const result = this.sectorMap.get(sector)!;
    assertEnabled() && assert(result);

    return result;
  }

  public mapFace(face: TPatternFace): TPatternFace {
    const result = this.faceMap.get(face)!;
    // assertEnabled() && assert(result);

    return result;
  }

  public inverseMapVertex(vertex: TPatternVertex): TPatternVertex {
    const result = this.vertexInverseMap!.get(vertex)!;
    assertEnabled() && assert(result);

    return result;
  }

  public inverseMapEdge(edge: TPatternEdge): TPatternEdge {
    const result = this.edgeInverseMap!.get(edge)!;
    assertEnabled() && assert(result);

    return result;
  }

  public inverseMapSector(sector: TPatternSector): TPatternSector {
    const result = this.sectorInverseMap!.get(sector)!;
    assertEnabled() && assert(result);

    return result;
  }

  public inverseMapFace(face: TPatternFace): TPatternFace {
    const result = this.faceInverseMap!.get(face)!;
    assertEnabled() && assert(result);

    return result;
  }

  public equals(embedding: Embedding): boolean {
    return (
      this.vertexMap.size === embedding.vertexMap.size &&
      this.nonExitEdgeMap.size === embedding.nonExitEdgeMap.size &&
      this.exitEdgeMap.size === embedding.exitEdgeMap.size &&
      this.sectorMap.size === embedding.sectorMap.size &&
      this.faceMap.size === embedding.faceMap.size &&
      Array.from(this.vertexMap).every(([vertex, mappedVertex]) => embedding.vertexMap.get(vertex) === mappedVertex) &&
      Array.from(this.nonExitEdgeMap).every(
        ([edge, mappedEdge]) => embedding.nonExitEdgeMap.get(edge) === mappedEdge,
      ) &&
      Array.from(this.exitEdgeMap).every(([edge, mappedEdges]) => embedding.exitEdgeMap.get(edge) === mappedEdges) &&
      Array.from(this.sectorMap).every(([sector, mappedSector]) => embedding.sectorMap.get(sector) === mappedSector) &&
      Array.from(this.faceMap).every(([face, mappedFace]) => embedding.faceMap.get(face) === mappedFace)
    );
  }

  public toString(): string {
    return (
      `Embedding(\n` +
      `  vertexMap: ${[...this.vertexMap].map((pair) => `${pair[0].index} ${pair[0].isExit ? '->' : '=>'} ${pair[1].index}`).join(', ')}\n` +
      `  nonExitEdgeMap: ${[...this.nonExitEdgeMap].map((pair) => `${pair[0].index} => ${pair[1].index}`).join(', ')}\n` +
      `  exitEdgeMap: ${[...this.exitEdgeMap].map((pair) => `${pair[0].index} => [${pair[1].map((edge) => edge.index).join(', ')}]`).join(', ')}\n` +
      `  sectorMap: ${[...this.sectorMap].map((pair) => `${pair[0].index} => ${pair[1].index}`).join(', ')}\n` +
      `  faceMap: ${[...this.faceMap].map((pair) => `${pair[0].index} ${pair[0].isExit ? '->' : '=>'} ${pair[1].index}`).join(', ')}\n` +
      `)`
    );
  }

  private computeIsIdentityAutomorphism(): boolean {
    if (this.sourcePatternBoard !== this.targetPatternBoard) {
      return false;
    }

    for (const vertex of this.vertexMap.keys()) {
      if (this.vertexMap.get(vertex) !== vertex) {
        return false;
      }
    }

    for (const edge of this.nonExitEdgeMap.keys()) {
      if (this.nonExitEdgeMap.get(edge) !== edge) {
        return false;
      }
    }

    for (const edge of this.exitEdgeMap.keys()) {
      if (this.exitEdgeMap.get(edge)!.length !== 1 || this.exitEdgeMap.get(edge)![0] !== edge) {
        return false;
      }
    }

    for (const sector of this.sectorMap.keys()) {
      if (this.sectorMap.get(sector) !== sector) {
        return false;
      }
    }

    for (const face of this.faceMap.keys()) {
      if (this.faceMap.get(face) !== face) {
        return false;
      }
    }

    return true;
  }

  public serialize(): SerializedEmbedding {
    return {
      vertexMapping: this.sourcePatternBoard.vertices.map((vertex) => {
        assertEnabled() && assert(this.vertexMap.has(vertex));

        return this.vertexMap.get(vertex)!.index;
      }),
      edgeMapping: this.sourcePatternBoard.edges.map((edge) => {
        if (edge.isExit) {
          assertEnabled() && assert(this.exitEdgeMap.has(edge));

          return this.exitEdgeMap.get(edge)!.map((edge) => edge.index);
        } else {
          assertEnabled() && assert(this.nonExitEdgeMap.has(edge));

          return this.nonExitEdgeMap.get(edge)!.index;
        }
      }),
      sectorMapping: this.sourcePatternBoard.sectors.map((sector) => {
        assertEnabled() && assert(this.sectorMap.has(sector));

        return this.sectorMap.get(sector)!.index;
      }),
      faceMapping: this.sourcePatternBoard.faces.map((face) => {
        assertEnabled() && assert(this.faceMap.has(face));

        return this.faceMap.get(face)!.index;
      }),
    };
  }

  public static deserialize(
    sourcePatternBoard: TPatternBoard,
    targetPatternBoard: TPatternBoard,
    serialized: SerializedEmbedding,
  ): Embedding {
    return new Embedding(
      sourcePatternBoard,
      targetPatternBoard,
      new Map(
        sourcePatternBoard.vertices.map((vertex) => [
          vertex,
          targetPatternBoard.vertices[serialized.vertexMapping[vertex.index]],
        ]),
      ),
      new Map(
        sourcePatternBoard.edges
          .filter((edge) => !edge.isExit)
          .map((edge) => [edge, targetPatternBoard.edges[serialized.edgeMapping[edge.index] as number]]),
      ),
      new Map(
        sourcePatternBoard.edges
          .filter((edge) => edge.isExit)
          .map((edge) => [
            edge,
            (serialized.edgeMapping[edge.index] as number[]).map((index) => targetPatternBoard.edges[index]),
          ]),
      ),
      new Map(
        sourcePatternBoard.sectors.map((sector) => [
          sector,
          targetPatternBoard.sectors[serialized.sectorMapping[sector.index]],
        ]),
      ),
      new Map(
        sourcePatternBoard.faces.map((face) => [face, targetPatternBoard.faces[serialized.faceMapping[face.index]]]),
      ),
    );
  }
}

export type SerializedEmbedding = {
  vertexMapping: number[];
  edgeMapping: (number | number[])[];
  sectorMapping: number[];
  faceMapping: number[];
};
