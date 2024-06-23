import { getCentroid, getSignedArea, getSignedAreaDerivative } from '../core/createBoardDescriptor.ts';
import { LayoutPuzzle } from './LayoutPuzzle.ts';
import { LayoutVertex } from './layout.ts';

import { DotUtils, Matrix, Matrix3, SingularValueDecomposition, Vector2 } from 'phet-lib/dot';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class LayoutDerivative {
  public constructor(
    public readonly layoutPuzzle: LayoutPuzzle,
    public readonly derivatives: Map<LayoutVertex, Vector2>,
  ) {}

  public plus(other: LayoutDerivative): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    this.derivatives.forEach((derivative, vertex) => {
      map.set(vertex, derivative.plus(other.derivatives.get(vertex)!));
    });
    return new LayoutDerivative(this.layoutPuzzle, map);
  }

  public minus(other: LayoutDerivative): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    this.derivatives.forEach((derivative, vertex) => {
      map.set(vertex, derivative.minus(other.derivatives.get(vertex)!));
    });
    return new LayoutDerivative(this.layoutPuzzle, map);
  }

  public timesScalar(scalar: number): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    this.derivatives.forEach((derivative, vertex) => {
      map.set(vertex, derivative.timesScalar(scalar));
    });
    return new LayoutDerivative(this.layoutPuzzle, map);
  }

  public getMaxMagnitude(): number {
    let maxMagnitude = 0;
    this.derivatives.forEach((derivative) => {
      maxMagnitude = Math.max(maxMagnitude, derivative.getMagnitude());
    });
    return maxMagnitude;
  }

  public getAreaCorrectedDerivative(): LayoutDerivative {
    let derivative: LayoutDerivative = this;
    for (let i = 0; i < 5; i++) {
      derivative = derivative.getAreaCorrectedDerivativeOnce();
    }
    return derivative;
  }

  public getAreaCorrectedDerivativeOnce(): LayoutDerivative {
    return this.plus(
      LayoutDerivative.getAreaScaledDeltas(
        this.layoutPuzzle,
        -this.getAreaDerivative() / this.layoutPuzzle.getSignedArea(),
      ),
    );
  }

  public getAreaDerivative(): number {
    let areaDerivative = 0;
    this.layoutPuzzle.faces.forEach((face) => {
      areaDerivative += getSignedAreaDerivative(
        face.vertices.map((vertex) => vertex.viewCoordinates),
        face.vertices.map((vertex) => this.derivatives.get(vertex)!),
      );
    });
    return areaDerivative;
  }

  // public getDebugNode(): Node {
  //   const node = new Node();
  //
  //   this.layoutPuzzle.vertices.forEach((vertex) => {
  //     const derivative = this.derivatives.get(vertex)!;
  //     const point = vertex.viewCoordinates;
  //
  //     const arrow = new ArrowNode(point.x, point.y, point.x + derivative.x, point.y + derivative.y, {
  //       lineWidth: 0.01,
  //       headHeight: 0.05,
  //       headWidth: 0.05,
  //       tailWidth: 0.005,
  //       fill: 'green',
  //       stroke: 'green',
  //     });
  //
  //     node.addChild(arrow);
  //   });
  //
  //   return node;
  // }

  public static getAreaScaledDeltas(layoutPuzzle: LayoutPuzzle, scale: number): LayoutDerivative {
    const centroid = layoutPuzzle.getCentroid();

    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach((vertex) => {
      const force = vertex.viewCoordinates.minus(centroid).timesScalar(scale);
      assertEnabled() && assert(force.isFinite());

      map.set(vertex, force);
    });
    return new LayoutDerivative(layoutPuzzle, map);
  }

  public static getHookesAttraction(layoutPuzzle: LayoutPuzzle, idealLength: number, k: number): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach((vertex) => {
      map.set(vertex, Vector2.ZERO.copy());
    });
    layoutPuzzle.edges.forEach((edge) => {
      const a = edge.start.viewCoordinates;
      const b = edge.end.viewCoordinates;

      const delta = b.minus(a);
      const distance = delta.getMagnitude();

      const force = delta.timesScalar(((distance - idealLength) * k) / distance);
      assertEnabled() && assert(force.isFinite());

      map.get(edge.start)!.add(force);
      map.get(edge.end)!.subtract(force);
    });
    return new LayoutDerivative(layoutPuzzle, map);
  }

  // TODO: note in description that we also handle the negative-signed-area constraint (and overlap/almost-overlap)
  public static getRegularPolygonDeltas(
    layoutPuzzle: LayoutPuzzle,
    idealLength: number,
    onlyValuedFaces: boolean,
    normalStrength: number,
  ): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach((vertex) => {
      map.set(vertex, Vector2.ZERO.copy());
    });

    const getCircumradiusFromSide = (n: number): number => {
      return idealLength / (2 * Math.sin(Math.PI / n));
    };

    // console.log( 'regular' );

    layoutPuzzle.faces.forEach((face) => {
      // For now
      if (face.vertices.length < 3) {
        return;
      }

      const minSignedArea = 0.2;
      const minDistanceFromOther = 0.3;

      const points = face.vertices.map((vertex) => vertex.viewCoordinates);

      let additionalStrenthRatio = 0;

      // If we have negative signed area, we need to fix our orientation STRONGLY
      const signedArea = getSignedArea(points);
      if (signedArea < 0) {
        additionalStrenthRatio = 1;
      } else if (signedArea < minSignedArea) {
        additionalStrenthRatio = Math.max(additionalStrenthRatio, (minSignedArea - signedArea) / minSignedArea);
      }

      // For each line segment, ensure that each other non-adjacent line segment is at least minDistanceFromOther away
      for (let i = 0; i < points.length; i++) {
        if (additionalStrenthRatio >= 1) {
          break;
        }

        const aIndex = i;
        const bIndex = (i + 1) % points.length;

        const a = points[aIndex];
        const b = points[bIndex];

        for (let j = i + 2; j < points.length - (i === 0 ? 1 : 0); j++) {
          if (additionalStrenthRatio >= 1) {
            break;
          }

          const cIndex = j % points.length;
          const dIndex = (j + 1) % points.length;

          const c = points[cIndex];
          const d = points[dIndex];

          if (DotUtils.lineSegmentIntersection(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y)) {
            assertEnabled() && assert(points.length >= 4);

            // console.log( 'INTERSECTION' );
            additionalStrenthRatio = 1;
          } else {
            const distance = Math.min(
              DotUtils.distToSegment(a, c, d),
              DotUtils.distToSegment(b, c, d),
              DotUtils.distToSegment(c, a, b),
              DotUtils.distToSegment(d, a, b),
            );

            if (distance < minDistanceFromOther) {
              additionalStrenthRatio = Math.max(
                additionalStrenthRatio,
                (minDistanceFromOther - distance) / minDistanceFromOther,
              );
            }
          }
        }
      }

      if (additionalStrenthRatio === 0 && onlyValuedFaces && layoutPuzzle.getFaceValue(face) === null) {
        return;
      }

      const centroid = getCentroid(points);
      assertEnabled() && assert(centroid.isFinite());

      const radius = getCircumradiusFromSide(points.length);

      const currentDeltas = points.map((point) => point.minus(centroid));
      const circleDeltas = points.map((point, i) => Vector2.createPolar(radius, (2 * Math.PI * i) / points.length));
      const idealDeltas = LayoutDerivative.getLeastSquares(currentDeltas, circleDeltas);

      // TODO: don't over-strength this?
      const strength = normalStrength + (2 - normalStrength) * additionalStrenthRatio;
      // console.log( additionalStrenthRatio );

      const forces = points.map((point, i) => idealDeltas[i].minus(currentDeltas[i]).timesScalar(strength));
      face.vertices.forEach((vertex, i) => {
        const force = forces[i];
        assertEnabled() && assert(force.isFinite());

        map.get(vertex)!.add(force);
      });
    });

    return new LayoutDerivative(layoutPuzzle, map);
  }

  public static getBarycentricDeltas(layoutPuzzle: LayoutPuzzle): LayoutDerivative {
    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach((vertex) => {
      const neighbors = vertex.edges.map((edge) => edge.getOtherVertex(vertex));

      // TODO: average is the original spec... what happens when we do the centroid?
      const average = new Vector2(0, 0);
      neighbors.forEach((neighbor) => average.add(neighbor.viewCoordinates));
      average.multiplyScalar(1 / neighbors.length);

      const force = average.subtract(vertex.viewCoordinates);
      assertEnabled() && assert(force.isFinite());

      map.set(vertex, force);
    });
    return new LayoutDerivative(layoutPuzzle, map);
  }

  public static getAngularDeltas(layoutPuzzle: LayoutPuzzle, multiplier: number): LayoutDerivative {
    // create zero forces
    const map = new Map<LayoutVertex, Vector2>();
    layoutPuzzle.vertices.forEach((vertex) => {
      map.set(vertex, Vector2.ZERO.copy());
    });

    layoutPuzzle.vertices.forEach((vertex) => {
      const neighbors = vertex.edges.map((edge) => edge.getOtherVertex(vertex));

      // // TODO
      // if ( neighbors.length < 3 ) {
      //   return;
      // }

      // Get the current order of neighbors (and remap so it has the same start neighbor)
      let currentlyOrderedNeighbors = _.sortBy(neighbors, (neighbor) =>
        neighbor.viewCoordinates.minus(vertex.viewCoordinates).getAngle(),
      );
      if (currentlyOrderedNeighbors[0] !== neighbors[0]) {
        const index = currentlyOrderedNeighbors.indexOf(neighbors[0]);
        currentlyOrderedNeighbors = [
          ...currentlyOrderedNeighbors.slice(index),
          ...currentlyOrderedNeighbors.slice(0, index),
        ];
      }

      const orderedCorrectly = _.range(0, neighbors.length).every((i) => currentlyOrderedNeighbors[i] === neighbors[i]);

      const neighborDirections = neighbors.map((neighbor) =>
        neighbor.viewCoordinates.minus(vertex.viewCoordinates).normalized(),
      );
      const idealDirections = LayoutDerivative.getUnitLeastSquares(neighborDirections);

      // Find the minimized dot product we can hope for TODO: any one should work, they should be equal?
      const minimizedDotProduct = Math.max(
        ..._.range(0, neighbors.length).map((i) => {
          return idealDirections[i].dot(idealDirections[(i + 1) % neighbors.length]);
        }),
      );

      const currentMaxDotProduct = Math.max(
        ..._.range(0, neighbors.length).map((i) => {
          return neighborDirections[i].dot(neighborDirections[(i + 1) % neighbors.length]);
        }),
      );

      // TODO: make twixt available!
      const ease = (n: number, t: number): number => {
        if (t <= 0.5) {
          return 0.5 * Math.pow(2 * t, n);
        } else {
          return 1 - ease(n, 1 - t);
        }
      };

      const ratio = orderedCorrectly ? DotUtils.linear(minimizedDotProduct, 1, 0, 1, currentMaxDotProduct) : 1;

      const minThreshold = 0.75;

      if (ratio > minThreshold) {
        const modRatio = (ratio - minThreshold) / (1 - minThreshold);
        const magnitude = ease(2, modRatio);

        const netForce = new Vector2(0, 0);

        for (let i = 0; i < neighbors.length; i++) {
          const neighbor = neighbors[i];

          const direction = neighborDirections[i];
          const ideal = idealDirections[i];

          // TODO: try dividing by length? also... make perpendicular?
          const force = ideal.minus(direction.timesScalar(ideal.dot(direction))).timesScalar(magnitude * multiplier);
          netForce.add(force);
          assertEnabled() && assert(force.isFinite());
          // const force = ideal.minus( direction ).timesScalar( magnitude );
          // const force = ideal.minus( direction ).normalized().timesScalar( magnitude );

          map.get(neighbor)!.add(force);
        }

        // Even things out.. somewhat?
        // map.get( vertex )!.subtract( netForce.timesScalar( 0.5 ) );
        // map.get( vertex )!.subtract( netForce );
        netForce.multiplyScalar(1 / neighbors.length);
        for (const neighbor of neighbors) {
          assertEnabled() && assert(netForce);
          map.get(neighbor)!.subtract(netForce);
        }
      }
    });

    return new LayoutDerivative(layoutPuzzle, map);
  }

  // Unit vectors for each neighboring vertex
  public static getUnitLeastSquares(inputNormals: Vector2[]): Vector2[] {
    const n = inputNormals.length;
    const idealNormals = _.range(0, n).map((i) => {
      return Vector2.createPolar(1, (2 * Math.PI * i) / n);
    });

    return LayoutDerivative.getLeastSquares(inputNormals, idealNormals);
  }

  // Unit vectors for each neighboring vertex, assuming a centroid of 0
  public static getLeastSquares(inputPoints: Vector2[], idealPoints: Vector2[]): Vector2[] {
    const n = inputPoints.length;

    // for least squares, X = ideals, Y = inputs
    const matX = new Matrix(2, n, [...idealPoints.map((v) => v.x), ...idealPoints.map((v) => v.y)]);
    const matY = new Matrix(2, n, [...inputPoints.map((v) => v.x), ...inputPoints.map((v) => v.y)]);

    const matM = matX.times(matY.transpose());

    const svd = new SingularValueDecomposition(matM);

    let rotation = svd.getV().times(svd.getU().transpose());
    if (rotation.det() < 0) {
      rotation = svd
        .getV()
        .times(Matrix.diagonalMatrix([1, -1]))
        .times(svd.getU().transpose());
    }

    const rotation3 = new Matrix3().rowMajor(
      rotation.get(0, 0),
      rotation.get(0, 1),
      0,
      rotation.get(1, 0),
      rotation.get(1, 1),
      0,
      0,
      0,
      1,
    );

    return idealPoints.map((normal) => {
      const result = rotation3.timesVector2(normal);
      assertEnabled() && assert(result.isFinite());

      return result;
    });
  }
}
