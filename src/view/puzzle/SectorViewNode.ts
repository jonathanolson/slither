import { Node, Path } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { Shape } from 'phet-lib/kite';
import SectorState from '../../model/data/sector-state/SectorState.ts';
import { TSectorStateData } from '../../model/data/sector-state/TSectorStateData.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { SectorNode } from './SectorNode.ts';
import { TBoard } from '../../model/board/core/TBoard.ts';

const lineDash = [0.02, 0.02];
const baseArcRadius = 0.2;
const arcRadiusDelta = 0.02;

export class SectorViewNode extends Node {
  public constructor(
    public readonly board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TSectorStateData & TEdgeStateData>>,
    style: TPuzzleStyle,
  ) {
    const sectorNotZeroPath = new Path(null, {
      lineWidth: 0.025,
      lineCap: 'butt',
      stroke: SectorNode.getStrokeFromStyle(SectorState.NOT_ZERO, style),
    });

    const sectorNotOnePath = new Path(null, {
      lineWidth: 0.025,
      lineCap: 'butt',
      stroke: SectorNode.getStrokeFromStyle(SectorState.NOT_ONE, style),
    });

    const sectorNotTwoPath = new Path(null, {
      lineWidth: 0.025,
      lineCap: 'butt',
      stroke: SectorNode.getStrokeFromStyle(SectorState.NOT_TWO, style),
    });

    const sectorOnlyOnePath = new Path(null, {
      lineWidth: 0.025,
      lineCap: 'butt',
      stroke: SectorNode.getStrokeFromStyle(SectorState.ONLY_ONE, style),
    });

    super({
      pickable: false,
      visibleProperty: style.sectorsVisibleProperty,
      children: [sectorNotZeroPath, sectorNotOnePath, sectorNotTwoPath, sectorOnlyOnePath],
    });

    const sectorStates: SectorState[] = board.halfEdges.map((edge) => SectorState.NONE); // Used because we currently don't display BLACK!
    const edgeStates: EdgeState[] = board.edges.map((edge) => EdgeState.BLACK); // Used because this can trigger sector display or not

    const multilink = Multilink.multilink([stateProperty, style.sectorsVisibleProperty], (state, sectorsVisible) => {
      if (sectorsVisible) {
        let changed = false;
        for (let i = 0; i < board.halfEdges.length; i++) {
          const sectorState = state.getSectorState(board.halfEdges[i]);

          if (sectorState !== sectorStates[i]) {
            changed = true;
            sectorStates[i] = sectorState;
          }
        }

        for (let i = 0; i < board.edges.length; i++) {
          const edgeState = state.getEdgeState(board.edges[i]);

          if (edgeState !== edgeStates[i]) {
            changed = true;
            edgeStates[i] = edgeState;
          }
        }

        if (changed) {
          const sectorNotZeroShape = new Shape();
          const sectorNotOneShape = new Shape();
          const sectorNotTwoShape = new Shape();
          const sectorOnlyOneShape = new Shape();

          for (let i = 0; i < board.halfEdges.length; i++) {
            const sectorState = sectorStates[i];

            if (
              sectorState !== SectorState.NOT_ZERO &&
              sectorState !== SectorState.NOT_ONE &&
              sectorState !== SectorState.NOT_TWO &&
              sectorState !== SectorState.ONLY_ONE
            ) {
              continue;
            }

            const sector = board.halfEdges[i];
            const edgeStateA = state.getEdgeState(sector.edge);
            const edgeStateB = state.getEdgeState(sector.next.edge);

            if (edgeStateA !== EdgeState.WHITE || edgeStateB !== EdgeState.WHITE) {
              continue;
            }

            // NOTE: it is trivial if an (effectively) 2-order vertex excludes 1
            if (sectorState === SectorState.NOT_ONE) {
              const blackEdges = sector.end.edges.filter((edge) => state.getEdgeState(edge) === EdgeState.BLACK);
              const whiteEdges = sector.end.edges.filter((edge) => state.getEdgeState(edge) === EdgeState.WHITE);
              if (blackEdges.length === 0 && whiteEdges.length === 2) {
                continue;
              }
            }

            const startPoint = sector.start.viewCoordinates;
            const vertexPoint = sector.end.viewCoordinates;
            const endPoint = sector.next.end.viewCoordinates;

            const startDelta = startPoint.minus(vertexPoint);
            const endDelta = endPoint.minus(vertexPoint);

            const startUnit = startDelta.normalized();

            const startAngle = startDelta.angle;
            let endAngle = endDelta.angle;
            if (endAngle < startAngle) {
              endAngle += 2 * Math.PI;
            }

            const addArc = (shape: Shape, radius: number) => {
              shape.moveToPoint(startUnit.timesScalar(radius).add(vertexPoint));
              shape.arcPoint(vertexPoint, radius, startAngle, endAngle, true);

              return shape;
            };

            if (sectorState === SectorState.ONLY_ONE) {
              addArc(sectorOnlyOneShape, baseArcRadius);
            } else if (sectorState === SectorState.NOT_ONE) {
              addArc(sectorNotOneShape, baseArcRadius - arcRadiusDelta);
              addArc(sectorNotOneShape, baseArcRadius + arcRadiusDelta);
            } else if (sectorState === SectorState.NOT_ZERO) {
              const shape = new Shape();
              addArc(shape, baseArcRadius - arcRadiusDelta);
              addArc(shape, baseArcRadius + arcRadiusDelta);
              const dashedShape = shape.getDashedShape(lineDash, 0);
              sectorNotZeroShape.subpaths.push(...dashedShape.subpaths);
            } else if (sectorState === SectorState.NOT_TWO) {
              const shape = new Shape();
              addArc(shape, baseArcRadius);
              const dashedShape = shape.getDashedShape(lineDash, 0);
              sectorNotTwoShape.subpaths.push(...dashedShape.subpaths);
            }
          }

          sectorNotZeroPath.shape = sectorNotZeroShape.makeImmutable();
          sectorNotOnePath.shape = sectorNotOneShape.makeImmutable();
          sectorNotTwoPath.shape = sectorNotTwoShape.makeImmutable();
          sectorOnlyOnePath.shape = sectorOnlyOneShape.makeImmutable();
        }
      }
    });
    this.disposeEmitter.addListener(() => multilink.dispose());
  }
}
