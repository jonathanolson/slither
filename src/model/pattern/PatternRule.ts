import { FeatureSet } from './feature/FeatureSet.ts';
import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

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

  public hasApplication( featureSet: FeatureSet ): boolean {
    return this.inputFeatureSet.isSubsetOf( featureSet ) && !this.outputFeatureSet.isSubsetOf( featureSet );
  }

  public apply( featureSet: FeatureSet ): FeatureSet {
    assertEnabled() && assert( this.hasApplication( featureSet ) );

    // TODO: need to do the same combination of ... face color duals. oh no
    return new FeatureSet( [
      // Remove input features, add output features
      ...featureSet.features.filter( feature => !this.inputFeatureSet.features.some( inputFeature => inputFeature.equals( feature ) ) ),
      ...this.outputFeatureSet.features
    ] );
  }

  public isTrivial(): boolean {
    return this.outputFeatureSet.isSubsetOf( this.inputFeatureSet );
  }
}