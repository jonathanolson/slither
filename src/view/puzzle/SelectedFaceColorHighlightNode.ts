import { PuzzleBackgroundNode } from './PuzzleBackgroundNode.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

import { Shape } from 'phet-lib/kite';
import { Node, Path } from 'phet-lib/scenery';

import { TBoard } from '../../model/board/core/TBoard.ts';
import FaceColorState from '../../model/data/face-color/TFaceColorData.ts';
import { SelectedFaceColorHighlight } from '../../model/puzzle/SelectedFaceColorHighlight.ts';

export type SelectedFaceColorHighlightNodeOptions = {
  useBackgroundOffsetStroke: boolean;
  backgroundOffsetDistance: number;
};

export class SelectedFaceColorHighlightNode extends Node {
  public constructor(
    public readonly selectedFaceColorHighlight: SelectedFaceColorHighlight,
    board: TBoard,
    style: TPuzzleStyle,
    options: SelectedFaceColorHighlightNodeOptions,
  ) {
    let children: Node[] = [];

    try {
      let shape = new Shape();
      for (const face of selectedFaceColorHighlight.faces) {
        shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates));
      }

      if (selectedFaceColorHighlight.faceColor.colorState === FaceColorState.OUTSIDE) {
        try {
          const outerBoundaryShape = Shape.polygon(
            board.outerBoundary.map((halfEdge) => halfEdge.start.viewCoordinates),
          );
          const offsetBackgroundShape = PuzzleBackgroundNode.getOffsetBackgroundShape(
            board.outerBoundary,
            options.useBackgroundOffsetStroke,
            options.backgroundOffsetDistance,
          );

          const differenceShape = offsetBackgroundShape.shapeDifference(outerBoundaryShape);

          // Conditional so that we ensure it works if shape has no content yet, see https://github.com/jonathanolson/slither/issues/3
          shape = shape.bounds.isValid() ? shape.shapeUnion(differenceShape) : differenceShape;
        } catch (e) {
          console.error(e);
        }
      }

      const colorHighlightNode = new Path(shape.getOffsetShape(-0.07).getSimplifiedAreaShape(), {
        stroke: style.theme.selectedFaceColorHighlightColorProperty,
        lineWidth: 0.03,
      });

      children.push(colorHighlightNode);
    } catch (e) {
      console.error(e);
    }

    // if ( selectedFaceColorHighlight.face ) {
    //   const faceShape = Shape.polygon( selectedFaceColorHighlight.face.vertices.map( vertex => vertex.viewCoordinates ) );
    //   const faceHighlightNode = new Path( faceShape.getOffsetShape( -0.07 ), {
    //     // TODO: themify
    //     // fill: 'rgba(127,127,127,0.3)',
    //     stroke: 'rgba(127,127,127,1)',
    //     lineWidth: 0.01
    //   } );
    //
    //   children.push( faceHighlightNode );
    // }

    super({
      children: children,
    });
  }
}
