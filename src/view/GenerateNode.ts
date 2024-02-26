import { Range, Vector2 } from 'phet-lib/dot';
import { HBox, HBoxOptions, Node, Path, Rectangle, Text, VBox, VSeparator } from 'phet-lib/scenery';
import { TPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TState } from '../model/data/core/TState.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import _ from '../workarounds/_.ts';
import { Multilink, Property } from 'phet-lib/axon';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';
import { blackLineColorProperty, playAreaBackgroundColorProperty, popupFont, popupHeaderFont, puzzleBackgroundColorProperty, uiForegroundColorProperty } from './Theme.ts';
import { optionize } from 'phet-lib/phet-core';
import { Shape } from 'phet-lib/kite';

type SelfOptions = {
  loadPuzzle: ( puzzle: TPuzzle<TStructure, TState<TCompleteData>> ) => void;
};

export type GenerateNodeOptions = SelfOptions & HBoxOptions;

export type PolygonGeneratorParameter = { label: string } & ( {
  type: 'integer';
  range: Range;
} | {
  type: 'float';
  range: Range;
} | {
  type: 'boolean';
} | {
  type: 'choice';
  choices: {
    value: string;
    label: string;
  }[];
} );

export type PolygonGenerator = {
  name: string;
  parameters: Record<string, PolygonGeneratorParameter>;
  defaultParameterValues: Record<string, any>; // TODO: maybe sometime do the typing work for this?
  generate: ( parameters: Record<string, any> ) => Vector2[][];
};

export const polygonGenerators: PolygonGenerator[] = [
  {
    name: 'Square',
    parameters: {
      width: {
        label: 'Width',
        type: 'integer',
        range: new Range( 2, 100 )
      },
      height: {
        label: 'Height',
        type: 'integer',
        range: new Range( 2, 100 )
      }
    },
    defaultParameterValues: {
      width: 5,
      height: 5
    },
    generate: ( parameters ) => {
      const width = parameters.width as number;
      const height = parameters.height as number;

      return _.range( 0, height ).flatMap( y => _.range( 0, width ).map( x => {
        return [
          new Vector2( x, y ),
          new Vector2( x + 1, y ),
          new Vector2( x + 1, y + 1 ),
          new Vector2( x, y + 1 )
        ];
      } ) );
    }
  },
  {
    name: 'Hexagonal',
    parameters: {
      radius: {
        label: 'Radius',
        type: 'integer',
        range: new Range( 1, 100 )
      },
      isPointyTop: {
        label: 'Pointy Top',
        type: 'boolean'
      },
      holeRadius: {
        label: 'Hole Radius',
        type: 'integer',
        range: new Range( 0, 5 )
      }
    },
    defaultParameterValues: {
      radius: 5,
      isPointyTop: true,
      holeRadius: 0
    },
    generate: ( parameters ) => {
      const radius = parameters.radius as number;
      const isPointyTop = parameters.isPointyTop as boolean;
      const holeRadius = parameters.holeRadius as number;

      // axial convention with https://www.redblobgames.com/grids/hexagons/
      let qBasis: Vector2;
      let rBasis: Vector2;

      // boo, no Matrix2
      if ( isPointyTop ) {
        qBasis = new Vector2( Math.sqrt( 3 ), 0 );
        rBasis = new Vector2( Math.sqrt( 3 ) / 2, 3 / 2 );
      }
      else {
        qBasis = new Vector2( 3 / 2, Math.sqrt( 3 ) / 2 );
        rBasis = new Vector2( 0, Math.sqrt( 3 ) );
      }

      // The six axial directions in QR coordinates to move from one face to the next (in CCW direction)
      const axialNeighborDeltas = [
        new Vector2( 1, 0 ),
        new Vector2( 1, -1 ),
        new Vector2( 0, -1 ),
        new Vector2( -1, 0 ),
        new Vector2( -1, 1 ),
        new Vector2( 0, 1 )
      ];

      // The sum of adjacent axial directions, which when added to a face coordinate give the 1/3 of moving to its vertex.
      const vertexNeighborDeltas = _.range( 0, 6 ).map( i => axialNeighborDeltas[ i ].plus( axialNeighborDeltas[ ( i + 1 ) % 6 ] ) );

      // vertex coordinates will be the sum of all three adjacent faces
      const getVertexLocationsFromFace = ( f: Vector2 ): Vector2[] => vertexNeighborDeltas.map( delta => delta.plus( f.timesScalar( 3 ) ) );

      const getDistance = ( a: Vector2, b: Vector2 ) => {
        return ( Math.abs( a.x - b.x ) + Math.abs( a.x + a.y - b.x - b.y ) + Math.abs( a.y - b.y ) ) / 2;
      };

      const polygons: Vector2[][] = [];

      // Faces in the puzzle
      for ( let q = -radius; q <= radius; q++ ) {
        for ( let r = Math.max( -radius, -q - radius ); r <= Math.min( radius, -q + radius ); r++ ) {
          const point = new Vector2( q, r );
          if ( getDistance( point, new Vector2( 0, 0 ) ) >= holeRadius ) {
            polygons.push( getVertexLocationsFromFace( point ).map( p => {
              return qBasis.timesScalar( p.x ).plus( rBasis.timesScalar( p.y ) ).timesScalar( 1 / 3 );
            } ) );
          }
        }
      }

      return polygons;
    }
  }
];

// TODO: place it in such a way where we set preferred size?
export class GenerateNode extends HBox {
  public constructor(
    public readonly glassPane: Node,
    providedOptions: GenerateNodeOptions
  ) {

    // TODO: global rotation
    // TODO: await generation process, show it on the board (do a lookup on view step)
    // TODO: zoomable preview?

    // TODO: board storage / board JSON (custom) import --- ability to "name" a board

    // TODO: should we remember the user's last selection?
    const polygonGeneratorProperty = new Property<PolygonGenerator>( polygonGenerators[ 0 ] );

    const polygonGeneratorButtonGroup = getVerticalRadioButtonGroup( 'Generators', polygonGeneratorProperty, polygonGenerators.map( generator => {
      return {
        value: generator,
        createNode: () => new Text( generator.name, {
          font: popupFont,
          fill: uiForegroundColorProperty
        } ),
        a11yName: generator.name
      };
    } ), {
      layoutOptions: {
        align: 'top',
        grow: 0
      },
      justify: 'top'
    } );

    const propertiesControlsContainer = new VBox( {
      spacing: 10
    } );

    const propertiesBox = new VBox( {
      spacing: 20,
      layoutOptions: {
        align: 'top',
        grow: 0
      },
      justify: 'top',
      children: [
        new Text( 'Properties', {
          font: popupHeaderFont,
          fill: uiForegroundColorProperty
        } ),
        propertiesControlsContainer
      ]
    } );

    const previewForeground = new Node( {
      children: [
        new Rectangle( 0, 0, 100, 50, {
          fill: 'red'
        } )
      ]
    } );

    const setPreview = ( generator: PolygonGenerator, parameters: Record<string, any> ) => {
      const polygons = generator.generate( parameters );
      previewForeground.children = polygons.map( polygon => {
        return new Path( Shape.polygon( polygon ), {
          fill: puzzleBackgroundColorProperty,
          stroke: blackLineColorProperty,
          lineWidth: 0.05
        } );
      } );
    };

    setPreview( polygonGenerators[ 0 ], {
      width: 5,
      height: 5
    } );

    const previewRectangle = new Rectangle( {
      fill: playAreaBackgroundColorProperty,
      sizable: true,
      layoutOptions: {
        grow: 1
      },
      children: [
        previewForeground
      ]
    } );

    Multilink.multilink( [
      previewRectangle.localPreferredWidthProperty,
      previewRectangle.localPreferredHeightProperty,
      previewForeground.localBoundsProperty
    ], ( width, height, localBounds ) => {
      if ( width !== null && height !== null ) {
        const padding = 15;
        const availableWidth = width - 2 * padding;
        const availableHeight = height - 2 * padding;
        const scale = Math.min( availableWidth / localBounds.width, availableHeight / localBounds.height );
        previewForeground.setScaleMagnitude( scale );
        previewForeground.centerX = width / 2;
        previewForeground.centerY = height / 2;
      }
    } );

    const options = optionize<GenerateNodeOptions, SelfOptions, HBoxOptions>()( {
      spacing: 10,
      stretch: true,
      children: [
        polygonGeneratorButtonGroup,
        new VSeparator(),
        propertiesBox,
        previewRectangle
      ]
    }, providedOptions );

    super( options );
  }
}
