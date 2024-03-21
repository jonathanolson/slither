import { Color, Node, Path, TPaint } from 'phet-lib/scenery';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import { Shape } from 'phet-lib/kite';
import { TSector } from '../../model/data/sector-state/TSector.ts';
import { DotUtils, Vector2 } from 'phet-lib/dot';
import SectorState from '../../model/data/sector-state/SectorState.ts';
import { TSectorStateData } from '../../model/data/sector-state/TSectorStateData.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { hookPuzzleListeners } from './hookPuzzleListeners.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

export type SectorNodeOptions = {
  sectorPressListener?: ( sector: TSector, button: 0 | 1 | 2 ) => void;
  sectorHoverListener?: ( sector: TSector, isOver: boolean ) => void;
  backgroundOffsetDistance: number;
};

export class SectorNode extends Node {
  public constructor(
    public readonly sector: TSector,
    stateProperty: TReadOnlyProperty<TState<TSectorStateData & TEdgeStateData>>,
    style: TPuzzleStyle,
    options: SectorNodeOptions
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

    const pointerArea = SectorNode.getSectorBaseShape( sector, options.backgroundOffsetDistance );
    this.mouseArea = pointerArea;
    this.touchArea = pointerArea;

    hookPuzzleListeners( sector, this, options.sectorPressListener, options.sectorHoverListener );

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
      visibleProperty: style.sectorsVisibleProperty
    } );
    this.addChild( path );

    const multilink = Multilink.multilink( [
      stateProperty,
      style.sectorsNextToEdgesVisibleProperty,
      style.sectorsTrivialVisibleProperty
    ], ( state, nextToEdgesVisible, trivialVisible ) => {
      const edgeStateA = state.getEdgeState( sector.edge );
      const edgeStateB = state.getEdgeState( sector.next.edge );
      const sectorState = state.getSectorState( sector );

      let shape: Shape | null = null;
      let stroke: TPaint = null;
      let dash: number[] = [];
      let lineWidth = 0.01;

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
          stroke = SectorNode.getStrokeFromStyle( sectorState, style ) ?? null;
          dash = dashMap.get( sectorState ) ?? [];
          if ( dash.length ) {
            lineWidth = 0.015;
          }
        }
      }

      path.shape = shape;
      path.stroke = stroke;
      path.lineDash = dash;
      path.lineWidth = lineWidth;
    } );
    this.disposeEmitter.addListener( () => multilink.dispose() );
  }

  // TODO: reduce duplication with... SectorMetrics?
  public static getSectorBaseShape( sector: TSector, backgroundOffsetDistance: number ): Shape {
    const startPoint = sector.start.viewCoordinates;
    const vertexPoint = sector.end.viewCoordinates;
    const endPoint = sector.next.end.viewCoordinates;

    const startDelta = startPoint.minus( vertexPoint );
    const endDelta = endPoint.minus( vertexPoint );

    const startUnit = startDelta.normalized();
    const endUnit = endDelta.normalized();

    const halfAngle = endUnit.minus( startUnit ).angle + Math.PI / 2;

    const faceCenter = sector.face ? sector.face.viewCoordinates : Vector2.createPolar( backgroundOffsetDistance, halfAngle ).plus( vertexPoint );
    const halfStart = startPoint.average( vertexPoint );
    const halfEnd = endPoint.average( vertexPoint );

    return Shape.polygon( [ halfStart, vertexPoint, halfEnd, faceCenter ] ).makeImmutable();
  }

  public static getSectorArcShape( sector: TSector, radius: number ): Shape {
    const startPoint = sector.start.viewCoordinates;
    const vertexPoint = sector.end.viewCoordinates;
    const endPoint = sector.next.end.viewCoordinates;

    const startDelta = startPoint.minus( vertexPoint );
    const endDelta = endPoint.minus( vertexPoint );

    const startUnit = startDelta.normalized();

    const startAngle = startDelta.angle;
    let endAngle = endDelta.angle;
    if ( endAngle < startAngle ) {
      endAngle += 2 * Math.PI;
    }

    return new Shape()
      .moveToPoint( vertexPoint )
      .lineToPoint( startUnit.timesScalar( radius ).plus( vertexPoint ) )
      .arcPoint( vertexPoint, radius, startAngle, endAngle, true )
      .close()
      .makeImmutable();
  }

  public static getStrokeFromStyle( sectorState: SectorState, style: TPuzzleStyle ): TReadOnlyProperty<Color> {
    if ( sectorState === SectorState.ONLY_ONE ) {
      return style.theme.sectorOnlyOneColorProperty;
    }
    else if ( sectorState === SectorState.NOT_ZERO ) {
      return style.theme.sectorNotZeroColorProperty;
    }
    else if ( sectorState === SectorState.NOT_ONE ) {
      return style.theme.sectorNotOneColorProperty;
    }
    else if ( sectorState === SectorState.NOT_TWO ) {
      return style.theme.sectorNotTwoColorProperty;
    }
    else {
      return style.theme.sectorOtherColorProperty;
    }
  }

  // TODO: move to a general location?
  public static nameMap = new Map<SectorState, string>( [
    [ SectorState.NONE, 'Invalid' ],
    [ SectorState.ONLY_ZERO, 'No Lines' ],
    [ SectorState.ONLY_ONE, 'Only One Line' ],
    [ SectorState.ONLY_TWO, 'Both Lines' ],
    [ SectorState.NOT_ZERO, 'At Least One Line' ],
    [ SectorState.NOT_ONE, 'Zero or Two Lines' ],
    [ SectorState.NOT_TWO, 'Less Than Two Lines' ],
    [ SectorState.ANY, 'Any Lines' ]
  ] );
}