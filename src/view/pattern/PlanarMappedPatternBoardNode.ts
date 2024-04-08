import { Circle, Line, Node, Path } from 'phet-lib/scenery';
import { TPlanarMappedPatternBoard } from '../../model/pattern/TPlanarMappedPatternBoard.ts';
import { Shape } from 'phet-lib/kite';

export class PlanarMappedPatternBoardNode extends Node {
  public constructor(
    public readonly planarMappedPatternBoard: TPlanarMappedPatternBoard
  ) {
    const patternBoard = planarMappedPatternBoard.patternBoard;
    const planarPatternMap = planarMappedPatternBoard.planarPatternMap;

    // TODO: move scale elsewhere?
    const container = new Node( {
      scale: 30
    } );

    // TODO: labels?

    patternBoard.faces.forEach( face => {
      const isExit = face.isExit;

      const points = planarPatternMap.faceMap.get( face )!;
      const shape = Shape.polygon( points );

      container.addChild( new Path( shape, {
        lineWidth: 0.02,
        fill: isExit ? '#377' : '#000'
      } ) );
    } );

    patternBoard.sectors.forEach( sector => {
      const points = planarPatternMap.sectorMap.get( sector )!;

      // TODO: consider deduplicating this with SectorNode
      const startPoint = points[ 0 ];
      const vertexPoint = points[ 1 ];
      const endPoint = points[ 2 ];

      const startDelta = startPoint.minus( vertexPoint );
      const endDelta = endPoint.minus( vertexPoint );

      const startUnit = startDelta.normalized();

      const startAngle = startDelta.angle;
      let endAngle = endDelta.angle;
      if ( endAngle < startAngle ) {
        endAngle += 2 * Math.PI;
      }

      const radius = 0.25;
      const shape = new Shape()
        .moveToPoint( vertexPoint )
        .lineToPoint( startUnit.timesScalar( radius ).plus( vertexPoint ) )
        .arcPoint( vertexPoint, radius, startAngle, endAngle, true )
        .close()
        .makeImmutable();

      container.addChild( new Path( shape, {
        stroke: '#fa6',
        lineWidth: 0.02
      } ) );
    } );

    patternBoard.edges.forEach( edge => {
      if ( edge.isExit ) {
        return;
      }

      const points = planarPatternMap.edgeMap.get( edge )!;

      container.addChild( new Line( points[ 0 ], points[ 1 ], {
        stroke: '#fff',
        lineWidth: 0.02
      } ) );
    } );

    patternBoard.vertices.forEach( vertex => {
      const isExit = vertex.isExit;

      container.addChild( new Circle( isExit ? 0.1 : 0.07, {
        center: planarPatternMap.vertexMap.get( vertex )!,
        lineWidth: 0.02,
        stroke: '#ccc',
        fill: isExit ? '#222' : '#ccc'
      } ) );
    } );

    super( {
      children: [ container ]
    } );
  }
}