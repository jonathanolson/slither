import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { SectorOnlyOneFeature } from './SectorOnlyOneFeature.ts';
import { SectorNotZeroFeature } from './SectorNotZeroFeature.ts';
import { SectorNotTwoFeature } from './SectorNotTwoFeature.ts';

export const filterRedundantFeatures = ( features: TEmbeddableFeature[] ): TEmbeddableFeature[] => {
  const essentialFeatures: TEmbeddableFeature[] = [];

  for ( const feature of features ) {
    if ( !feature.isRedundant( essentialFeatures ) ) {
      essentialFeatures.push( feature );
    }
  }

  // Handle our special case of "not-zero" and "not-two" are equivalent to "only-one"
  for ( const feature of essentialFeatures ) {
    if ( feature instanceof SectorOnlyOneFeature ) {
      const sector = feature.sector;

      const notZero = essentialFeatures.find( feature => feature instanceof SectorNotZeroFeature && feature.sector === sector ) ?? null;
      const notTwo = essentialFeatures.find( feature => feature instanceof SectorNotTwoFeature && feature.sector === sector ) ?? null;

      if ( notZero && notTwo ) {
        essentialFeatures.splice( essentialFeatures.indexOf( notZero ), 1 );
        essentialFeatures.splice( essentialFeatures.indexOf( notTwo ), 1 );
      }
    }
  }

  return essentialFeatures;
};
