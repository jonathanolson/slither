import { Node, Path } from 'phet-lib/scenery';
import { HoverHighlight } from '../../model/puzzle/HoverHighlight.ts';
import { LineStyles, Shape } from 'phet-lib/kite';
import { hoverHighlightColorProperty, showHoverHighlightsProperty } from '../Theme.ts';
import { SectorNode } from './SectorNode.ts';

const lineStyles = new LineStyles( {
  lineWidth: 0.2,
  lineCap: 'round',
  lineJoin: 'round'
} );

export class HoverHighlightNode extends Node {
  public constructor(
    public readonly hoverHighlight: HoverHighlight,
    backgroundOffsetDistance: number
  ) {
    let children: Node[];

    if ( showHoverHighlightsProperty.value ) {
      if ( hoverHighlight.type === 'edge-state' ) {
        const lineShape = new Shape().moveToPoint( hoverHighlight.edge.start.viewCoordinates ).lineToPoint( hoverHighlight.edge.end.viewCoordinates );
        const edgeHighlightNode = new Path( lineShape.getStrokedShape( lineStyles ), {
          stroke: hoverHighlightColorProperty,
          lineWidth: 0.02
        } );

        children = [ edgeHighlightNode ];
      }
      else if ( hoverHighlight.type === 'face-color' ) {
        if ( hoverHighlight.face ) {
          const faceShape = Shape.polygon( hoverHighlight.face.vertices.map( vertex => vertex.viewCoordinates ) );
          const faceHighlightNode = new Path( faceShape.getOffsetShape( -0.1 ), {
            stroke: hoverHighlightColorProperty,
            lineWidth: 0.02
          } );

          children = [ faceHighlightNode ];
        }
        else {
          // TODO: how to handle outside?
          children = [];
        }
      }
      else if ( hoverHighlight.type === 'sector' ) {
        const sectorShape = SectorNode.getSectorArcShape( hoverHighlight.sector, 0.5 );
        const sectorHighlightNode = new Path( sectorShape.getOffsetShape( 0.05 ), {
          stroke: hoverHighlightColorProperty,
          lineWidth: 0.02
        } );

        children = [ sectorHighlightNode ];
      }
      else {
        // TODO
        children = [];
      }

    }
    else {
      children = [];
    }


    super( {
      children: children
    } );
  }
}