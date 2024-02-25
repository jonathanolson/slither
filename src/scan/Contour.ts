import cv from '@techstark/opencv-js';
import { Shape } from 'phet-lib/kite';
import { contourToPoints, contourToShape, simplifyContour } from './opencvUtils';
import assert from '../workarounds/assert';
import { Bounds2, ConvexHull2, Vector2 } from 'phet-lib/dot';
import { getCoordinateClusteredMap } from '../util/getCoordinateCluteredMap.ts';

export class Contour {

  public next: Contour | null = null;
  public prev: Contour | null = null;
  public firstChild: Contour | null = null;
  public parent: Contour | null = null;
  public children: Contour[] = [];
  public readonly shape: Shape | null;
  public readonly points: Vector2[];
  public readonly area: number;
  public readonly bounds: Bounds2;
  public readonly arcLength: number;

  public constructor(
    public readonly mat: cv.Mat | null
  ) {
    this.shape = mat ? contourToShape( mat ) : null;
    this.points = mat ? contourToPoints( mat ) : [];
    this.area = Contour.pointsToArea( this.points );
    this.bounds = this.shape ? this.shape.bounds : Bounds2.NOTHING;
    this.arcLength = this.shape ? this.shape.getArcLength() : 0;
  }

  // TODO: also called solidity? See https://docs.opencv.org/4.x/da/dc1/tutorial_js_contour_properties.html
  public getConvexity(): number {
    return this.area / Contour.pointsToArea( this.getConvexHullPoints() );
  }

  public getDiagonality(): number {
    return Contour.pointsToDiagonalityLength( this.points ) / this.arcLength;
  }

  public getBoundsSquarishness(): number {
    return Math.min( this.bounds.width / this.bounds.height, this.bounds.height / this.bounds.width );
  }

  public getConvexHullPoints(): Vector2[] {
    return ConvexHull2.grahamScan( this.points, false );
  }

  public getConvexHullArea(): number {
    return Contour.pointsToArea( this.getConvexHullPoints() );
  }

  public getConvexHullShape(): Shape {
    return Shape.polygon( this.getConvexHullPoints() );
  }

  // area / bounding rectangle area
  public getExtent(): number {
    return this.area / ( this.bounds.width * this.bounds.height );
  }

  // convex hull area / bounding rectangle area
  public getCornerExtent(): number {
    return this.getConvexHullArea() / ( this.bounds.width * this.bounds.height );
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

  // Also deduplicates
  public getClusteredXYPoints( threshold: number ): Vector2[] {

    const xMap = getCoordinateClusteredMap( this.points.map( point => point.x ), threshold );
    const yMap = getCoordinateClusteredMap( this.points.map( point => point.y ), threshold );

    const clusteredPoints: Vector2[] = [];

    this.points.forEach( point => {
      const newPoint = new Vector2( xMap.get( point.x )!, yMap.get( point.y )! );

      if ( clusteredPoints.length === 0 || !newPoint.equals( clusteredPoints[ clusteredPoints.length - 1 ] ) ) {
        clusteredPoints.push( newPoint );
      }
    } );
    while ( clusteredPoints.length > 1 && clusteredPoints[ 0 ].equals( clusteredPoints[ clusteredPoints.length - 1 ] ) ) {
      clusteredPoints.pop();
    }

    return clusteredPoints;
  }

  public static unoverlapLoop( points: Vector2[] ): Vector2[] {

    const getModulo = ( index: number ): Vector2 => points[ ( index + points.length ) % points.length ];

    let found = false;
    let endIndex = 0;
    for ( ; endIndex < points.length; endIndex++ ) {
      if ( getModulo( endIndex - 1 ).equals( getModulo( endIndex + 1 ) ) ) {
        found = true;
        break;
      }
    }

    if ( !found ) {
      throw new Error( 'Could not find a matching pair of points' );
    }

    const numAdditionalPoints = ( points.length - 2 ) / 2 + 1; // both endpoints are not repeated

    const linePoints = [ getModulo( endIndex ) ];

    for ( let i = 0; i < numAdditionalPoints; i++ ) {
      const delta = i + 1;

      const a = getModulo( endIndex - delta );
      const b = getModulo( endIndex + delta );

      if ( !a.equals( b ) ) {
        throw new Error( 'points not matching' );
      }
      linePoints.push( a );
    }

    return linePoints;
  }

  public static pointsToDiagonalityLength( polygon: Vector2[] ): number {
    let diagonalityLength = 0;

    for ( let j = 0; j < polygon.length; j++ ) {
      const p0 = polygon[ j ];
      const p1 = polygon[ ( j + 1 ) % polygon.length ];

      const isHorizontal = p0.y === p1.y;
      const isVertical = p0.x === p1.x;

      if ( !isHorizontal && !isVertical ) {
        const deltaX = Math.abs( p1.x - p0.x );
        const deltaY = Math.abs( p1.y - p0.y );

        diagonalityLength += Math.sqrt( 2 ) * Math.min( deltaX, deltaY );
      }
    }

    return diagonalityLength;
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
