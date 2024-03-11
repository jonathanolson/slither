import { Node, Path, TPaint } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { sectorsVisibleProperty } from '../Theme.ts';
import { TEdgeData } from '../../model/data/edge/TEdgeData.ts';
import { Shape } from 'phet-lib/kite';
import { TSector } from '../../model/data/sector/TSector.ts';
import { DotUtils, Vector2 } from 'phet-lib/dot';
import SectorState from '../../model/data/sector/SectorState.ts';
import { TSectorData } from '../../model/data/sector/TSectorData.ts';
import EdgeState from '../../model/data/edge/EdgeState.ts';

export class SectorNode extends Node {
  public constructor(
    public readonly sector: TSector,
    stateProperty: TReadOnlyProperty<TState<TSectorData & TEdgeData>>
  ) {
    super();

    const startPoint = sector.start.viewCoordinates;
    const vertexPoint = sector.end.viewCoordinates;
    const endPoint = sector.next.end.viewCoordinates;

    const startDelta = startPoint.minus( vertexPoint );
    const endDelta = endPoint.minus( vertexPoint );

    const startAngle = startDelta.angle;
    let endAngle = endDelta.angle;
    if ( endAngle < startAngle ) {
      endAngle += 2 * Math.PI;
    }
    const halfAngle = ( startAngle + endAngle ) / 2;
    const diffAngle = endAngle - startAngle;

    const baseRadius = 0.2;
    const arcRadiusDelta = 0.02;
    const splineRadiusDelta = 0.04;

    const addArc = ( shape: Shape, radius: number ) => {
      shape.moveToPoint( startDelta.normalized().timesScalar( radius ) );
      shape.arcPoint( Vector2.ZERO, radius, startAngle, endAngle, true );

      return shape;
    };

    const addSpline = ( shape: Shape, radius: number ) => {

      const middleRadius = DotUtils.linear( 0, 2 * Math.PI, radius / 2, 0, Math.abs( 2 * Math.PI - diffAngle ) );

      const splineStart = startDelta.normalized().timesScalar( radius );
      const splineEnd = endDelta.normalized().timesScalar( radius );

      const middlePoint = Vector2.createPolar( -middleRadius, halfAngle );

      const middleControlPoint = middlePoint.timesScalar( 2 ).minus( splineStart.average( splineEnd ) );

      shape.moveToPoint( splineStart );
      shape.quadraticCurveToPoint( middleControlPoint, splineEnd );

      return shape;
    };

    const singleArcShape = addArc( new Shape(), baseRadius ).makeImmutable();
    const doubleArcShape = addArc( addArc( new Shape(), baseRadius + arcRadiusDelta ), baseRadius - arcRadiusDelta ).makeImmutable();
    const singleSplineShape = addSpline( new Shape(), baseRadius ).makeImmutable();
    const doubleSplineShape = addSpline( addSpline( new Shape(), baseRadius + splineRadiusDelta ), baseRadius - splineRadiusDelta ).makeImmutable();

    const shapeMap = new Map<SectorState, Shape | null>( [
      [ SectorState.NONE, null ],
      [ SectorState.ONLY_ZERO, null ],
      [ SectorState.ONLY_ONE, singleArcShape ],
      [ SectorState.ONLY_TWO, null ],
      [ SectorState.NOT_ZERO, doubleSplineShape ],
      [ SectorState.NOT_ONE, doubleArcShape ],
      [ SectorState.NOT_TWO, singleSplineShape ],
      [ SectorState.ANY, null ]
    ] );

    // TODO: Theme!
    const strokeMap = new Map<SectorState, TPaint>( [
      [ SectorState.NONE, null ],
      [ SectorState.ONLY_ZERO, null ],
      [ SectorState.ONLY_ONE, 'red' ],
      [ SectorState.ONLY_TWO, null ],
      [ SectorState.NOT_ZERO, 'green' ],
      [ SectorState.NOT_ONE, 'magenta' ],
      [ SectorState.NOT_TWO, 'cyan' ],
      [ SectorState.ANY, null ]
    ] );

    const path = new Path( null, {
      translation: vertexPoint,
      lineWidth: 0.01,
      lineCap: 'butt',
      visibleProperty: sectorsVisibleProperty
    } );
    this.addChild( path );

    const multilink = Multilink.multilink( [
      stateProperty
    ], state => {
      const edgeStateA = state.getEdgeState( sector.edge );
      const edgeStateB = state.getEdgeState( sector.next.edge );
      const sectorState = state.getSectorState( sector );

      let shape: Shape | null = null;
      let stroke: TPaint = null;

      if ( edgeStateA === EdgeState.WHITE && edgeStateB === EdgeState.WHITE ) {
        shape = shapeMap.get( sectorState ) || null;
        stroke = strokeMap.get( sectorState ) || null;
      }

      path.shape = shape;
      path.stroke = stroke;
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }
}