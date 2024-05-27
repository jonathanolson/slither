import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';

export const getEdgeFeatures = ( patternBoard: TPatternBoard ): ( BlackEdgeFeature | RedEdgeFeature )[] => {
  return patternBoard.edges.flatMap( edge => {
    const features: ( BlackEdgeFeature | RedEdgeFeature )[] = [];

    if ( !edge.isExit ) {
      features.push( new BlackEdgeFeature( edge ) );
    }

    features.push( new RedEdgeFeature( edge ) );

    return features;
  } );
};