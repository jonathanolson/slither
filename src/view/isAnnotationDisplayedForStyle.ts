import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';
import { annotationSetsEdgeState, annotationSetsFaceColor, annotationSetsFaceState, annotationSetsSectorState, annotationSetsVertexState, TAnnotation } from '../model/data/core/TAnnotation.ts';

export const isAnnotationDisplayedForStyle = ( annotation: TAnnotation, style: TPuzzleStyle ): boolean => {

  // FOR NOW, always mark patterns as visible, because we intelligently solve only ones that WILL be visible
  if ( annotation.type === 'Pattern' ) {
    return true;
  }

  // TODO: Should we hide these sometimes?
  if ( annotationSetsEdgeState( annotation ) ) {
    return true;
  }

  // NOTE: finite check so we ignore the inside/outside only cases
  if ( style.faceColorsVisibleProperty.value && isFinite( style.faceColorThresholdProperty.value ) && annotationSetsFaceColor( annotation ) ) {
    return true;
  }

  if ( style.sectorsVisibleProperty.value && annotationSetsSectorState( annotation ) ) {
    return true;
  }

  if ( style.vertexStateVisibleProperty.value && annotationSetsVertexState( annotation ) ) {
    return true;
  }

  if ( style.faceStateVisibleProperty.value && annotationSetsFaceState( annotation ) ) {
    return true;
  }

  return false;
};