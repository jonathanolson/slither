import { currentTheme } from './Theme.ts';
import { EmbeddedPatternRuleNode } from './pattern/EmbeddedPatternRuleNode.ts';
import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';

import { Bounds2 } from 'phet-lib/dot';
import { LineStyles, Shape } from 'phet-lib/kite';
import { Orientation } from 'phet-lib/phet-core';
import { FireListener, Node, Path, TPaint } from 'phet-lib/scenery';

import { TBoard } from '../model/board/core/TBoard.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
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

    const getEdgeColoredOutline = (edge: TEdge, color: TPaint) => {
      return new Path(getEdgeOutlineShape(edge), { fill: color });
    };

    const disposeActions: (() => void)[] = [];

    if (annotation.type === 'ForcedLine') {
      // TODO: culori, pick a palette
      children = [
        // TODO: red edges / vertex
        getEdgeColoredOutline(annotation.whiteEdge, 'red'),
        getEdgeColoredOutline(annotation.blackEdge, 'blue'),
      ];
    } else if (annotation.type === 'AlmostEmptyToRed') {
      children = [
        // TODO: vertex
        getEdgeColoredOutline(annotation.whiteEdge, 'red'),
        ...annotation.redEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
      ];
    } else if (annotation.type === 'JointToRed') {
      children = [
        ...annotation.whiteEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...annotation.blackEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
      ];
    } else if (annotation.type === 'FaceSatisfied') {
      children = [
        ...annotation.whiteEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...annotation.blackEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
      ];
    } else if (annotation.type === 'FaceAntiSatisfied') {
      children = [
        ...annotation.whiteEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...annotation.redEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
      ];
    } else if (annotation.type === 'ForcedSolveLoop') {
      children = [
        ...annotation.regionEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
        ...annotation.pathEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
      ];
    } else if (annotation.type === 'PrematureForcedLoop') {
      children = [
        ...annotation.regionEdges.map((edge) => getEdgeColoredOutline(edge, 'blue')),
        ...annotation.pathEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
      ];
    } else if (annotation.type === 'CompletingEdgesAfterSolve') {
      children = [...annotation.whiteEdges.map((edge) => getEdgeColoredOutline(edge, 'red'))];
    } else if (annotation.type === 'FaceColoringBlackEdge') {
      children = [getEdgeColoredOutline(annotation.edge, 'red')];
    } else if (annotation.type === 'FaceColoringRedEdge') {
      children = [getEdgeColoredOutline(annotation.edge, 'red')];
    } else if (annotation.type === 'FaceColorToBlack') {
      children = [getEdgeColoredOutline(annotation.edge, 'red')];
    } else if (annotation.type === 'FaceColorToRed') {
      children = [getEdgeColoredOutline(annotation.edge, 'red')];
    } else if (annotation.type === 'FaceColorNoTrivialLoop') {
      children = [...annotation.face.edges.map((edge) => getEdgeColoredOutline(edge, 'red'))];
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
        children.push(...annotation.matchingEdges.map((edge) => getEdgeColoredOutline(edge, 'red')));
      } else if (annotation.type === 'FaceColorMatchToBlack') {
        children.push(...annotation.matchingEdges.map((edge) => getEdgeColoredOutline(edge, 'red')));
      } else if (annotation.type === 'FaceColorBalance') {
        children.push(...annotation.matchingEdges.map((edge) => getEdgeColoredOutline(edge, 'orange')));
        children.push(...annotation.oppositeEdges.map((edge) => getEdgeColoredOutline(edge, 'red')));
      }
    } else if (annotation.type === 'DoubleMinusOneFaces') {
      children = [
        ...annotation.toBlackEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
        ...annotation.toRedEdges.map((edge) => getEdgeColoredOutline(edge, 'red')),
      ];
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
      // TODO: better view! ZOMG
      // TODO: show disconnection

      const changedEdges = new Set([...annotation.facesA, ...annotation.facesB].flatMap((face) => face.edges));

      children = [...[...changedEdges].map((edge) => getEdgeColoredOutline(edge, 'red'))];
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

        const margin = 0.5 + 0.05;
        const offsetMargin = 0.15;
        const emergencyMargin = 0.1;

        const getMinSpace = (orientation: Orientation) => {
          return (
            displayEmbedding.expandedBounds[orientation.minCoordinate] +
            offsetMargin -
            (additionalContentLayoutBounds[orientation.minCoordinate] + margin)
          );
        };
        const getMaxSpace = (orientation: Orientation) => {
          return (
            additionalContentLayoutBounds[orientation.maxCoordinate] -
            margin -
            (displayEmbedding.expandedBounds[orientation.maxCoordinate] - offsetMargin)
          );
        };
        const getDesiredScale = (orientation: Orientation) => {
          return Math.min(
            (additionalContentLayoutBounds[orientation.opposite.size] - 2 * margin) /
              patternDescriptionNode[orientation.opposite.size],
            Math.max(getMinSpace(orientation), getMaxSpace(orientation)) / patternDescriptionNode[orientation.size],
            1,
          );
        };
        const adjustPosition = (orientation: Orientation) => {
          patternDescriptionNode[orientation.opposite.centerCoordinate] =
            displayEmbedding.expandedBounds[orientation.opposite.centerCoordinate];

          if (getMinSpace(orientation) > getMaxSpace(orientation)) {
            patternDescriptionNode[orientation.maxSide] =
              displayEmbedding.expandedBounds[orientation.minCoordinate] - offsetMargin;

            // Don't let it go off screen
            if (
              patternDescriptionNode[orientation.minSide] <
              additionalContentLayoutBounds[orientation.minCoordinate] + emergencyMargin
            ) {
              patternDescriptionNode[orientation.minSide] =
                additionalContentLayoutBounds[orientation.minCoordinate] + emergencyMargin;
            }
          } else {
            patternDescriptionNode[orientation.minSide] =
              displayEmbedding.expandedBounds[orientation.maxCoordinate] + offsetMargin;

            // Don't let it go off screen
            if (
              patternDescriptionNode[orientation.maxSide] >
              additionalContentLayoutBounds[orientation.maxCoordinate] - emergencyMargin
            ) {
              patternDescriptionNode[orientation.maxSide] =
                additionalContentLayoutBounds[orientation.maxCoordinate] - emergencyMargin;
            }
          }

          // Enforce opposite side constraints
          if (
            patternDescriptionNode[orientation.opposite.minSide] <
            additionalContentLayoutBounds[orientation.opposite.minCoordinate] + emergencyMargin
          ) {
            patternDescriptionNode[orientation.opposite.minSide] =
              additionalContentLayoutBounds[orientation.opposite.minCoordinate] + emergencyMargin;
          }
          if (
            patternDescriptionNode[orientation.opposite.maxSide] >
            additionalContentLayoutBounds[orientation.opposite.maxCoordinate] - emergencyMargin
          ) {
            patternDescriptionNode[orientation.opposite.maxSide] =
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
        patternDescriptionNode.scale(Math.max(scale, 0.3));

        adjustPosition(orientation);

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
}
