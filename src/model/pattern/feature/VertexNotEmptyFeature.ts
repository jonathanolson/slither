import { Formula } from '../../logic/Formula.ts';
import { Term } from '../../logic/Term.ts';
import { logicOr } from '../../logic/operations.ts';
import { Embedding } from '../embedding/Embedding.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { TPatternVertex } from '../pattern-board/TPatternVertex.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TFeature } from './TFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';

export class VertexNotEmptyFeature implements TEmbeddableFeature {
  public constructor(public readonly vertex: TPatternVertex) {}

  public toCanonicalString(): string {
    return `vertex-not-empty-${this.vertex.index}`;
  }

  public isPossibleWith(isEdgeBlack: (edge: TPatternEdge) => boolean): boolean {
    return this.vertex.edges.some((edge) => isEdgeBlack(edge));
  }

  public getPossibleFormula(getFormula: (edge: TPatternEdge) => Term<TPatternEdge>): Formula<TPatternEdge> {
    return logicOr(this.vertex.edges.map((edge) => getFormula(edge)));
  }

  public embedded(embedding: Embedding): VertexNotEmptyFeature[] {
    return [new VertexNotEmptyFeature(embedding.mapVertex(this.vertex))];
  }

  public equals(other: TFeature): boolean {
    return other instanceof VertexNotEmptyFeature && other.vertex === this.vertex;
  }

  public indexEquals(other: TFeature): boolean {
    return other instanceof VertexNotEmptyFeature && other.vertex.index === this.vertex.index;
  }

  public isSubsetOf(other: TFeature): boolean {
    return this.equals(other);
  }

  public isRedundant(otherFeatures: TFeature[]): boolean {
    return otherFeatures.some(
      (feature) =>
        this.equals(feature) || (feature instanceof BlackEdgeFeature && feature.edge.vertices.includes(this.vertex)),
    );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'vertex-not-empty',
      vertex: this.vertex.index,
    };
  }

  public static deserialize(
    serialized: TSerializedEmbeddableFeature & { type: 'vertex-not-empty' },
    patternBoard: TPatternBoard,
  ): VertexNotEmptyFeature {
    return new VertexNotEmptyFeature(patternBoard.vertices[serialized.vertex]);
  }
}
