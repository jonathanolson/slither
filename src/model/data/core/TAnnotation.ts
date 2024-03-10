import { TEdge } from '../../board/core/TEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TAnnotatedAction } from './TAnnotatedAction.ts';

export type ForcedLineAnnotation = {
  type: 'ForcedLine';
  vertex: TVertex;
  blackEdge: TEdge;
  whiteEdge: TEdge;
  redEdges: TEdge[];
};

export type AlmostEmptyToRedAnnotation = {
  type: 'AlmostEmptyToRed';
  vertex: TVertex;
  whiteEdge: TEdge;
  redEdges: TEdge[];
};

export type JointToRedAnnotation = {
  type: 'JointToRed';
  vertex: TVertex;
  whiteEdges: TEdge[];
  blackEdges: [ TEdge, TEdge ];
};

export type FaceSatisfiedAnnotation = {
  type: 'FaceSatisfied';
  face: TFace;
  whiteEdges: TEdge[];
  blackEdges: TEdge[];
};

export type FaceAntiSatisfiedAnnotation = {
  type: 'FaceAntiSatisfied';
  face: TFace;
  whiteEdges: TEdge[];
  redEdges: TEdge[];
};

export type ForcedSolveLoopAnnotation = {
  type: 'ForcedSolveLoop';
  a: TVertex;
  b: TVertex;
  regionEdges: TEdge[];
  pathEdges: TEdge[];
};

export type PrematureForcedLoopAnnotation = {
  type: 'PrematureForcedLoop';
  a: TVertex;
  b: TVertex;
  regionEdges: TEdge[];
  pathEdges: TEdge[];
};

export type CompletingEdgesAfterSolveAnnotation = {
  type: 'CompletingEdgesAfterSolve';
  whiteEdges: TEdge[];
};

export type SimpleRegionsAnnotation = {
  type: 'SimpleRegions';
};

export type InvalidFaceColoringAnnotation = {
  type: 'InvalidFaceColoring';
};

export type GeneralFaceColoringAnnotation = {
  type: 'GeneralFaceColoring';
};

export type FaceColoringBlackEdgeAnnotation = {
  type: 'FaceColoringBlackEdge';
  edge: TEdge;
};

export type FaceColoringRedEdgeAnnotation = {
  type: 'FaceColoringRedEdge';
  edge: TEdge;
};

export type FaceColorToBlackAnnotation = {
  type: 'FaceColorToBlack';
  edge: TEdge;
};

export type FaceColorToRedAnnotation = {
  type: 'FaceColorToRed';
  edge: TEdge;
};

// e.g. all of the adjacent colors of the face are the same, thus it either has the same color (all edges red) or
// different color (all edges black). If all edges black, it is a trivial loop (only allowed if it satisfies all
// faces, thus no faces with values that aren't adjacent.
export type FaceColorNoTrivialLoopAnnotation = {
  type: 'FaceColorNoTrivialLoop';
  face: TFace;
};

export type FaceColorMatchToRedAnnotation = {
  type: 'FaceColorMatchToRed';
  face: TFace;
  matchingEdges: TEdge[];
  remainingValue: number;
  availableSideCount: number;
};

export type FaceColorMatchToBlackAnnotation = {
  type: 'FaceColorMatchToBlack';
  face: TFace;
  matchingEdges: TEdge[];
  remainingValue: number;
  availableSideCount: number;
};

export type FaceColorBalanceAnnotation = {
  type: 'FaceColorBalance';
  face: TFace;
  matchingEdges: TEdge[];
  oppositeEdges: TEdge[];
  remainingValue: number;
  availableSideCount: number;
};

export type FaceColorOneConstrainedAnnotation = {
  type: 'FaceColorOneConstrained';
  face: TFace;
  edges: [ TEdge, TEdge ];
};

export type TAnnotation =
  ForcedLineAnnotation
  | AlmostEmptyToRedAnnotation
  | JointToRedAnnotation
  | FaceSatisfiedAnnotation
  | FaceAntiSatisfiedAnnotation
  | ForcedSolveLoopAnnotation
  | PrematureForcedLoopAnnotation
  | CompletingEdgesAfterSolveAnnotation
  | SimpleRegionsAnnotation
  | InvalidFaceColoringAnnotation
  | GeneralFaceColoringAnnotation
  | FaceColoringBlackEdgeAnnotation
  | FaceColoringRedEdgeAnnotation
  | FaceColorToBlackAnnotation
  | FaceColorToRedAnnotation
  | FaceColorNoTrivialLoopAnnotation;

export const ignoredAnnotationTypes = new Set<TAnnotation[ 'type' ]>( [
  'SimpleRegions',
  'InvalidFaceColoring',
  'GeneralFaceColoring',
  'FaceColoringBlackEdge',
  'FaceColoringRedEdge'
] as const );

export const isAnnotationIgnored = ( annotation: TAnnotation ): boolean => {
  return ignoredAnnotationTypes.has( annotation.type );
};

export const isActionIgnored = ( action: TAnnotatedAction<unknown> ): boolean => {
  return isAnnotationIgnored( action.annotation );
};