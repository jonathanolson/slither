import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternVertex } from '../TPatternVertex.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicNotAll } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class VertexNotPairFeature implements TEmbeddableFeature {
  public constructor(
    public readonly vertex: TPatternVertex,
    public readonly edgeA: TPatternEdge,
    public readonly edgeB: TPatternEdge
  ) {}

  public getCanonicalString(): string {
    const minEdge = Math.min( this.edgeA.index, this.edgeB.index );
    const maxEdge = Math.max( this.edgeA.index, this.edgeB.index );
    return `vertex-not-pair-${this.vertex.index}-${minEdge}-${maxEdge}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return isEdgeBlack( this.edgeA ) || isEdgeBlack( this.edgeB );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicNotAll( [ getFormula( this.edgeA ), getFormula( this.edgeB ) ] );
  }

  public applyEmbedding( embedding: Embedding ): VertexNotPairFeature[] {
    if ( this.edgeA.isExit ) {
      const exitEdges = embedding.mapExitEdges( this.edgeA );
      return exitEdges.map( edge => new VertexNotPairFeature( embedding.mapVertex( this.vertex ), edge, embedding.mapNonExitEdge( this.edgeB ) ) );
    }
    else if ( this.edgeB.isExit ) {
      const exitEdges = embedding.mapExitEdges( this.edgeB );
      return exitEdges.map( edge => new VertexNotPairFeature( embedding.mapVertex( this.vertex ), embedding.mapNonExitEdge( this.edgeA ), edge ) );
    }
    else {
      return [ new VertexNotPairFeature( embedding.mapVertex( this.vertex ), embedding.mapNonExitEdge( this.edgeA ), embedding.mapNonExitEdge( this.edgeB ) ) ];
    }
  }

  public equals( other: TFeature ): boolean {
    return other instanceof VertexNotPairFeature && other.vertex === this.vertex && (
      ( other.edgeA === this.edgeA && other.edgeB === this.edgeB ) ||
      ( other.edgeA === this.edgeB && other.edgeB === this.edgeA )
    );
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof VertexNotPairFeature && other.vertex.index === this.vertex.index && (
      ( other.edgeA.index === this.edgeA.index && other.edgeB.index === this.edgeB.index ) ||
      ( other.edgeA.index === this.edgeB.index && other.edgeB.index === this.edgeA.index )
    );
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) || (
      feature instanceof BlackEdgeFeature && feature.edge !== this.edgeA && feature.edge !== this.edgeB
    ) || (
                                            feature instanceof RedEdgeFeature && ( feature.edge === this.edgeA || feature.edge === this.edgeB )
                                          ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'vertex-not-pair',
      vertex: this.vertex.index,
      edgeA: this.edgeA.index,
      edgeB: this.edgeB.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'vertex-not-pair' }, patternBoard: TPatternBoard ): VertexNotPairFeature {
    return new VertexNotPairFeature(
      patternBoard.vertices[ serialized.vertex ],
      patternBoard.edges[ serialized.edgeA ],
      patternBoard.edges[ serialized.edgeB ]
    );
  }
}