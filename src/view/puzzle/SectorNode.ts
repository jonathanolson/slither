import { Node, Path, TPaint } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { sectorsNextToEdgesVisibleProperty, sectorsTrivialVisibleProperty, sectorsVisibleProperty } from '../Theme.ts';
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

    const startUnit = startDelta.normalized();
    const endUnit = endDelta.normalized();

    const startAngle = startDelta.angle;
    let endAngle = endDelta.angle;
    if ( endAngle < startAngle ) {
      endAngle += 2 * Math.PI;
    }

    const halfAngle = endUnit.minus( startUnit ).angle + Math.PI / 2;
    const diffAngle = endAngle - startAngle;

    const baseRadius = 0.2;
    const arcRadiusDelta = 0.02;
    const splineRadiusDelta = 0.04;

    const iconCenter = Vector2.createPolar( 0.2, halfAngle );

    const addArc = ( shape: Shape, radius: number ) => {
      shape.moveToPoint( startUnit.timesScalar( radius ) );
      shape.arcPoint( Vector2.ZERO, radius, startAngle, endAngle, true );

      return shape;
    };

    const addSpline = ( shape: Shape, radius: number ) => {

      const middleRadius = DotUtils.linear( 0, 2 * Math.PI, radius / 2, 0, Math.abs( 2 * Math.PI - diffAngle ) );

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

    const singleArcShape = addArc( new Shape(), baseRadius ).makeImmutable();
    const doubleArcShape = addArc( addArc( new Shape(), baseRadius + arcRadiusDelta ), baseRadius - arcRadiusDelta ).makeImmutable();
    const singleSplineShape = addSpline( new Shape(), baseRadius ).makeImmutable();
    const doubleSplineShape = addSpline( addSpline( new Shape(), baseRadius + splineRadiusDelta ), baseRadius - splineRadiusDelta ).makeImmutable();
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
      [ SectorState.NOT_ZERO, doubleSplineShape ],
      [ SectorState.NOT_ONE, doubleArcShape ],
      [ SectorState.NOT_TWO, singleSplineShape ],
      [ SectorState.ANY, anyShape ]
    ] );

    // TODO: Theme!
    const strokeMap = new Map<SectorState, TPaint>( [
      [ SectorState.NONE, 'blue' ],
      [ SectorState.ONLY_ZERO, 'blue' ],
      [ SectorState.ONLY_ONE, 'red' ],
      [ SectorState.ONLY_TWO, 'blue' ],
      [ SectorState.NOT_ZERO, 'green' ],
      [ SectorState.NOT_ONE, 'magenta' ],
      [ SectorState.NOT_TWO, 'cyan' ],
      [ SectorState.ANY, 'blue' ]
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
        }
      }

      path.shape = shape;
      path.stroke = stroke;
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }
}