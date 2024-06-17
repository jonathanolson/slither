import { currentTheme } from './Theme.ts';

import { LineStyles, Shape, Subpath } from 'phet-lib/kite';
import { GaussianBlur, Node, Path } from 'phet-lib/scenery';

import { CorrectnessState } from '../model/CorrectnessState.ts';
import { TBoard } from '../model/board/core/TBoard.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { TFace } from '../model/board/core/TFace.ts';

export class CorrectnessStateNode extends Node {
  public constructor(board: TBoard, correctnessState: CorrectnessState) {
    // TODO: consider showing only face highlights WHEN we are allowing editing of faces
    // allowFaceColorEditProperty or allowAbsoluteFaceColorEditProperty? on currentPuzzleStyle?

    const edgeSubpaths: Subpath[] = [];
    const faceSubpaths: Subpath[] = [];

    const addStrokedEdgeShape = (shape: Shape): void => {
      const strokedShape = shape.getStrokedShape(
        new LineStyles({
          lineWidth: 0.3,
          lineCap: 'round',
          lineJoin: 'round',
        }),
      );

      edgeSubpaths.push(...strokedShape.subpaths);
    };

    const addDilatedFaceShape = (shape: Shape): void => {
      const dilatedShape = shape.getOffsetShape(-0.1);

      faceSubpaths.push(...dilatedShape.subpaths);
    };

    const addBadEdge = (edge: TEdge) => {
      addStrokedEdgeShape(new Shape().moveToPoint(edge.start.viewCoordinates).lineToPoint(edge.end.viewCoordinates));
    };

    const addBadFace = (face: TFace) => {
      addDilatedFaceShape(Shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates)));
    };

    correctnessState.incorrectEdges.forEach(addBadEdge);
    correctnessState.incorrectFaces.forEach(addBadFace);

    super({
      children: [
        new Path(new Shape(edgeSubpaths), {
          fill: currentTheme.incorrectEdgeColorProperty,
        }),
        new Path(new Shape(faceSubpaths), {
          fill: currentTheme.incorrectFaceColorProperty,
        }),
      ],
      pickable: false,
      filters: [new GaussianBlur(0.1)],
    });
  }
}
