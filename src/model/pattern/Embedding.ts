import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';

export class Embedding {

  public constructor(
    // TODO: consider alternate implementation with fewer objects?
    public readonly vertexMap: Map<TPatternVertex, TPatternVertex>,
    public readonly nonExitEdgeMap: Map<TPatternEdge, TPatternEdge>,
    public readonly exitEdgeMap: Map<TPatternEdge, TPatternEdge[]>,
    public readonly sectorMap: Map<TPatternSector, TPatternSector>,
    public readonly faceMap: Map<TPatternFace, TPatternFace>,
  ) {}

  public mapVertex( vertex: TPatternVertex ): TPatternVertex {
    const result = this.vertexMap.get( vertex )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapNonExitEdge( edge: TPatternEdge ): TPatternEdge {
    const result = this.nonExitEdgeMap.get( edge )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapExitEdges( edge: TPatternEdge ): TPatternEdge[] {
    const result = this.exitEdgeMap.get( edge )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapSector( sector: TPatternSector ): TPatternSector {
    const result = this.sectorMap.get( sector )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapFace( face: TPatternFace ): TPatternFace {
    const result = this.faceMap.get( face )!;
    assertEnabled() && assert( result );

    return result;
  }

  public equals( embedding: Embedding ): boolean {
    return (
      this.vertexMap.size === embedding.vertexMap.size &&
      this.nonExitEdgeMap.size === embedding.nonExitEdgeMap.size &&
      this.exitEdgeMap.size === embedding.exitEdgeMap.size &&
      this.sectorMap.size === embedding.sectorMap.size &&
      this.faceMap.size === embedding.faceMap.size &&
      Array.from( this.vertexMap ).every( ( [ vertex, mappedVertex ] ) => embedding.vertexMap.get( vertex ) === mappedVertex ) &&
      Array.from( this.nonExitEdgeMap ).every( ( [ edge, mappedEdge ] ) => embedding.nonExitEdgeMap.get( edge ) === mappedEdge ) &&
      Array.from( this.exitEdgeMap ).every( ( [ edge, mappedEdges ] ) => embedding.exitEdgeMap.get( edge ) === mappedEdges ) &&
      Array.from( this.sectorMap ).every( ( [ sector, mappedSector ] ) => embedding.sectorMap.get( sector ) === mappedSector ) &&
      Array.from( this.faceMap ).every( ( [ face, mappedFace ] ) => embedding.faceMap.get( face ) === mappedFace )
    );
  }
}