import { TEmbeddableFeature } from './TEmbeddableFeature.ts';

export const areFeatureListsEquivalent = (a: TEmbeddableFeature[], b: TEmbeddableFeature[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  // Check that every feature in a is in b
  for (let i = 0; i < a.length; i++) {
    if (!b.some((bFeature) => a[i].equals(bFeature))) {
      return false;
    }
  }

  // Check that every feature in b is in a
  // TODO: if we have reduced redundancies, can we get rid of this check?
  for (let i = 0; i < b.length; i++) {
    if (!a.some((aFeature) => b[i].equals(aFeature))) {
      return false;
    }
  }

  return true;
};
