import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { default as assert, assertEnabled } from '../../../workarounds/assert.ts';
import { filterRedundantFeatures } from './filterRedundantFeatures.ts';

export class FeatureSet {

  public map: Map<string, TEmbeddableFeature> = new Map();

  public constructor(
    public features: TEmbeddableFeature[]
  ) {
    assertEnabled() && assert( filterRedundantFeatures( features ).length === features.length );

    for ( const feature of features ) {
      this.map.set( feature.getCanonicalString(), feature );
    }

    assertEnabled() && assert( this.map.size === features.length );
  }

  // TODO: embeddings and consolidation of features

  // TODO: subset computations!

  public equals( other: FeatureSet ): boolean {
    if ( this.features.length !== other.features.length ) {
      return false;
    }

    for ( const feature of this.features ) {
      if ( !other.map.has( feature.getCanonicalString() ) ) {
        return false;
      }
    }

    return true;
  }
}