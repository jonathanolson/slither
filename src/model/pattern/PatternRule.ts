import { FeatureSet } from './feature/FeatureSet.ts';
import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getEmbeddings } from './getEmbeddings.ts';

export class PatternRule {
  public constructor(
    public readonly patternBoard: TDescribedPatternBoard,
    public readonly inputFeatureSet: FeatureSet,
    public readonly outputFeatureSet: FeatureSet
  ) {}

  public embedded( patternBoard: TDescribedPatternBoard, embedding: Embedding ): PatternRule | null {
    const inputFeatureSet = this.inputFeatureSet.embedded( embedding );
    if ( inputFeatureSet === null ) {
      return null;
    }

    const outputFeatureSet = this.outputFeatureSet.embedded( embedding )!;
    if ( outputFeatureSet === null ) {
      return null;
    }

    return new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );
  }

  public isAutomorphicTo( other: PatternRule ): boolean {
    assertEnabled() && assert( this.patternBoard === other.patternBoard );

    const automorphisms = getEmbeddings( this.patternBoard, this.patternBoard );

    for ( const automorphism of automorphisms ) {
      const embeddedRule = this.embedded( this.patternBoard, automorphism );
      if ( embeddedRule ) {
        // TODO: can we ditch the "output feature set equals"? Hmm, probably not yet?
        if ( embeddedRule.inputFeatureSet.equals( other.inputFeatureSet ) && embeddedRule.outputFeatureSet.equals( other.outputFeatureSet ) ) {
          return true;
        }
      }
    }

    return false;
  }

  public isSubsetOf( other: PatternRule ): boolean {
    return this.inputFeatureSet.isSubsetOf( other.inputFeatureSet ) && this.outputFeatureSet.isSubsetOf( other.outputFeatureSet );
  }

  public matches( featureSet: FeatureSet ): boolean {
    return this.inputFeatureSet.isSubsetOf( featureSet );
  }

  // Assumes FaceFeatures are static, and that features "in principle" won't be removed (if they are, they are replaced
  // by something that implies the same thing).
  public canPotentiallyMatch( featureSet: FeatureSet ): boolean {
    throw new Error( 'unimplemented' );
  }

  public hasApplication( featureSet: FeatureSet ): boolean {
    return this.matches( featureSet ) && !this.outputFeatureSet.isSubsetOf( featureSet );
  }

  public apply( featureSet: FeatureSet ): FeatureSet {
    assertEnabled() && assert( this.hasApplication( featureSet ) );

    const result = featureSet.union( this.outputFeatureSet )!;
    assertEnabled() && assert( result );

    return result;
  }

  public isTrivial(): boolean {
    return this.outputFeatureSet.isSubsetOf( this.inputFeatureSet );
  }

  public toCanonicalString(): string {
    return `rule:${this.inputFeatureSet.toCanonicalString()}->${this.outputFeatureSet.toCanonicalString()}`;
  }
}