import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicNot } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class RedEdgeFeature implements TEmbeddableFeature {
  public constructor(
    public readonly edge: TPatternEdge
  ) {}

  public toCanonicalString(): string {
    return `red-${this.edge.index}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return !isEdgeBlack( this.edge );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicNot( getFormula( this.edge ) );
  }

  public embedded( embedding: Embedding ): RedEdgeFeature[] {
    if ( this.edge.isExit ) {
      // NOTE: Can potentially embed to multiple red edges
      return embedding.mapExitEdges( this.edge ).map( edge => new RedEdgeFeature( edge ) );
    }
    else {
      return [ new RedEdgeFeature( embedding.mapNonExitEdge( this.edge ) ) ];
    }
  }

  public equals( other: TFeature ): boolean {
    return other instanceof RedEdgeFeature && other.edge === this.edge;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof RedEdgeFeature && other.edge.index === this.edge.index;
  }

  public isSubsetOf( other: TFeature ): boolean {
    return this.equals( other );
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'red-edge',
      edge: this.edge.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'red-edge' }, patternBoard: TPatternBoard ): RedEdgeFeature {
    return new RedEdgeFeature( patternBoard.edges[ serialized.edge ] );
  }
}