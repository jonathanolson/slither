import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TFeature } from '../feature/TFeature.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { FaceFeature } from '../feature/FaceFeature.ts';

export const getIndeterminateEdges = ( patternBoard: TPatternBoard, features: TFeature[] ): TPatternEdge[] => {
  const faceFeatures = features.filter( feature => feature instanceof FaceFeature ) as FaceFeature[];
  const determinateFaces = new Set( faceFeatures.map( feature => feature.face ) );

  return patternBoard.edges.filter( edge => {
    return edge.isExit || edge.faces.some( face => !determinateFaces.has( face ) );
  } );
};