import { TEmbeddableFeature } from './TEmbeddableFeature.ts';

export class IncompatibleFeatureError extends Error {
  public constructor(
    public readonly mainFeature: TEmbeddableFeature,
    public readonly incompatibleFeatures: TEmbeddableFeature[],
  ) {
    super(
      `Feature ${mainFeature.toCanonicalString()} incompatible with ${incompatibleFeatures.map((f) => f.toCanonicalString()).join(', ')}`,
    );
  }
}
