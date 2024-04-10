import { TFeature } from './TFeature.ts';
import { Embedding } from '../Embedding.ts';

import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';

export interface TEmbeddableFeature extends TFeature {

  // Returns a copy of the feature, but with the embedding applied (may be in a different pattern structure)
  applyEmbedding( embedding: Embedding ): TFeature[];

  // Given the other features, is this feature redundant? (this feature should NOT be included in otherFeatures).
  // See filterRedundantFeatures() for more details, and things that this can't handle.
  isRedundant( otherFeatures: TFeature[] ): boolean;

  // Equality based on instance-equality for pattern board objects.
  equals( other: TFeature ): boolean;

  // Equality based on index-equality for pattern board objects.
  indexEquals( other: TFeature ): boolean;

  serialize(): TSerializedEmbeddableFeature;

  // A canonical string representation of the feature (to act as a "hash" for the feature for lookups, but also debugging)
  // TODO: rename toCanonicalString?
  getCanonicalString(): string;
}