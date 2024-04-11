import { FeatureSet } from './feature/FeatureSet.ts';
import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getEmbeddings } from './getEmbeddings.ts';
import { FaceFeature } from './feature/FaceFeature.ts';
import { TPatternBoard } from './TPatternBoard.ts';

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
    if ( !this.inputFeatureSet.isCompatibleWith( featureSet ) ) {
      return false;
    }

    for ( const feature of this.inputFeatureSet.features ) {
      if ( feature instanceof FaceFeature ) {
        const matchingFaceFeature = ( featureSet.features.find( otherFeature => otherFeature instanceof FaceFeature && feature.face === otherFeature.face ) ?? null ) as FaceFeature | null;

        if ( !matchingFaceFeature || feature.value !== matchingFaceFeature.value ) {
          return false;
        }
      }
    }

    return true;
  }

  public isRedundant( embeddedRules: PatternRule[] ): boolean {
    if ( this.isTrivial() ) {
      return true;
    }

    return this.outputFeatureSet.isSubsetOf( PatternRule.applyRules( this.patternBoard, this.inputFeatureSet, embeddedRules ) );
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

  public static applyRules( patternBoard: TPatternBoard, initialFeatureSet: FeatureSet, embeddedRules: PatternRule[] ): FeatureSet {
    assertEnabled() && assert( embeddedRules.every( otherRule => otherRule.patternBoard === patternBoard ), 'embedding check' );

    // TODO: increase the performance of this?
    const potentialRules = new Set( embeddedRules.filter( otherRule => otherRule.canPotentiallyMatch( initialFeatureSet ) ) );

    if ( potentialRules.size === 0 ) {
      return initialFeatureSet;
    }

    let featureState = initialFeatureSet;

    let changed = true;

    while ( changed ) {
      changed = false;

      // TODO: figure out if we update the canPotentiallyMatch regularly? (probably not)

      for ( const rule of potentialRules ) {
        if ( rule.hasApplication( featureState ) ) {
          featureState = rule.apply( featureState );
          changed = true;
          potentialRules.delete( rule ); // no longer need to consider this rule
        }
      }
    }

    return featureState;
  }
}