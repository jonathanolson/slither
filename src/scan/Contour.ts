
import cv from '@techstark/opencv-js';
import { Shape } from 'phet-lib/kite';
import { contourToPoints, contourToShape, simplifyContour } from './opencvUtils';
import assert from '../workarounds/assert';
import { ConvexHull2, Vector2 } from 'phet-lib/dot';

export class Contour {

  public next: Contour | null = null;
  public prev: Contour | null = null;
  public firstChild: Contour | null = null;
  public parent: Contour | null = null;
  public children: Contour[] = [];
  public readonly shape: Shape | null;
  public readonly points: Vector2[];
  public readonly area: number;

  public constructor(
    public readonly mat: cv.Mat | null
  ) {
    this.shape = mat ? contourToShape( mat ) : null;
    this.points = mat ? contourToPoints( mat ) : [];
    this.area = Contour.pointsToArea( this.points );
  }

  public getConvexity(): number {
    return this.area / Contour.pointsToArea( this.getConvexHullPoints() );
  }

  public getConvexHullPoints(): Vector2[] {
    return ConvexHull2.grahamScan( this.points, false );
  }

  public getConvexHullShape(): Shape {
    return Shape.polygon( this.getConvexHullPoints() );
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

  public static pointsToArea( polygon: Vector2[] ): number {
    let area = 0;

    for ( let j = 0; j < polygon.length; j++ ) {
      const p0 = polygon[ j ];
      const p1 = polygon[ ( j + 1 ) % polygon.length ];

      // Shoelace formula for the area
      area += ( p1.x + p0.x ) * ( p1.y - p0.y );
    }

    return Math.abs( 0.5 * area );
  }
}
