import { TEdge } from '../../board/core/TEdge.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { Embedding } from '../../pattern/embedding/Embedding.ts';
import { BoardPatternBoard } from '../../pattern/pattern-board/BoardPatternBoard.ts';
import { PatternRule } from '../../pattern/pattern-rule/PatternRule.ts';
import { FaceState } from '../face-state/FaceState.ts';
import FaceValue from '../face-value/FaceValue.ts';
import SectorState from '../sector-state/SectorState.ts';
import { TSector } from '../sector-state/TSector.ts';
import { VertexState } from '../vertex-state/VertexState.ts';

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
  blackEdges: [TEdge, TEdge];
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

export type FaceColorAnnotationPartial = {
  face: TFace;
  remainingValue: number;
  availableSideCount: number;
  balancedPairs: [TEdge[], TEdge[]][];
};

export type FaceColorMatchToRedAnnotation = {
  type: 'FaceColorMatchToRed';
  matchingEdges: TEdge[];
} & FaceColorAnnotationPartial;

export type FaceColorMatchToBlackAnnotation = {
  type: 'FaceColorMatchToBlack';
  matchingEdges: TEdge[];
} & FaceColorAnnotationPartial;

export type FaceColorBalanceAnnotation = {
  type: 'FaceColorBalance';
  matchingEdges: TEdge[];
  oppositeEdges: TEdge[];
} & FaceColorAnnotationPartial;

export type DoubleMinusOneFacesAnnotation = {
  type: 'DoubleMinusOneFaces';
  faces: [TFace, TFace];
  toBlackEdges: TEdge[];
  toRedEdges: TEdge[];
};

export type SingleEdgeToSectorAnnotation = {
  type: 'SingleEdgeToSector';
  sector: TSector;
  beforeState: SectorState;
  afterState: SectorState;
};

export type DoubleEdgeToSectorAnnotation = {
  type: 'DoubleEdgeToSector';
  sector: TSector;
  beforeState: SectorState;
  afterState: SectorState;
};

export type ForcedSectorAnnotation = {
  type: 'ForcedSector';
  sector: TSector;
  sectorState: SectorState;
  toRedEdges: TEdge[];
  toBlackEdges: TEdge[];
};

export type StaticFaceSectorsAnnotation = {
  type: 'StaticFaceSectors';
  face: TFace;
  sectors: TSector[];
};

export type VertexStateAnnotation = {
  type: 'VertexState';
  vertex: TVertex;
  beforeState: VertexState;
  afterState: VertexState;
};

export type VertexStateToEdgeAnnotation = {
  type: 'VertexStateToEdge';
  vertex: TVertex;
  toRedEdges: TEdge[];
  toBlackEdges: TEdge[];
};

export type VertexStateToSectorAnnotation = {
  type: 'VertexStateToSector';
  vertex: TVertex;
  sectors: TSector[];
  beforeStates: SectorState[];
  afterStates: SectorState[];
};

export type VertexStateToSameFaceColorAnnotation = {
  type: 'VertexStateToSameFaceColor';
  vertex: TVertex;
  facesA: TFace[];
  facesB: TFace[];
};

export type VertexStateToOppositeFaceColorAnnotation = {
  type: 'VertexStateToOppositeFaceColor';
  vertex: TVertex;
  facesA: TFace[];
  facesB: TFace[];
};

export type FaceStateAnnotation = {
  type: 'FaceState';
  face: TFace;
  beforeState: FaceState;
  afterState: FaceState;
};

export type FaceStateToEdgeAnnotation = {
  type: 'FaceStateToEdge';
  face: TFace;
  toRedEdges: TEdge[];
  toBlackEdges: TEdge[];
};

export type FaceStateToSectorAnnotation = {
  type: 'FaceStateToSector';
  face: TFace;
  sectors: TSector[];
  beforeStates: SectorState[];
  afterStates: SectorState[];
};

export type FaceStateToSameFaceColorAnnotation = {
  type: 'FaceStateToSameFaceColor';
  face: TFace;
  facesA: TFace[];
  facesB: TFace[];
};

export type FaceStateToOppositeFaceColorAnnotation = {
  type: 'FaceStateToOppositeFaceColor';
  face: TFace;
  facesA: TFace[];
  facesB: TFace[];
};

export type FaceStateToVertexStateAnnotation = {
  type: 'FaceStateToVertexState';
  face: TFace;
  vertices: TVertex[];
  beforeStates: VertexState[];
  afterStates: VertexState[];
};

export type AnnotatedFaceValue = {
  face: TFace | null;
  value: FaceValue;
};

export type AnnotatedFaceColorDual = {
  primaryFaces: (TFace | null)[];
  secondaryFaces: (TFace | null)[];
};

export type AnnotatedPattern = {
  faceValues: AnnotatedFaceValue[];
  blackEdges: TEdge[];
  redEdges: TEdge[];
  sectorsNotZero: TSector[];
  sectorsNotOne: TSector[];
  sectorsNotTwo: TSector[];
  sectorsOnlyOne: TSector[];
  faceColorDuals: AnnotatedFaceColorDual[];
};

export type PatternAnnotation = {
  type: 'Pattern';
  rule: PatternRule;
  embedding: Embedding;
  boardPatternBoard: BoardPatternBoard;
  input: AnnotatedPattern;
  output: AnnotatedPattern;
  affectedEdges: Set<TEdge>;
  affectedSectors: Set<TSector>;
  affectedFaces: Set<TFace>;
};

export const annotationSetsEdgeState = (annotation: TAnnotation): boolean => {
  return (
    annotation.type === 'ForcedLine' ||
    annotation.type === 'AlmostEmptyToRed' ||
    annotation.type === 'JointToRed' ||
    annotation.type === 'FaceSatisfied' ||
    annotation.type === 'FaceAntiSatisfied' ||
    annotation.type === 'ForcedSolveLoop' ||
    annotation.type === 'PrematureForcedLoop' ||
    annotation.type === 'CompletingEdgesAfterSolve' ||
    annotation.type === 'FaceColorToBlack' ||
    annotation.type === 'FaceColorToRed' ||
    annotation.type === 'FaceColorNoTrivialLoop' ||
    annotation.type === 'FaceColorMatchToRed' ||
    annotation.type === 'FaceColorMatchToBlack' ||
    annotation.type === 'DoubleMinusOneFaces' ||
    annotation.type === 'ForcedSector' ||
    annotation.type === 'VertexStateToEdge' ||
    annotation.type === 'FaceStateToEdge' ||
    (annotation.type === 'Pattern' && annotation.affectedEdges.size > 0)
  );
};

export const annotationSetsSimpleRegion = (annotation: TAnnotation): boolean => {
  return annotation.type === 'SimpleRegions';
};

export const annotationSetsFaceColor = (annotation: TAnnotation): boolean => {
  return (
    annotation.type === 'InvalidFaceColoring' ||
    annotation.type === 'GeneralFaceColoring' ||
    annotation.type === 'FaceColoringBlackEdge' ||
    annotation.type === 'FaceColoringRedEdge' ||
    annotation.type === 'FaceColorBalance' ||
    annotation.type === 'VertexStateToSameFaceColor' ||
    annotation.type === 'VertexStateToOppositeFaceColor' ||
    annotation.type === 'FaceStateToSameFaceColor' ||
    annotation.type === 'FaceStateToOppositeFaceColor' ||
    (annotation.type === 'Pattern' && annotation.affectedFaces.size > 0)
  );
};

export const annotationSetsSectorState = (annotation: TAnnotation): boolean => {
  return (
    annotation.type === 'SingleEdgeToSector' ||
    annotation.type === 'DoubleEdgeToSector' ||
    annotation.type === 'StaticFaceSectors' ||
    annotation.type === 'VertexStateToSector' ||
    annotation.type === 'FaceStateToSector' ||
    (annotation.type === 'Pattern' && annotation.affectedSectors.size > 0)
  );
};

export const annotationSetsVertexState = (annotation: TAnnotation): boolean => {
  return annotation.type === 'VertexState' || annotation.type === 'FaceStateToVertexState';
};

export const annotationSetsFaceState = (annotation: TAnnotation): boolean => {
  return annotation.type === 'FaceState';
};

export type TAnnotation =
  | ForcedLineAnnotation
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
  | FaceColorNoTrivialLoopAnnotation
  | FaceColorMatchToRedAnnotation
  | FaceColorMatchToBlackAnnotation
  | FaceColorBalanceAnnotation
  | DoubleMinusOneFacesAnnotation
  | SingleEdgeToSectorAnnotation
  | DoubleEdgeToSectorAnnotation
  | ForcedSectorAnnotation
  | StaticFaceSectorsAnnotation
  | VertexStateAnnotation
  | VertexStateToEdgeAnnotation
  | VertexStateToSectorAnnotation
  | VertexStateToSameFaceColorAnnotation
  | VertexStateToOppositeFaceColorAnnotation
  | FaceStateAnnotation
  | FaceStateToEdgeAnnotation
  | FaceStateToSectorAnnotation
  | FaceStateToSameFaceColorAnnotation
  | FaceStateToOppositeFaceColorAnnotation
  | FaceStateToVertexStateAnnotation
  | PatternAnnotation;

export const getAnnotationDifficultyB = (annotation: TAnnotation): number => {
  if (
    annotation.type === 'SimpleRegions' ||
    annotation.type === 'CompletingEdgesAfterSolve' ||
    annotation.type === 'GeneralFaceColoring' ||
    annotation.type === 'InvalidFaceColoring' ||
    annotation.type === 'FaceColoringBlackEdge' ||
    annotation.type === 'FaceColoringRedEdge' ||
    annotation.type === 'JointToRed' ||
    annotation.type === 'ForcedLine' ||
    annotation.type === 'AlmostEmptyToRed' ||
    annotation.type === 'FaceSatisfied' ||
    annotation.type === 'FaceAntiSatisfied' ||
    annotation.type === 'FaceColorToBlack' ||
    annotation.type === 'FaceColorToRed' ||
    annotation.type === 'StaticFaceSectors'
  ) {
    return 0;
  } else if (annotation.type === 'Pattern') {
    return Math.max(0, annotation.rule.getInputDifficultyScoreB());
  } else if (annotation.type === 'ForcedSolveLoop' || annotation.type === 'PrematureForcedLoop') {
    return 5;
  } else if (annotation.type === 'DoubleMinusOneFaces') {
    return 5;
  } else if (annotation.type === 'SingleEdgeToSector' || annotation.type === 'DoubleEdgeToSector') {
    return 6;
  } else if (annotation.type === 'ForcedSector') {
    return 7;
  } else if (annotation.type === 'FaceColorNoTrivialLoop') {
    return 7;
  } else if (annotation.type === 'FaceColorMatchToRed' || annotation.type === 'FaceColorMatchToBlack') {
    return 9;
  } else if (annotation.type === 'FaceColorBalance') {
    return 11;
  } else if (annotation.type === 'VertexState' || annotation.type === 'VertexStateToEdge') {
    return 12;
  } else if (
    annotation.type === 'VertexStateToSector' ||
    annotation.type === 'VertexStateToSameFaceColor' ||
    annotation.type === 'VertexStateToOppositeFaceColor'
  ) {
    return 15;
  } else if (
    annotation.type === 'FaceState' ||
    annotation.type === 'FaceStateToEdge' ||
    annotation.type === 'FaceStateToSector' ||
    annotation.type === 'FaceStateToSameFaceColor' ||
    annotation.type === 'FaceStateToOppositeFaceColor' ||
    annotation.type === 'FaceStateToVertexState'
  ) {
    return 20;
  } else {
    throw new Error(`unknown annotation type: ${(annotation as TAnnotation).type}`);
  }
};
