import { TAction } from './TAction.ts';
import { TAnnotation } from './TAnnotation.ts';

export interface TAnnotatedAction<Data> extends TAction<Data> {
  annotation: TAnnotation;
}