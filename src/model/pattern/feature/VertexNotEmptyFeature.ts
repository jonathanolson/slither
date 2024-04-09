import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternVertex } from '../TPatternVertex.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicOr } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class VertexNotEmptyFeature implements TEmbeddableFeature {
  public constructor(
    public readonly vertex: TPatternVertex
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return this.vertex.edges.some( edge => isEdgeBlack( edge ) );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicOr( this.vertex.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new VertexNotEmptyFeature( embedding.mapVertex( this.vertex ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof VertexNotEmptyFeature && other.vertex === this.vertex;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof VertexNotEmptyFeature && other.vertex.index === this.vertex.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) || ( feature instanceof BlackEdgeFeature && feature.edge.vertices.includes( this.vertex ) ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'vertex-not-empty',
      vertex: this.vertex.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'vertex-not-empty' }, patternBoard: TPatternBoard ): VertexNotEmptyFeature {
    return new VertexNotEmptyFeature( patternBoard.vertices[ serialized.vertex ] );
  }
}