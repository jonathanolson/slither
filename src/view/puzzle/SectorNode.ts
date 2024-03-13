import { Node, Path, TPaint } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { sectorNotOneColorProperty, sectorNotTwoColorProperty, sectorNotZeroColorProperty, sectorOnlyOneColorProperty, sectorOtherColorProperty, sectorsNextToEdgesVisibleProperty, sectorsTrivialVisibleProperty, sectorsVisibleProperty } from '../Theme.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { Shape } from 'phet-lib/kite';
import { TSector } from '../../model/data/sector-state/TSector.ts';
import { DotUtils, Vector2 } from 'phet-lib/dot';
import SectorState from '../../model/data/sector-state/SectorState.ts';
import { TSectorStateData } from '../../model/data/sector-state/TSectorStateData.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';

export class SectorNode extends Node {
  public constructor(
    public readonly sector: TSector,
    stateProperty: TReadOnlyProperty<TState<TSectorStateData & TEdgeStateData>>
  ) {
    super();

    const startPoint = sector.start.viewCoordinates;
    const vertexPoint = sector.end.viewCoordinates;
    const endPoint = sector.next.end.viewCoordinates;

    const startDelta = startPoint.minus( vertexPoint );
    const endDelta = endPoint.minus( vertexPoint );

    const startUnit = startDelta.normalized();
    const endUnit = endDelta.normalized();

    const startAngle = startDelta.angle;
    let endAngle = endDelta.angle;
    if ( endAngle < startAngle ) {
      endAngle += 2 * Math.PI;
    }

    const halfAngle = endUnit.minus( startUnit ).angle + Math.PI / 2;
    const diffAngle = endAngle - startAngle;

    const baseArcRadius = 0.2;
    const baseSplineRadius = 0.3;
    const arcRadiusDelta = 0.02;
    const splineRadiusDelta = 0.04;

    const iconCenter = Vector2.createPolar( 0.2, halfAngle );

    const addArc = ( shape: Shape, radius: number ) => {
      shape.moveToPoint( startUnit.timesScalar( radius ) );
      shape.arcPoint( Vector2.ZERO, radius, startAngle, endAngle, true );

      return shape;
    };

    const addSpline = ( shape: Shape, radius: number ) => {

      const middleRadius = DotUtils.linear( 0, 2 * Math.PI, radius * 0.5, 0, Math.abs( 2 * Math.PI - diffAngle ) );

      const splineStart = startUnit.timesScalar( radius );
      const splineEnd = endUnit.timesScalar( radius );

      const middlePoint = Vector2.createPolar( middleRadius, halfAngle );

      const middleControlPoint = middlePoint.timesScalar( 2 ).minus( splineStart.average( splineEnd ) );

      shape.moveToPoint( splineStart );
      shape.quadraticCurveToPoint( middleControlPoint, splineEnd );
      // shape.lineToPoint( middlePoint );
      // shape.lineToPoint( splineEnd );

      return shape;
    };

    const addCircle = ( shape: Shape, center: Vector2, radius: number ) => {
      shape.moveTo( center.x + radius, center.y );
      shape.circle( center, radius );
      return shape;
    };

    const singleArcShape = addArc( new Shape(), baseArcRadius ).makeImmutable();
    const doubleArcShape = addArc( addArc( new Shape(), baseArcRadius + arcRadiusDelta ), baseArcRadius - arcRadiusDelta ).makeImmutable();
    // TODO: handle these, remove if we don't like?
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const singleSplineShape = addSpline( new Shape(), baseSplineRadius ).makeImmutable();
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doubleSplineShape = addSpline( addSpline( new Shape(), baseSplineRadius + splineRadiusDelta ), baseSplineRadius - splineRadiusDelta ).makeImmutable();
    const onlyZeroShape = addCircle( new Shape(), iconCenter, 0.05 ).makeImmutable();
    const anyShape = addCircle( addCircle( addCircle( new Shape(), iconCenter, 0.05 ), iconCenter, 0.03 ), iconCenter, 0.01 ).makeImmutable();
    const noneShape = new Shape()
      .moveTo( iconCenter.x - 0.05, iconCenter.y - 0.05 )
      .lineTo( iconCenter.x + 0.05, iconCenter.y + 0.05 )
      .moveTo( iconCenter.x - 0.05, iconCenter.y + 0.05 )
      .lineTo( iconCenter.x + 0.05, iconCenter.y - 0.05 ).makeImmutable();
    const onlyTwoShape = new Shape()
      .moveToPoint( startUnit.timesScalar( 0.1 ).plus( iconCenter.timesScalar( 0.7 ) ) )
      .lineToPoint( iconCenter.timesScalar( 0.7 ) )
      .lineToPoint( endUnit.timesScalar( 0.1 ).plus( iconCenter.timesScalar( 0.7 ) ) ).makeImmutable();

    const shapeMap = new Map<SectorState, Shape | null>( [
      [ SectorState.NONE, noneShape ],
      [ SectorState.ONLY_ZERO, onlyZeroShape ],
      [ SectorState.ONLY_ONE, singleArcShape ],
      [ SectorState.ONLY_TWO, onlyTwoShape ],
      [ SectorState.NOT_ZERO, doubleArcShape ],
      [ SectorState.NOT_ONE, doubleArcShape ],
      [ SectorState.NOT_TWO, singleArcShape ],
      [ SectorState.ANY, anyShape ]
    ] );

    // TODO: Theme!
    const strokeMap = new Map<SectorState, TPaint>( [
      [ SectorState.NONE, sectorOtherColorProperty ],
      [ SectorState.ONLY_ZERO, sectorOtherColorProperty ],
      [ SectorState.ONLY_ONE, sectorOnlyOneColorProperty ],
      [ SectorState.ONLY_TWO, sectorOtherColorProperty ],
      [ SectorState.NOT_ZERO, sectorNotZeroColorProperty ],
      [ SectorState.NOT_ONE, sectorNotOneColorProperty ],
      [ SectorState.NOT_TWO, sectorNotTwoColorProperty ],
      [ SectorState.ANY, sectorOtherColorProperty ]
    ] );

    const basicDash = [ 0.02, 0.02 ];
    const dashMap = new Map<SectorState, number[]>( [
      [ SectorState.NONE, [] ],
      [ SectorState.ONLY_ZERO, [] ],
      [ SectorState.ONLY_ONE, [] ],
      [ SectorState.ONLY_TWO, [] ],
      [ SectorState.NOT_ZERO, basicDash ],
      [ SectorState.NOT_ONE, [] ],
      [ SectorState.NOT_TWO, basicDash ],
      [ SectorState.ANY, [] ]
    ] );

    const path = new Path( null, {
      translation: vertexPoint,
      lineWidth: 0.01,
      lineCap: 'butt',
      visibleProperty: sectorsVisibleProperty
    } );
    this.addChild( path );

    const multilink = Multilink.multilink( [
      stateProperty,
      sectorsNextToEdgesVisibleProperty,
      sectorsTrivialVisibleProperty
    ], ( state, nextToEdgesVisible, trivialVisible ) => {
      const edgeStateA = state.getEdgeState( sector.edge );
      const edgeStateB = state.getEdgeState( sector.next.edge );
      const sectorState = state.getSectorState( sector );

      let shape: Shape | null = null;
      let stroke: TPaint = null;
      let dash: number[] = [];

      if ( nextToEdgesVisible || ( edgeStateA === EdgeState.WHITE && edgeStateB === EdgeState.WHITE ) ) {
        let isTrivial = SectorState.trivialStates.includes( sectorState );

        // NOTE: it is trivial if an (effectively) 2-order vertex excludes 1
        if ( sectorState === SectorState.NOT_ONE ) {
          const blackEdges = sector.end.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.BLACK );
          const whiteEdges = sector.end.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.WHITE );
          if ( blackEdges.length === 0 && whiteEdges.length === 2 ) {
            isTrivial = true;
          }
        }
        if ( trivialVisible || !isTrivial ) {
          shape = shapeMap.get( sectorState ) ?? null;
          stroke = strokeMap.get( sectorState ) ?? null;
          dash = dashMap.get( sectorState ) ?? [];
        }
      }

      path.shape = shape;
      path.stroke = stroke;
      path.lineDash = dash;
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }
}