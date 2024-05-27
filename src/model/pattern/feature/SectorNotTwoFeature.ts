import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternSector } from '../pattern-board/TPatternSector.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicNot, logicOr } from '../../logic/operations.ts';
import { Embedding } from '../embedding/Embedding.ts';
import { TFeature } from './TFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';

export class SectorNotTwoFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public toCanonicalString(): string {
    return `sector-not-two-${this.sector.index}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount !== 2;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicOr( this.sector.edges.map( edge => logicNot( getFormula( edge ) ) ) );
  }


  public embedded( embedding: Embedding ): SectorNotTwoFeature[] {
    return [ new SectorNotTwoFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorNotTwoFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorNotTwoFeature && other.sector.index === this.sector.index;
  }

  public isSubsetOf( other: TFeature ): boolean {
    return this.equals( other );
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => {
      return this.equals( feature ) || ( feature instanceof RedEdgeFeature && this.sector.edges.includes( feature.edge ) );
    } );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'sector-not-two',
      sector: this.sector.index
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'sector-not-two' }, patternBoard: TPatternBoard ): SectorNotTwoFeature {
    return new SectorNotTwoFeature( patternBoard.sectors[ serialized.sector ] );
  }
}