import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { isAnnotationDisplayed } from './isAnnotationDisplayed.ts';

export const isAnnotationDisplayedForStyle = (annotation: TAnnotation, style: TPuzzleStyle): boolean => {
  return isAnnotationDisplayed(
    annotation,
    style.allowEdgeEditProperty.value,
    style.allowFaceColorEditProperty.value,
    style.allowSectorEditProperty.value,
    style.vertexStateVisibleProperty.value,
    style.faceStateVisibleProperty.value,
  );
};
