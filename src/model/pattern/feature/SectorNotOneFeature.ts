import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternSector } from '../TPatternSector.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicNot1 } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class SectorNotOneFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public getCanonicalString(): string {
    return `sector-not-one-${this.sector.index}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount !== 1;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicNot1( this.sector.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): SectorNotOneFeature[] {
    return [ new SectorNotOneFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorNotOneFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorNotOneFeature && other.sector.index === this.sector.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    if ( otherFeatures.some( feature => this.equals( feature ) ) ) {
      return true;
    }

    // Track this, so we handle duplicated reds/blacks in our otherFeatures array robustly
    let firstEdgeBlack = false;
    let secondEdgeBlack = false;
    let firstEdgeRed = false;
    let secondEdgeRed = false;

    const firstEdge = this.sector.edges[ 0 ];
    const secondEdge = this.sector.edges[ 1 ];

    for ( const otherFeature of otherFeatures ) {
      if ( otherFeature instanceof BlackEdgeFeature ) {
        if ( otherFeature.edge === firstEdge ) {
          firstEdgeBlack = true;
        }
        else if ( otherFeature.edge === secondEdge ) {
          secondEdgeBlack = true;
        }
      }
      if ( otherFeature instanceof RedEdgeFeature ) {
        if ( otherFeature.edge === firstEdge ) {
          firstEdgeRed = true;
        }
        else if ( otherFeature.edge === secondEdge ) {
          secondEdgeRed = true;
        }
      }
    }

    return ( firstEdgeBlack && secondEdgeBlack ) || ( firstEdgeRed && secondEdgeRed );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'sector-not-one',
      sector: this.sector.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'sector-not-one' }, patternBoard: TPatternBoard ): SectorNotOneFeature {
    return new SectorNotOneFeature( patternBoard.sectors[ serialized.sector ] );
  }
}