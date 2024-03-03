import { Vector2 } from 'phet-lib/dot';
import { getSignedAreaDerivative } from '../core/createBoardDescriptor.ts';
import { Node } from 'phet-lib/scenery';
import { ArrowNode } from '../../../view/to-port/ArrowNode.ts';
import { LayoutVertex } from './layout.ts';
import { LayoutPuzzle } from './LayoutPuzzle.ts';

export class LayoutDerivative {
  public constructor(
    public readonly layoutPuzzle: LayoutPuzzle,
    public readonly derivatives: Map<LayoutVertex, Vector2>
  ) {}

  public plus( other: LayoutDerivative ): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    this.derivatives.forEach( ( derivative, vertex ) => {
      map.set( vertex, derivative.plus( other.derivatives.get( vertex )! ) );
    } );
    return new LayoutDerivative( this.layoutPuzzle, map );
  }

  public minus( other: LayoutDerivative ): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    this.derivatives.forEach( ( derivative, vertex ) => {
      map.set( vertex, derivative.minus( other.derivatives.get( vertex )! ) );
    } );
    return new LayoutDerivative( this.layoutPuzzle, map );
  }

  public timesScalar( scalar: number ): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    this.derivatives.forEach( ( derivative, vertex ) => {
      map.set( vertex, derivative.timesScalar( scalar ) );
    } );
    return new LayoutDerivative( this.layoutPuzzle, map );
  }

  public getAreaCorrectedDerivative(): LayoutDerivative {
    let derivative: LayoutDerivative = this;
    for ( let i = 0; i < 5; i++ ) {
      derivative = derivative.getAreaCorrectedDerivativeOnce();
    }
    return derivative;
  }

  public getAreaCorrectedDerivativeOnce(): LayoutDerivative {
    return this.plus( LayoutDerivative.getAreaScaledDeltas( this.layoutPuzzle, -this.getAreaDerivative() / this.layoutPuzzle.getSignedArea() ) );
  }

  public getAreaDerivative(): number {
    let areaDerivative = 0;
    this.layoutPuzzle.faces.forEach( face => {
      areaDerivative += getSignedAreaDerivative(
        face.vertices.map( vertex => vertex.viewCoordinates ),
        face.vertices.map( vertex => this.derivatives.get( vertex )! )
      );
    } );
    return areaDerivative;
  }

  public getDebugNode(): Node {
    const node = new Node();

    this.layoutPuzzle.vertices.forEach( vertex => {
      const derivative = this.derivatives.get( vertex )!;
      const point = vertex.viewCoordinates;

      const arrow = new ArrowNode( point.x, point.y, point.x + derivative.x, point.y + derivative.y, {
        lineWidth: 0.01,
        headHeight: 0.05,
        headWidth: 0.05,
        tailWidth: 0.005
      } );

      node.addChild( arrow );
    } );

    return node;
  }

  public static getAreaScaledDeltas( layoutPuzzle: LayoutPuzzle, scale: number ): LayoutDerivative {
    const centroid = layoutPuzzle.getCentroid();

    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach( vertex => {
      map.set( vertex, vertex.viewCoordinates.minus( centroid ).timesScalar( scale ) );
    } );
    return new LayoutDerivative( layoutPuzzle, map );
  }

  public static getBarycentricDeltas( layoutPuzzle: LayoutPuzzle ): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach( vertex => {
      const neighbors = vertex.edges.map( edge => edge.getOtherVertex( vertex ) );

      // TODO: average is the original spec... what happens when we do the centroid?
      const average = new Vector2( 0, 0 );
      neighbors.forEach( neighbor => average.add( neighbor.viewCoordinates ) );
      average.multiplyScalar( 1 / neighbors.length );

      const delta = average.subtract( vertex.viewCoordinates );

      map.set( vertex, delta );
    } );
    return new LayoutDerivative( layoutPuzzle, map );
  }
}