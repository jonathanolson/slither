import { Color, Node } from 'phet-lib/scenery';
import { TReadOnlyProperty } from 'phet-lib/axon';
import { Shape } from 'phet-lib/kite';
import { TSector } from '../../model/data/sector-state/TSector.ts';
import { Vector2 } from 'phet-lib/dot';
import SectorState from '../../model/data/sector-state/SectorState.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';

// TODO: it lives for the statics, is that fine?
export class SectorNode extends Node {
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