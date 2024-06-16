import { puzzleFont } from '../Theme.ts';
import { UIText } from '../UIText.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';
import { Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { Circle, GridBox, Node, Path } from 'phet-lib/scenery';

import { TEdge } from '../../model/board/core/TEdge.ts';
import { TFace } from '../../model/board/core/TFace.ts';
import { TState } from '../../model/data/core/TState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { TFaceStateData } from '../../model/data/face-state/TFaceStateData.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';


export class FaceStateNode extends Node {
  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<TFaceStateData & TEdgeStateData>>,
    style: TPuzzleStyle,
  ) {
    super({
      translation: face.viewCoordinates,
    });

    const state = stateProperty.value;

    const faceState = state.getFaceState(face);

    const onlyShowCount = faceState.possibilityCount === 0 || faceState.possibilityCount > 9;

    let content: Node;

    const color =
      faceState.possibilityCount === 1 ?
        style.theme.faceValueCompletedColorProperty
      : style.theme.faceValueColorProperty;

    if (onlyShowCount) {
      content = new UIText(faceState.possibilityCount, {
        font: puzzleFont,
        maxWidth: 0.4,
        maxHeight: 0.4,
      });
    } else {
      const vertices = new Set(face.vertices);

      content = new GridBox({
        spacing: 1.5,
        autoColumns: Math.ceil(Math.sqrt(faceState.possibilityCount)),
        children: faceState.getAllowedCombinations().map((blackEdges) => {
          const node = new Node();

          const startVertices = new Set(blackEdges.map((edge) => edge.start));
          const endVertices = new Set(blackEdges.map((edge) => edge.end));

          const mvt = (v: Vector2) => v.minus(face.viewCoordinates);

          node.addChild(
            new Path(Shape.polygon(face.vertices.map((vertex) => mvt(vertex.viewCoordinates))), {
              stroke: color,
              lineWidth: 0.03,
              opacity: 0.2,
            }),
          );

          if (startVertices.size) {
            const shape = new Shape();
            if (blackEdges.length === face.edges.length) {
              shape.polygon(face.vertices.map((vertex) => mvt(vertex.viewCoordinates)));
            } else {
              const remainingEdges = new Set(blackEdges);

              while (remainingEdges.size) {
                const firstVertex = [...vertices].find(
                  (vertex) =>
                    [...remainingEdges].filter((edge) => edge.start === vertex || edge.end === vertex).length === 1,
                )!;
                assertEnabled() && assert(firstVertex);

                let currentVertex = firstVertex;
                let nextEdge: TEdge | null =
                  [...remainingEdges].find((edge) => edge.start === currentVertex || edge.end === currentVertex) ??
                  null;
                shape.moveToPoint(mvt(currentVertex.viewCoordinates));
                while (nextEdge) {
                  remainingEdges.delete(nextEdge);
                  currentVertex = nextEdge.getOtherVertex(currentVertex);
                  shape.lineToPoint(mvt(currentVertex.viewCoordinates));
                  nextEdge =
                    [...remainingEdges].find((edge) => edge.start === currentVertex || edge.end === currentVertex) ??
                    null;
                }
              }
            }

            node.addChild(
              new Path(shape, {
                stroke: color,
                lineWidth: 0.15,
                lineCap: 'round',
                lineJoin: 'round',
              }),
            );
          }

          for (const vertex of face.vertices) {
            if (!startVertices.has(vertex) && !endVertices.has(vertex)) {
              node.addChild(
                new Circle(0.1, {
                  fill: color,
                  translation: mvt(vertex.viewCoordinates),
                }),
              );
            }
          }

          return node;
        }),
        maxWidth: 0.6,
        maxHeight: 0.6,
      });
    }

    content.center = Vector2.ZERO;
    this.addChild(content);
  }
}
