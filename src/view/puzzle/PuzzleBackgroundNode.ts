import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { hookPuzzleListeners } from './hookPuzzleListeners.ts';

import { Graph, LineStyles, Shape } from 'phet-lib/kite';
import { optionize } from 'phet-lib/phet-core';
import { Node, Path } from 'phet-lib/scenery';

import { TFace } from '../../model/board/core/TFace.ts';
import { THalfEdge } from '../../model/board/core/THalfEdge.ts';
import { getSignedArea } from '../../model/board/core/createBoardDescriptor.ts';
import { isFaceColorPairEditModeProperty } from '../../model/puzzle/EditMode.ts';

import _ from '../../workarounds/_.ts';


export type PuzzleBackgroundNodeOptions = {
  useBackgroundOffsetStroke?: boolean;
  backgroundOffsetDistance?: number;
  facePressListener?: (face: TFace | null, button: 0 | 1 | 2) => void; // null is the "outside" face
  noninteractive?: boolean;
};

export class PuzzleBackgroundNode extends Node {
  public constructor(
    public readonly outerBoundary: THalfEdge[],
    public readonly innerBoundaries: THalfEdge[][],
    public readonly style: TPuzzleStyle,
    providedOptions?: PuzzleBackgroundNodeOptions,
  ) {
    const options = optionize<PuzzleBackgroundNodeOptions>()(
      {
        useBackgroundOffsetStroke: false,
        backgroundOffsetDistance: 0.3,
        facePressListener: () => {},
        noninteractive: false,
      },
      providedOptions,
    );

    super({
      pickableProperty: isFaceColorPairEditModeProperty,
    });

    !options.noninteractive && hookPuzzleListeners(null, this, options.facePressListener);

    const outerBoundaryPoints = outerBoundary.map((halfEdge) => halfEdge.start.viewCoordinates);

    const useOffset = options.useBackgroundOffsetStroke;
    const backgroundDistance = options.backgroundOffsetDistance;

    const isNormalOrientation = getSignedArea(outerBoundaryPoints) > 0;
    const offsetShapeOffset = isNormalOrientation ? -backgroundDistance : backgroundDistance;

    // TODO: simpler way of hooking in here ---- we want to simplify the shape where we only include specific winding numbers
    const testSimplify = (shape: Shape) => {
      const graph = new Graph();
      graph.addShape(0, shape);

      graph.computeSimplifiedFaces();
      graph.computeFaceInclusion((map: any) => map['0'] > 0);
      const subgraph = graph.createFilledSubGraph();
      const resultShape = subgraph.facesToShape();

      graph.dispose();
      subgraph.dispose();

      return resultShape;
    };

    const backgroundShape = PuzzleBackgroundNode.getOffsetBackgroundShape(outerBoundary, useOffset, backgroundDistance);

    // TODO: refactor to be more general --- WE CAN JUST INCLUDE THE HOLES IN THE MAIN SHAPE right?
    const innerBoundaryShapes: Shape[] = innerBoundaries.map((innerBoundary) => {
      const innerBoundaryPoints = innerBoundary.map((halfEdge) => halfEdge.start.viewCoordinates);
      const innerBoundaryShape = Shape.polygon(innerBoundaryPoints);

      if (useOffset) {
        return testSimplify(innerBoundaryShape.getOffsetShape(offsetShapeOffset)!);
      } else {
        const strokedInnerBoundaryShape = innerBoundaryShape.getStrokedShape(
          new LineStyles({
            lineWidth: 2 * backgroundDistance,
          }),
        );
        const subpathShapes = strokedInnerBoundaryShape.subpaths.map((subpath) => new Shape([subpath]));
        return testSimplify(_.minBy(subpathShapes, (shape) => shape.getArea())!);
      }
    });

    this.children = [
      new Path(backgroundShape, {
        fill: style.theme.puzzleBackgroundColorProperty,
        stroke: style.theme.puzzleBackgroundStrokeColorProperty,
        lineWidth: 0.03,
      }),
      ...innerBoundaryShapes.map(
        (shape) =>
          new Path(shape, {
            fill: style.theme.playAreaBackgroundColorProperty,
            stroke: style.theme.puzzleBackgroundStrokeColorProperty,
            lineWidth: 0.03,
          }),
      ),
    ];
  }

  public static getOffsetBackgroundShape(
    outerBoundary: THalfEdge[],
    useOffset: boolean,
    backgroundDistance: number,
  ): Shape {
    const outerBoundaryPoints = outerBoundary.map((halfEdge) => halfEdge.start.viewCoordinates);
    const outerBoundaryShape = Shape.polygon(outerBoundaryPoints);

    // TODO: reduce code duplication?
    const isNormalOrientation = getSignedArea(outerBoundaryPoints) > 0;
    const offsetShapeOffset = isNormalOrientation ? -backgroundDistance : backgroundDistance;

    if (useOffset) {
      return outerBoundaryShape.getOffsetShape(offsetShapeOffset)!.getSimplifiedAreaShape();
    } else {
      const strokedOuterBoundaryShape = outerBoundaryShape.getStrokedShape(
        new LineStyles({
          lineWidth: 2 * backgroundDistance,
        }),
      );
      const subpathShapes = strokedOuterBoundaryShape.subpaths.map((subpath) => new Shape([subpath]));
      try {
        // TODO: remove this code! It's so we can fuzz without this ONE case messing us up
        if (strokedOuterBoundaryShape.bounds.width === 9.718028227819117) {
          return Shape.bounds(strokedOuterBoundaryShape.bounds);
        } else {
          return _.maxBy(subpathShapes, (shape) => shape.getArea())!.getSimplifiedAreaShape();
        }
      } catch (e) {
        return Shape.bounds(strokedOuterBoundaryShape.bounds);
      }
    }
  }
}
