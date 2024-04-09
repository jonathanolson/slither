import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class BlackEdgeFeature implements TEmbeddableFeature {
  public constructor(
    public readonly edge: TPatternEdge
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return isEdgeBlack( this.edge );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return getFormula( this.edge );
  }

  public applyEmbedding( embedding: Embedding ): BlackEdgeFeature[] {
    if ( this.edge.isExit ) {
      // WE DO NOT EMBED BLACK EXIT EDGES
      return [];
    }
    else {
      return [ new BlackEdgeFeature( embedding.mapNonExitEdge( this.edge ) ) ];
    }
  }

  public equals( other: TFeature ): boolean {
    return other instanceof BlackEdgeFeature && other.edge === this.edge;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof BlackEdgeFeature && other.edge.index === this.edge.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'black-edge',
      edge: this.edge.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'black-edge' }, patternBoard: TPatternBoard ): BlackEdgeFeature {
    return new BlackEdgeFeature( patternBoard.edges[ serialized.edge ] );
  }
}