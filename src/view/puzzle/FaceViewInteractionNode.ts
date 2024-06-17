import { isDragModeProperty } from '../PanDragMode.ts';
import { ShapeInteractionNode } from './ShapeInteractionNode.ts';

import { Shape } from 'phet-lib/kite';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TFace } from '../../model/board/core/TFace.ts';

// TODO: better options pattern!
export type FaceViewInteractionNodeOptions = {
  facePressListener: (face: TFace | null, button: 0 | 1 | 2) => void; // null is the "outside" face

  onFaceDragStart?: (face: TFace | null, button: 0 | 2) => void;
  onFaceDrag?: (face: TFace | null) => void;
  onFaceDragEnd?: () => void;
};

export class FaceViewInteractionNode extends ShapeInteractionNode<TFace | null> {
  public constructor(board: TBoard, options: FaceViewInteractionNodeOptions) {
    super(
      board.faces,
      (face) => (face ? Shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates)) : new Shape()),
      options.facePressListener,
      {
        isDragModeProperty: isDragModeProperty,
        onDragStart: options.onFaceDragStart,
        onDrag: options.onFaceDrag,
        onDragEnd: options.onFaceDragEnd,
        noItemItem: null,
      },
    );
  }
}
