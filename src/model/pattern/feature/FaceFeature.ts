import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternFace } from '../TPatternFace.ts';
import FaceValue from '../../data/face-value/FaceValue.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicExactlyN, logicTrue } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';

export class FaceFeature implements TEmbeddableFeature {

  public constructor(
    public readonly face: TPatternFace,
    public readonly value: FaceValue
  ) {}

  public getCanonicalString(): string {
    return `face-${this.face.index}-${this.value ?? 'blank'}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.face.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === this.value;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    if ( this.value === null ) {
      return logicTrue;
    }
    else {
      return logicExactlyN( this.face.edges.map( edge => getFormula( edge ) ), this.value );
    }
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new FaceFeature( embedding.mapFace( this.face ), this.value ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof FaceFeature && other.face === this.face && other.value === this.value;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof FaceFeature && other.face.index === this.face.index && other.value === this.value;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'face',
      face: this.face.index,
      value: this.value
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'face' }, patternBoard: TPatternBoard ): FaceFeature {
    return new FaceFeature( patternBoard.faces[ serialized.face ], serialized.value );
  }
}