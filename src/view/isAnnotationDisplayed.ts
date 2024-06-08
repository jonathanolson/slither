import { annotationSetsEdgeState, annotationSetsFaceColor, annotationSetsFaceState, annotationSetsSectorState, annotationSetsVertexState, TAnnotation } from '../model/data/core/TAnnotation.ts';

export const isAnnotationDisplayed = (
  annotation: TAnnotation,
  // TODO: do more with these?
  solveEdges: boolean,
  solveColors: boolean,
  solveSectors: boolean,
  solveVertexState: boolean,
  solveFaceState: boolean
): boolean => {
  // FOR NOW, always mark patterns as visible, because we intelligently solve only ones that WILL be visible
  if ( annotation.type === 'Pattern' ) {
    return true;
  }

  // TODO: Should we hide these sometimes?
  if ( annotationSetsEdgeState( annotation ) ) {
    return true;
  }

  // NOTE: finite check so we ignore the inside/outside only cases
  if ( solveColors && annotationSetsFaceColor( annotation ) ) {
    return true;
  }

  if ( solveSectors && annotationSetsSectorState( annotation ) ) {
    return true;
  }

  if ( solveVertexState && annotationSetsVertexState( annotation ) ) {
    return true;
  }

  if ( solveFaceState && annotationSetsFaceState( annotation ) ) {
    return true;
  }

  return false;
};