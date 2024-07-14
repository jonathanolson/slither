import { currentTheme } from './Theme.ts';
import { UIRichText } from './UIRichText.ts';
import { EmbeddedPatternRuleNode } from './pattern/EmbeddedPatternRuleNode.ts';
import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';

import { Bounds2 } from 'phet-lib/dot';
import { LineStyles, Shape, Subpath } from 'phet-lib/kite';
import { Orientation } from 'phet-lib/phet-core';
import { FireListener, GaussianBlur, Node, Path, TPaint } from 'phet-lib/scenery';
import { Panel } from 'phet-lib/sun';

import { TBoard } from '../model/board/core/TBoard.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { TVertex } from '../model/board/core/TVertex.ts';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { DisplayEmbedding } from '../model/pattern/embedding/DisplayEmbedding.ts';

import _ from '../workarounds/_.ts';

export class AnnotationNode extends Node {
  public constructor(
    public readonly board: TBoard,
    public readonly annotation: TAnnotation,
    // TODO: ... use this for the theme/etc.
    public readonly style: TPuzzleStyle,
    // If provided, additional can be provided (e.g. with patterns)
    additionalContentLayoutBounds: Bounds2 | null = null,
  ) {
    let children: Node[];

    const addStringDescription = (description: string): void => {
      if (additionalContentLayoutBounds) {
        const stringNode = new Panel(
          new UIRichText(description, {
            scale: 0.02,
            lineWrap: 200,
          }),
          {
            pickable: false,
            xMargin: 0.2,
            yMargin: 0.2,
            lineWidth: 0.02,
            cornerRadius: 0.2,
            fill: currentTheme.uiBackgroundColorProperty,
            stroke: currentTheme.uiForegroundColorProperty,
          },
        );

        console.log(stringNode.bounds);

        const centerBounds = children.reduce((bounds, child) => bounds.union(child.bounds), Bounds2.NOTHING);

        AnnotationNode.adjustContentBounds(stringNode, additionalContentLayoutBounds, centerBounds);

        children.push(stringNode);
      }
    };

    const getVertexOutlineShape = (vertex: TVertex) => {
      return Shape.circle(vertex.viewCoordinates, 0.2);
    };

    const getEdgeOutlineShape = (edge: TEdge) => {
      const initialShape = new Shape().moveToPoint(edge.start.viewCoordinates).lineToPoint(edge.end.viewCoordinates);
      const strokedShape = initialShape.getStrokedShape(
        new LineStyles({
          lineWidth: 0.2,
          lineCap: 'round',
        }),
      );

      return strokedShape.getStrokedShape(
        new LineStyles({
          lineWidth: 0.02,
        }),
      );
    };

    const getEdgesOutlineShape = (edges: TEdge[]) => {
      const subpaths: Subpath[] = [];

      for (const edge of edges) {
        const lineShape = new Shape().moveToPoint(edge.start.viewCoordinates).lineToPoint(edge.end.viewCoordinates);
        const filledShape = lineShape.getStrokedShape(
          new LineStyles({
            lineWidth: 0.2,
            lineCap: 'round',
          }),
        );
        subpaths.push(...filledShape.subpaths);
      }

      return new Shape(subpaths);
    };

    const getEdgeColoredOutline = (edge: TEdge, color: TPaint) => {
      return new Path(getEdgeOutlineShape(edge), { fill: color });
    };

    const disposeActions: (() => void)[] = [];

    // TODO: reference frame for this is BAD
    const blurFilters = [new GaussianBlur(4)];

    const blurryEdges = (edges: TEdge[], fill: TPaint) => {
      return new Path(getEdgesOutlineShape(edges), {
        fill: fill,
        filters: blurFilters,
      });
    };

    const blurryVertex = (vertex: TVertex, fill: TPaint) => {
      return new Path(getVertexOutlineShape(vertex), {
        fill: fill,
        filters: blurFilters,
      });
    };

    if (annotation.type === 'ForcedLine') {
      // TODO: culori, pick a palette
      children = [
        blurryEdges(annotation.redEdges, style.theme.annotationBlueColorProperty),
        blurryEdges([annotation.blackEdge], style.theme.annotationBlueColorProperty),
        blurryEdges([annotation.whiteEdge], style.theme.annotationRedColorProperty),
        blurryVertex(annotation.vertex, style.theme.annotationGreenColorProperty),
      ];
      addStringDescription('Only one path for this line to exit the dot');
    } else if (annotation.type === 'AlmostEmptyToRed') {
      children = [
        blurryEdges(annotation.redEdges, style.theme.annotationBlueColorProperty),
        blurryEdges([annotation.whiteEdge], style.theme.annotationRedColorProperty),
        blurryVertex(annotation.vertex, style.theme.annotationGreenColorProperty),
      ];
      addStringDescription('Cannot have two lines to this dot, must be an X');
    } else if (annotation.type === 'JointToRed') {
      children = [
        blurryEdges(annotation.blackEdges, style.theme.annotationBlueColorProperty),
        blurryEdges(annotation.whiteEdges, style.theme.annotationRedColorProperty),
        blurryVertex(annotation.vertex, style.theme.annotationGreenColorProperty),
      ];
      addStringDescription("Cannot have more than two lines to a dot, rest must be X's");
    } else if (annotation.type === 'FaceSatisfied') {
      children = [
        blurryEdges(annotation.blackEdges, style.theme.annotationBlueColorProperty),
        blurryEdges(annotation.whiteEdges, style.theme.annotationRedColorProperty),
      ];
      addStringDescription("Cell has correct number of lines, rest must be X's");
    } else if (annotation.type === 'FaceAntiSatisfied') {
      children = [
        blurryEdges(annotation.redEdges, style.theme.annotationBlueColorProperty),
        blurryEdges(annotation.whiteEdges, style.theme.annotationRedColorProperty),
      ];
      addStringDescription("Cell has maximum number of X's, rest must be lines");
    } else if (annotation.type === 'ForcedSolveLoop') {
      children = [
        blurryEdges(annotation.regionEdges, style.theme.annotationBlueColorProperty),
        blurryEdges(annotation.pathEdges, style.theme.annotationRedColorProperty),
      ];
      addStringDescription('Lines would force a loop, and it completes the puzzle');
    } else if (annotation.type === 'PrematureForcedLoop') {
      children = [
        blurryEdges(annotation.regionEdges, style.theme.annotationBlueColorProperty),
        blurryEdges(annotation.pathEdges, style.theme.annotationRedColorProperty),
      ];
      addStringDescription("Lines would force a loop without solving the puzzle, so must be X's");
    } else if (annotation.type === 'CompletingEdgesAfterSolve') {
      children = [...annotation.whiteEdges.map((edge) => getEdgeColoredOutline(edge, 'red'))];
    } else if (annotation.type === 'FaceColoringBlackEdge') {
      children = [getEdgeColoredOutline(annotation.edge, 'red')];
    } else if (annotation.type === 'FaceColoringRedEdge') {
      children = [getEdgeColoredOutline(annotation.edge, 'red')];
    } else if (annotation.type === 'FaceColorToBlack') {
      children = [blurryEdges([annotation.edge], style.theme.annotationRedColorProperty)];
      addStringDescription('Colors are opposites on each side, so it must be a line');
    } else if (annotation.type === 'FaceColorToRed') {
      children = [blurryEdges([annotation.edge], style.theme.annotationRedColorProperty)];
      addStringDescription('Colors are the same on each side, so it must be an X');
    } else if (annotation.type === 'FaceColorNoTrivialLoop') {
      children = [blurryEdges(annotation.face.edges, style.theme.annotationRedColorProperty)];
      addStringDescription(
        'If all sides of a cell are one color, the inside needs to be the same color to prevent a loop',
      );
    } else if (
      annotation.type === 'FaceColorMatchToRed' ||
      annotation.type === 'FaceColorMatchToBlack' ||
      annotation.type === 'FaceColorBalance'
    ) {
      children = [
        ...annotation.balancedPairs.flatMap((balancedPair, i) => {
          const mainColor = ['green', 'blue', 'black'][i % 3];
          const oppositeColor = ['magenta', 'orange', 'yellow'][i % 3];

          return [
            ...balancedPair[0].map((edge) => getEdgeColoredOutline(edge, mainColor)),
            ...balancedPair[1].map((edge) => getEdgeColoredOutline(edge, oppositeColor)),
          ];
        }),
      ];

      if (annotation.type === 'FaceColorMatchToRed') {
        children.push(blurryEdges(annotation.matchingEdges, style.theme.annotationRedColorProperty));
        let string =
          'The cell borders a color in too many places. If the cell were the opposite color, it would violate the number value';
        if (annotation.balancedPairs.length) {
          string += ". Other colors show pairs with a minimum number of lines/X's each";
        }
        addStringDescription(string);
      } else if (annotation.type === 'FaceColorMatchToBlack') {
        children.push(blurryEdges(annotation.matchingEdges, style.theme.annotationRedColorProperty));
        let string =
          'The cell borders a color in too many places. If the cell were the same color, it would violate the number value';
        if (annotation.balancedPairs.length) {
          string += ". Other colors show pairs with a minimum number of lines/X's each";
        }
        addStringDescription(string);
      } else if (annotation.type === 'FaceColorBalance') {
        children.push(
          blurryEdges(annotation.matchingEdges, style.theme.annotationRedColorProperty),
          blurryEdges(annotation.oppositeEdges, style.theme.annotationBlueColorProperty),
        );
        let string =
          'The cell is forced to have adjacent colors be opposites. If they were the same color, it would violate the number value';
        if (annotation.balancedPairs.length) {
          string += ". Other colors show pairs with a minimum number of lines/X's each";
        }
        addStringDescription(string);
      }
    } else if (annotation.type === 'DoubleMinusOneFaces') {
      children = [
        blurryEdges([...annotation.toBlackEdges, ...annotation.toRedEdges], style.theme.annotationRedColorProperty),
      ];
      addStringDescription('Adjacent N-1 cells');
    } else if (annotation.type === 'SingleEdgeToSector' || annotation.type === 'DoubleEdgeToSector') {
      children = [annotation.sector.edge, annotation.sector.next.edge].map((edge) =>
        getEdgeColoredOutline(edge, 'red'),
      );
    } else if (annotation.type === 'ForcedSector') {
      const changedEdges = [...annotation.toRedEdges, ...annotation.toBlackEdges];
      children = [annotation.sector.edge, annotation.sector.next.edge].map((edge) =>
        getEdgeColoredOutline(edge, changedEdges.includes(edge) ? 'red' : 'blue'),
      );
    } else if (annotation.type === 'StaticFaceSectors') {
      children = _.uniq(annotation.sectors.flatMap((sector) => [sector.edge, sector.next.edge])).map((edge) =>
        getEdgeColoredOutline(edge, 'red'),
      );
    } else if (annotation.type === 'VertexState') {
      children = annotation.vertex.edges.map((edge) => getEdgeColoredOutline(edge, 'blue'));
    } else if (annotation.type === 'VertexStateToEdge') {
      // TODO: note which vertex it is
      children = [
        ...annotation.toBlackEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...annotation.toRedEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
      ];
    } else if (annotation.type === 'VertexStateToSector') {
      children = _.uniq(annotation.sectors.flatMap((sector) => [sector.edge, sector.next.edge])).map((edge) =>
        getEdgeColoredOutline(edge, 'red'),
      );
    } else if (
      annotation.type === 'VertexStateToSameFaceColor' ||
      annotation.type === 'VertexStateToOppositeFaceColor'
    ) {
      children = _.uniq([...annotation.facesA, ...annotation.facesB].flatMap((face) => face.edges)).map((edge) =>
        getEdgeColoredOutline(edge, 'red'),
      );
    } else if (annotation.type === 'FaceState') {
      children = annotation.face.edges.map((edge) => getEdgeColoredOutline(edge, 'red'));
    } else if (annotation.type === 'FaceStateToEdge') {
      // TODO: note which face it is
      children = [
        ...annotation.toBlackEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...annotation.toRedEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
      ];
    } else if (annotation.type === 'FaceStateToSector') {
      children = _.uniq(annotation.sectors.flatMap((sector) => [sector.edge, sector.next.edge])).map((edge) =>
        getEdgeColoredOutline(edge, 'red'),
      );
    } else if (annotation.type === 'FaceStateToSameFaceColor' || annotation.type === 'FaceStateToOppositeFaceColor') {
      const changedEdges = new Set([...annotation.facesA, ...annotation.facesB].flatMap((face) => face.edges));
      const unchangedEdges = annotation.face.edges.filter((edge) => !changedEdges.has(edge));

      children = [
        ...[...changedEdges].map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...unchangedEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
      ];
    } else if (annotation.type === 'FaceStateToVertexState') {
      const edges = annotation.face.edges.filter(
        (edge) => annotation.vertices.includes(edge.start) || annotation.vertices.includes(edge.end),
      );
      children = edges.map((edge) => getEdgeColoredOutline(edge, 'red'));
    } else if (annotation.type === 'FaceColorDisconnection') {
      const disconnectionShape = Shape.polygon(
        annotation.disconnection.map((halfEdge) => {
          const face = halfEdge.reversed.face;

          if (face) {
            return face.viewCoordinates;
          } else {
            const center = halfEdge.start.viewCoordinates.average(halfEdge.end.viewCoordinates);
            const opposite = halfEdge.face!.viewCoordinates;

            return center.timesScalar(2).minus(opposite);
          }
        }),
      );

      children = [
        new Path(disconnectionShape, {
          lineWidth: 0.05,
          lineCap: 'round',
          lineJoin: 'round',
          stroke: style.theme.annotationRedColorProperty,
        }),
      ];
      addStringDescription(
        'If the two colors along this path were made the same, it would disconnect the puzzle into two loops. Must be opposite colors',
      );
    } else if (annotation.type === 'Pattern') {
      // const affectedEdges = new Set( annotation.affectedEdges );
      // annotation.affectedSectors.forEach( sector => {
      //   affectedEdges.add( sector.edge );
      //   affectedEdges.add( sector.next.edge );
      // } );
      // annotation.affectedFaces.forEach( face => {
      //   face.edges.forEach( edge => affectedEdges.add( edge ) );
      // } );
      // const temporaryInPlaceNode = new Node( {
      //   children: [ ...affectedEdges ].map( edge => getEdgeColoredOutline( edge, 'red' ) )
      // } );

      children = [
        // temporaryInPlaceNode,
      ];

      if (additionalContentLayoutBounds) {
        const displayEmbedding = DisplayEmbedding.getDisplayEmbeddingFromRule(
          annotation.rule,
          annotation.boardPatternBoard,
          annotation.embedding,
        );

        const patternDescriptionNode = new EmbeddedPatternRuleNode(annotation.rule, displayEmbedding, {
          inputListeners: [
            new FireListener({
              fire: () => {
                // copyToClipboard( rule.getBinaryIdentifier() );
                console.log(annotation.rule.getBinaryIdentifier());

                const popupWindow = window.open(
                  `./rule?r=${encodeURIComponent(annotation.rule.getBinaryIdentifier())}`,
                  '_blank',
                );
                popupWindow && popupWindow.focus();
              },
            }),
          ],
          cursor: 'pointer',
        });

        AnnotationNode.adjustContentBounds(
          patternDescriptionNode,
          additionalContentLayoutBounds,
          displayEmbedding.expandedBounds,
        );

        {
          const highlightBounds = displayEmbedding.tightBounds.dilated(0.21);
          const cornerRadius = 0.3;
          children.push(
            new Path(
              Shape.roundRectangle(
                highlightBounds.x,
                highlightBounds.y,
                highlightBounds.width,
                highlightBounds.height,
                cornerRadius,
                cornerRadius,
              ),
              {
                stroke: currentTheme.puzzleBackgroundColorProperty,
                lineWidth: 0.2,
                pickable: false,
                opacity: 0.8,
              },
            ),
          );
        }
        {
          const highlightBounds = displayEmbedding.tightBounds.dilated(0.21);
          const cornerRadius = 0.3;
          children.push(
            new Path(
              Shape.roundRectangle(
                highlightBounds.x,
                highlightBounds.y,
                highlightBounds.width,
                highlightBounds.height,
                cornerRadius,
                cornerRadius,
              ),
              {
                stroke: currentTheme.blackLineColorProperty,
                lineWidth: 0.13,
                pickable: false,
              },
            ),
          );
        }
        children.push(patternDescriptionNode);
      }

      // TODO: show a clipped simplified "BEFORE" and "AFTER" pattern (ideally WITHIN THE CURRENT STYLE)
      // TODO: create fully new "input" and "output" (clean) states, and apply input/output
      // TODO: presumably run "safe solver" on these
      // TODO: determine bounds of "affected region", clip to (same) padded on both.
    } else {
      children = [];
      console.log(`unknown type: ${annotation.type}`);
    }

    super({
      children: children,
      pickable: annotation.type === 'Pattern' ? null : false,
    });

    this.disposeEmitter.addListener(() => disposeActions.forEach((action) => action()));
  }

  public static adjustContentBounds(
    contentNode: Node,
    additionalContentLayoutBounds: Bounds2,
    centralBounds: Bounds2,
  ): void {
    const margin = 0.5 + 0.05;
    const offsetMargin = 0.15;
    const emergencyMargin = 0.1;

    const getMinSpace = (orientation: Orientation) => {
      return (
        centralBounds[orientation.minCoordinate] +
        offsetMargin -
        (additionalContentLayoutBounds[orientation.minCoordinate] + margin)
      );
    };
    const getMaxSpace = (orientation: Orientation) => {
      return (
        additionalContentLayoutBounds[orientation.maxCoordinate] -
        margin -
        (centralBounds[orientation.maxCoordinate] - offsetMargin)
      );
    };
    const getDesiredScale = (orientation: Orientation) => {
      return Math.min(
        (additionalContentLayoutBounds[orientation.opposite.size] - 2 * margin) /
          contentNode[orientation.opposite.size],
        Math.max(getMinSpace(orientation), getMaxSpace(orientation)) / contentNode[orientation.size],
        1,
      );
    };
    const adjustPosition = (orientation: Orientation) => {
      contentNode[orientation.opposite.centerCoordinate] = centralBounds[orientation.opposite.centerCoordinate];

      if (getMinSpace(orientation) > getMaxSpace(orientation)) {
        contentNode[orientation.maxSide] = centralBounds[orientation.minCoordinate] - offsetMargin;

        // Don't let it go off screen
        if (
          contentNode[orientation.minSide] <
          additionalContentLayoutBounds[orientation.minCoordinate] + emergencyMargin
        ) {
          contentNode[orientation.minSide] = additionalContentLayoutBounds[orientation.minCoordinate] + emergencyMargin;
        }
      } else {
        contentNode[orientation.minSide] = centralBounds[orientation.maxCoordinate] + offsetMargin;

        // Don't let it go off screen
        if (
          contentNode[orientation.maxSide] >
          additionalContentLayoutBounds[orientation.maxCoordinate] - emergencyMargin
        ) {
          contentNode[orientation.maxSide] = additionalContentLayoutBounds[orientation.maxCoordinate] - emergencyMargin;
        }
      }

      // Enforce opposite side constraints
      if (
        contentNode[orientation.opposite.minSide] <
        additionalContentLayoutBounds[orientation.opposite.minCoordinate] + emergencyMargin
      ) {
        contentNode[orientation.opposite.minSide] =
          additionalContentLayoutBounds[orientation.opposite.minCoordinate] + emergencyMargin;
      }
      if (
        contentNode[orientation.opposite.maxSide] >
        additionalContentLayoutBounds[orientation.opposite.maxCoordinate] - emergencyMargin
      ) {
        contentNode[orientation.opposite.maxSide] =
          additionalContentLayoutBounds[orientation.opposite.maxCoordinate] - emergencyMargin;
      }
    };

    let orientation = Orientation.VERTICAL;
    let scale = getDesiredScale(orientation);

    if (scale < 1) {
      const otherScale = getDesiredScale(orientation.opposite);
      if (otherScale > scale) {
        orientation = orientation.opposite;
        scale = otherScale;
      }
    }

    // Don't let it get too small, let it overlap if it helps
    contentNode.scale(Math.max(scale, 0.3));

    adjustPosition(orientation);
  }
}
