import { ShapeInteractionNode } from './ShapeInteractionNode.ts';

import { Shape } from 'phet-lib/kite';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TFace } from '../../model/board/core/TFace.ts';


// TODO: better options pattern!
export type FaceViewInteractionNodeOptions = {
  facePressListener: (face: TFace | null, button: 0 | 1 | 2) => void; // null is the "outside" face
};

export class FaceViewInteractionNode extends ShapeInteractionNode<TFace> {
  public constructor(board: TBoard, options: FaceViewInteractionNodeOptions) {
    super(
      board.faces,
      (face) => (face ? Shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates)) : new Shape()),
      options.facePressListener,
    );
  }
}
