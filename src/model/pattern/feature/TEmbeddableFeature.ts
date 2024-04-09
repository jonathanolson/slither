import { TFeature } from './TFeature.ts';
import { Embedding } from '../Embedding.ts';

import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';

export interface TEmbeddableFeature extends TFeature {

  applyEmbedding( embedding: Embedding ): TFeature[];

  isRedundant( otherFeatures: TFeature[] ): boolean;

  equals( other: TFeature ): boolean;

  indexEquals( other: TFeature ): boolean;

  serialize(): TSerializedEmbeddableFeature;
}