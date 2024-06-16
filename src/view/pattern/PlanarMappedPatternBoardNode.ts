import { puzzleFont } from '../Theme.ts';

import { Shape } from 'phet-lib/kite';
import { optionize } from 'phet-lib/phet-core';
import { Circle, Line, Node, Path, Text } from 'phet-lib/scenery';

import { getCentroid } from '../../model/board/core/createBoardDescriptor.ts';
import { TPlanarMappedPatternBoard } from '../../model/pattern/pattern-board/planar-map/TPlanarMappedPatternBoard.ts';

export type PlanarMappedPatternBoardNodeOptions = {
  labels?: boolean;
};

export class PlanarMappedPatternBoardNode extends Node {
  public constructor(
    public readonly planarMappedPatternBoard: TPlanarMappedPatternBoard,
    providedOptions?: PlanarMappedPatternBoardNodeOptions,
  ) {
    const options = optionize<PlanarMappedPatternBoardNodeOptions>()(
      {
        labels: false,
      },
      providedOptions,
    );

    const patternBoard = planarMappedPatternBoard.patternBoard;
    const planarPatternMap = planarMappedPatternBoard.planarPatternMap;

    // TODO: move scale elsewhere?
    const container = new Node({
      scale: 30,
    });

    patternBoard.faces.forEach((face) => {
      const isExit = face.isExit;

      const points = planarPatternMap.faceMap.get(face)!;
      const shape = Shape.polygon(points);

      container.addChild(
        new Path(shape, {
          lineWidth: 0.02,
          fill: isExit ? '#377' : '#000',
        }),
      );
    });

    patternBoard.sectors.forEach((sector) => {
      const points = planarPatternMap.sectorMap.get(sector)!;

      // TODO: consider deduplicating this with SectorNode
      const startPoint = points[0];
      const vertexPoint = points[1];
      const endPoint = points[2];

      const startDelta = startPoint.minus(vertexPoint);
      const endDelta = endPoint.minus(vertexPoint);

      const startUnit = startDelta.normalized();

      const startAngle = startDelta.angle;
      let endAngle = endDelta.angle;
      if (endAngle < startAngle) {
        endAngle += 2 * Math.PI;
      }

      const radius = 0.25;
      const shape = new Shape()
        .moveToPoint(vertexPoint)
        .lineToPoint(startUnit.timesScalar(radius).plus(vertexPoint))
        .arcPoint(vertexPoint, radius, startAngle, endAngle, true)
        .close()
        .makeImmutable();

      container.addChild(
        new Path(shape, {
          stroke: '#fa6',
          lineWidth: 0.02,
        }),
      );
    });

    patternBoard.edges.forEach((edge) => {
      if (edge.isExit) {
        return;
      }

      const points = planarPatternMap.edgeMap.get(edge)!;

      container.addChild(
        new Line(points[0], points[1], {
          stroke: '#fff',
          lineWidth: 0.02,
        }),
      );
    });

    patternBoard.vertices.forEach((vertex) => {
      const isExit = vertex.isExit;

      container.addChild(
        new Circle(isExit ? 0.1 : 0.07, {
          center: planarPatternMap.vertexMap.get(vertex)!,
          lineWidth: 0.02,
          stroke: '#ccc',
          fill: isExit ? '#222' : '#ccc',
        }),
      );
    });

    if (options.labels) {
      patternBoard.faces.forEach((face) => {
        const isExit = face.isExit;

        const points = planarPatternMap.faceMap.get(face)!;
        const centroid = getCentroid(points);

        container.addChild(
          new Text(face.index, {
            font: puzzleFont,
            center: centroid,
            fill: isExit ? '#0ff' : '#0f0',
            maxWidth: 0.5,
            maxHeight: 0.5,
          }),
        );
      });

      patternBoard.vertices.forEach((vertex) => {
        const point = planarPatternMap.vertexMap.get(vertex)!;

        container.addChild(
          new Text(vertex.index, {
            font: puzzleFont,
            center: point,
            fill: '#fff',
            maxWidth: 0.5,
            maxHeight: 0.5,
          }),
        );
      });
    }

    super({
      children: [container],
    });
  }
}
