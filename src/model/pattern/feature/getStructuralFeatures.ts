import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TFeature } from './TFeature.ts';
import { VertexFeature } from './VertexFeature.ts';
import { NoLoopsFeature } from './NoLoopsFeature.ts';

export const getStructuralFeatures = ( patternBoard: TPatternBoard ): TFeature[] => {
  return [
    ...patternBoard.vertices.map( vertex => new VertexFeature( vertex ) ),
    NoLoopsFeature.fromBoard( patternBoard )
  ];
};