
import cv from '@techstark/opencv-js';
import { Shape } from 'phet-lib/kite';
import { contourToShape, simplifyContour } from './opencvUtils';
import assert from '../workarounds/assert';

export class Contour {

  public next: Contour | null = null;
  public prev: Contour | null = null;
  public firstChild: Contour | null = null;
  public parent: Contour | null = null;
  public children: Contour[] = [];

  public constructor(
    public readonly mat: cv.Mat | null
  ) {}

  public getShape(): Shape {
    assert && assert( this.mat );

    return contourToShape( this.mat! );
  }

  public getSimplified( epsilon: number, closed: boolean ): Contour {
    assert && assert( this.mat );

    return new Contour( simplifyContour( this.mat!, epsilon, closed ) );
  }

  public getSimplifiedShape( epsilon: number, closed: boolean ): Shape {
    assert && assert( this.mat );

    return contourToShape( simplifyContour( this.mat!, epsilon, closed ) );
  }

  public getDescendantContours(): Contour[] {
    const descendants: Contour[] = [];
    this.children.forEach( child => {
      descendants.push( child );
      descendants.push( ...child.getDescendantContours() );
    } );
    return descendants;
  }
}
