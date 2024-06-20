import { BaseBoard } from './BaseBoard.ts';
import { TBoard } from './TBoard.ts';
import { TStructure } from './TStructure.ts';
import {
  TFaceDescriptor,
  TVertexDescriptor,
  createBoardDescriptor,
  rescaleProtoDescriptorMinimum,
} from './createBoardDescriptor.ts';

import { Vector2 } from 'phet-lib/dot';

import { getCoordinateClusteredMap } from '../../../util/getCoordinateClusteredMap.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class PolygonalBoard extends BaseBoard<TStructure> implements TBoard {
  public constructor(
    public readonly polygons: Vector2[][],
    public readonly scale: number,
  ) {
    const xValues = polygons.flatMap((polygon) => polygon.map((vertex) => vertex.x));
    const yValues = polygons.flatMap((polygon) => polygon.map((vertex) => vertex.y));

    // TODO: improve epsilon?
    const xMap = getCoordinateClusteredMap(xValues, 0.0001);
    const yMap = getCoordinateClusteredMap(yValues, 0.0001);

    const vertexDescriptors: TVertexDescriptor[] = [];
    const vertexDescriptorMap = new Map<string, TVertexDescriptor>();

    // Return vertex descriptors lazily
    const getVertexDescriptor = (vertex: Vector2): TVertexDescriptor => {
      const x = xMap.get(vertex.x)!;
      const y = yMap.get(vertex.y)!;

      assertEnabled() && assert(x !== undefined && y !== undefined);

      const keyString = `${x},${y}`;
      if (!vertexDescriptorMap.has(keyString)) {
        const vertexDescriptor: TVertexDescriptor = {
          // TODO: should we improve our logical coordinates somehow? (just number them for now)
          logicalCoordinates: new Vector2(0, vertexDescriptorMap.size),
          viewCoordinates: new Vector2(x, y).timesScalar(scale),
        };
        vertexDescriptorMap.set(keyString, vertexDescriptor);
        vertexDescriptors.push(vertexDescriptor);
      }

      return vertexDescriptorMap.get(keyString)!;
    };

    const faceDescriptors: TFaceDescriptor[] = polygons.map((polygon, i) => {
      return {
        // TODO: should we improve our logical coordinates somehow? (just number them for now)
        logicalCoordinates: new Vector2(i, 0),
        vertices: polygon.map(getVertexDescriptor),
      };
    });

    super(
      createBoardDescriptor(
        rescaleProtoDescriptorMinimum(
          {
            vertices: vertexDescriptors,
            faces: faceDescriptors,
          },
          scale,
        ),
      ),
    );
  }
}
