import { puzzleFont } from '../Theme.ts';

import { Shape } from 'phet-lib/kite';
import { Line, Node, Path, Rectangle, Text } from 'phet-lib/scenery';

import { Embedding } from '../../model/pattern/embedding/Embedding.ts';
import { BoardPatternBoard } from '../../model/pattern/pattern-board/BoardPatternBoard.ts';
import { TPatternBoard } from '../../model/pattern/pattern-board/TPatternBoard.ts';

export class EmbeddingNode extends Node {
  public constructor(
    public readonly pattern: TPatternBoard,
    public readonly targetBoard: BoardPatternBoard,
    public readonly embedding: Embedding,
  ) {
    super();

    const boardNode = new Node({
      scale: 30,
    });
    this.addChild(boardNode);

    targetBoard.board.faces.forEach((face) => {
      boardNode.addChild(
        new Path(Shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates)), {
          stroke: '#888',
          lineWidth: 0.02,
        }),
      );
    });

    const outsideBounds = boardNode.localBounds;

    // Add a transparent expansion, so our labels and expanded strokes don't throw off layout
    this.addChild(Rectangle.bounds(boardNode.bounds.dilated(5)));

    // Exit edges
    for (const [patternEdge, targetEdges] of embedding.getExitEdgeMap()) {
      const index = patternEdge.index;
      for (const targetEdge of targetEdges) {
        const edge = targetBoard.getEdge(targetEdge);

        const path = new Line(edge.vertices[0].viewCoordinates, edge.vertices[1].viewCoordinates, {
          stroke: '#066',
          lineWidth: 0.03,
        });
        boardNode.addChild(path);

        const label = new Text(index, {
          font: puzzleFont,
          maxWidth: 0.4,
          maxHeight: 0.4,
          center: edge.vertices[0].viewCoordinates.average(edge.vertices[1].viewCoordinates),
          fill: 'rgba(128,255,255,0.5)',
        });
        boardNode.addChild(label);
      }
    }

    // Non-exit edges
    for (const [patternEdge, targetEdge] of embedding.getNonExitEdgeMap()) {
      const edge = targetBoard.getEdge(targetEdge);
      const index = patternEdge.index;

      const path = new Line(edge.vertices[0].viewCoordinates, edge.vertices[1].viewCoordinates, {
        stroke: '#f00',
        lineWidth: 0.03,
      });
      boardNode.addChild(path);

      const label = new Text(index, {
        font: puzzleFont,
        maxWidth: 0.4,
        maxHeight: 0.4,
        center: edge.vertices[0].viewCoordinates.average(edge.vertices[1].viewCoordinates),
        fill: '#fff',
      });
      boardNode.addChild(label);
    }

    for (const [patternFace, targetFace] of embedding.getFaceMap()) {
      const face = targetBoard.getFace(targetFace);
      const index = patternFace.index;
      const isExit = patternFace.isExit;

      const shape =
        face ?
          Shape.polygon(face.vertices.map((vertex) => vertex.viewCoordinates))
        : Shape.bounds(outsideBounds.dilated(0.13)).shapeDifference(Shape.bounds(outsideBounds));

      const path = new Path(shape, {
        fill: isExit ? 'rgba(0,0,0,0.2)' : 'rgba(50,0,0,0.5)',
      });

      boardNode.addChild(path);

      if (face) {
        const getExitLocation = () => {
          const vertexPositions = targetBoard
            .getEdge(embedding.getNonExitEdgeMap().get(patternFace.edges[0])!)
            .vertices.map((v) => v.viewCoordinates);
          return face.viewCoordinates.average(vertexPositions[0].average(vertexPositions[1]));
        };

        const label = new Text(index, {
          font: puzzleFont,
          maxWidth: 0.4,
          maxHeight: 0.4,
          center: isExit ? getExitLocation() : face.viewCoordinates,
          fill: isExit ? '#f88' : '#8f8',
        });
        boardNode.addChild(label);
      }
    }

    for (const [patternVertex, targetVertex] of embedding.getVertexMap()) {
      const vertex = targetBoard.getVertex(targetVertex);
      const index = patternVertex.index;
      const isExit = patternVertex.isExit;

      const label = new Text(index, {
        font: puzzleFont,
        maxWidth: 0.4,
        maxHeight: 0.4,
        center: vertex.viewCoordinates,
        fill: isExit ? '#0ff' : '#88f',
      });
      boardNode.addChild(label);
    }
  }
}
