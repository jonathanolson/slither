import { BaseBoard } from '../core/BaseBoard.ts';
import { TBoard } from '../core/TBoard.ts';
import { TStructure } from '../core/TStructure.ts';
import { TFaceDescriptor, TVertexDescriptor, createBoardDescriptor } from '../core/createBoardDescriptor.ts';
import { validateBoard } from '../core/validateBoard.ts';

import { Vector2 } from 'phet-lib/dot';

import _ from '../../../workarounds/_.ts';
import { assertEnabled } from '../../../workarounds/assert.ts';

export class SquareBoard extends BaseBoard<TStructure> implements TBoard {
  public readonly isSquare = true;

  public constructor(
    // width/height for faces
    public readonly width: number,
    public readonly height: number,
  ) {
    const vertexDescriptors: TVertexDescriptor[] = [];
    const vertexMap: Map<string, TVertexDescriptor> = new Map();
    const getVertexDescriptor = (x: number, y: number): TVertexDescriptor => {
      const keyString = `${x},${y}`;
      if (!vertexMap.has(keyString)) {
        const vertexDescriptor = {
          logicalCoordinates: new Vector2(x, y),
          viewCoordinates: new Vector2(x, y),
        };
        vertexDescriptors.push(vertexDescriptor);
        vertexMap.set(keyString, vertexDescriptor);
      }
      return vertexMap.get(keyString)!;
    };

    const faceDescriptors: TFaceDescriptor[] = _.range(0, height).flatMap((y) =>
      _.range(0, width).map((x) => {
        return {
          logicalCoordinates: new Vector2(x, y),
          vertices: [
            getVertexDescriptor(x, y),
            getVertexDescriptor(x + 1, y),
            getVertexDescriptor(x + 1, y + 1),
            getVertexDescriptor(x, y + 1),
          ],
        };
      }),
    );

    // TODO: use createBoardDescriptor instead, if we can skip the square-specific info.
    super(
      createBoardDescriptor({
        vertices: vertexDescriptors,
        faces: faceDescriptors,
      }),
    );

    assertEnabled() && validateBoard(this);
  }
}
