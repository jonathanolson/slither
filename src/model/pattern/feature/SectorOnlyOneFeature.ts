import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternSector } from '../TPatternSector.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicExactlyOne } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class SectorOnlyOneFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === 1;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicExactlyOne( this.sector.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new SectorOnlyOneFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorOnlyOneFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorOnlyOneFeature && other.sector.index === this.sector.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    if ( otherFeatures.some( feature => this.equals( feature ) ) ) {
      return true;
    }

    let hasBlack = false;
    let hasRed = false;

    for ( const otherFeature of otherFeatures ) {
      if ( otherFeature instanceof BlackEdgeFeature && this.sector.edges.includes( otherFeature.edge ) ) {
        hasBlack = true;
      }
      else if ( otherFeature instanceof RedEdgeFeature && this.sector.edges.includes( otherFeature.edge ) ) {
        hasRed = true;
      }
    }

    return hasBlack && hasRed;
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'sector-only-one',
      sector: this.sector.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'sector-only-one' }, patternBoard: TPatternBoard ): SectorOnlyOneFeature {
    return new SectorOnlyOneFeature( patternBoard.sectors[ serialized.sector ] );
  }
}