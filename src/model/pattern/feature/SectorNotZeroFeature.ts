import { Formula } from '../../logic/Formula.ts';
import { Term } from '../../logic/Term.ts';
import { logicOr } from '../../logic/operations.ts';
import { Embedding } from '../embedding/Embedding.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { TPatternSector } from '../pattern-board/TPatternSector.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TFeature } from './TFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';

export class SectorNotZeroFeature implements TEmbeddableFeature {
  public constructor(public readonly sector: TPatternSector) {}

  public toCanonicalString(): string {
    return `sector-not-zero-${this.sector.index}`;
  }

  public isPossibleWith(isEdgeBlack: (edge: TPatternEdge) => boolean): boolean {
    const blackCount = this.sector.edges.filter((edge) => isEdgeBlack(edge)).length;
    return blackCount !== 0;
  }

  public getPossibleFormula(getFormula: (edge: TPatternEdge) => Term<TPatternEdge>): Formula<TPatternEdge> {
    return logicOr(this.sector.edges.map((edge) => getFormula(edge)));
  }

  public embedded(embedding: Embedding): SectorNotZeroFeature[] {
    return [new SectorNotZeroFeature(embedding.mapSector(this.sector))];
  }

  public equals(other: TFeature): boolean {
    return other instanceof SectorNotZeroFeature && other.sector === this.sector;
  }

  public indexEquals(other: TFeature): boolean {
    return other instanceof SectorNotZeroFeature && other.sector.index === this.sector.index;
  }

  public isSubsetOf(other: TFeature): boolean {
    return this.equals(other);
  }

  public isRedundant(otherFeatures: TFeature[]): boolean {
    return otherFeatures.some((feature) => {
      return this.equals(feature) || (feature instanceof BlackEdgeFeature && this.sector.edges.includes(feature.edge));
    });
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'sector-not-zero',
      sector: this.sector.index,
    };
  }

  public static deserialize(
    serialized: TSerializedEmbeddableFeature & { type: 'sector-not-zero' },
    patternBoard: TPatternBoard,
  ): SectorNotZeroFeature {
    return new SectorNotZeroFeature(patternBoard.sectors[serialized.sector]);
  }
}
