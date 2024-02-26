import { Bounds2, Dimension2, Range, Vector2 } from 'phet-lib/dot';
import { HBox, HBoxOptions, Node, Path, Rectangle, Text, VBox, VSeparator } from 'phet-lib/scenery';
import { TPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TState } from '../model/data/core/TState.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import _ from '../workarounds/_.ts';
import { BooleanProperty, Multilink, NumberProperty, Property } from 'phet-lib/axon';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';
import { blackLineColorProperty, playAreaBackgroundColorProperty, popupFont, popupHeaderFont, puzzleBackgroundColorProperty, rectangularButtonAppearanceStrategy, uiButtonBaseColorProperty, uiButtonForegroundProperty, uiForegroundColorProperty } from './Theme.ts';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { Shape } from 'phet-lib/kite';
import NumberControl from './to-port/SunNumberControl.ts';
import { getSettingsCheckbox } from './getSettingsCheckbox.ts';
import { TextPushButton, TextPushButtonOptions } from 'phet-lib/sun';
import { bisectedHexagonalTiling, cairoPentagonalTiling, deltoidalTrihexagonalTiling, elongatedTriangularTiling, falseCubicTiling, floretPentagonalTiling, greatRhombitrihexagonalTiling, hexagonalTiling, PeriodicBoardTiling, PolygonalBoard, portugalTiling, prismaticPentagonalTiling, rhombilleTiling, smallRhombitrihexagonalTiling, snubHexagonalTiling, snubSquareTiling, squareTiling, tetrakisSquareTiling, triakisTriangularTiling, triangularTiling, trihexagonalTiling, trihexAndHexTiling, truncatedHexagonalTiling, truncatedSquareTiling } from '../model/board/core/TiledBoard.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import { getCentroid } from '../model/board/core/createBoardDescriptor.ts';

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
  scale?: number;
};

export const getPeriodicTilingGenerator = (
  periodicTiling: PeriodicBoardTiling
): PolygonGenerator => {
  return {
    name: periodicTiling.name,
    parameters: {
      width: {
        label: 'Width',
        type: 'integer',
        range: new Range( 2, 50 )
      },
      height: {
        label: 'Height',
        type: 'integer',
        range: new Range( 2, 50 )
      },
      squareRegion: {
        label: 'Square Region',
        type: 'boolean'
      }
    },
    defaultParameterValues: {
      width: 10,
      height: 10,
      squareRegion: false
    },
    scale: periodicTiling.scale,
    generate: ( ( parameters: { width: number; height: number; squareRegion: boolean } ) => {

      const unitPolygons = periodicTiling.polygons;
      const basisA = periodicTiling.basisA;
      const basisB = periodicTiling.basisB;

      const polygons: Vector2[][] = [];

      const bounds = new Bounds2( -parameters.width / 2, -parameters.height / 2, parameters.width / 2, parameters.height / 2 );

      const size = Math.max(
        Math.abs( bounds.minX ),
        Math.abs( bounds.maxX ),
        Math.abs( bounds.minY ),
        Math.abs( bounds.maxY )
      ) * 20; // TODO ... overkill?

      _.range( -size, size ).forEach( a => {
        _.range( -size, size ).forEach( b => {
          unitPolygons.forEach( unitPolygon => {
            const tilePolygon = unitPolygon.map( v => v.plus( basisA.timesScalar( a ) ).plus( basisB.timesScalar( b ) ) );

            // TODO: do determination based on vertices instead of centroid!!!
            const centroid = getCentroid( tilePolygon );
            const scaledX = centroid.x * 2 / parameters.width;
            const scaledY = centroid.y * 2 / parameters.height;

            if ( parameters.squareRegion ) {
              if ( Math.abs( scaledX ) >= 1 || Math.abs( scaledY ) >= 1 - 1e-6 ) {
                return;
              }
            }
            else {
              if ( Math.sqrt( scaledX * scaledX + scaledY * scaledY ) >= 1 - 1e-6 ) {
                return;
              }
            }

            polygons.push( tilePolygon );
          } );
        } );
      } );

      return polygons;
    } ) as ( parameters: Record<string, any> ) => Vector2[][]
  };
};

export const polygonGenerators: PolygonGenerator[] = [
  {
    name: 'Square',
    parameters: {
      width: {
        label: 'Width',
        type: 'integer',
        range: new Range( 2, 50 )
      },
      height: {
        label: 'Height',
        type: 'integer',
        range: new Range( 2, 50 )
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
        range: new Range( 1, 30 )
      },
      isPointyTop: {
        label: 'Pointy Top',
        type: 'boolean'
      },
      holeRadius: {
        label: 'Hole Radius',
        type: 'integer',
        range: new Range( 0, 25 )
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
  },
  getPeriodicTilingGenerator( rhombilleTiling ),
  getPeriodicTilingGenerator( triangularTiling ),
  getPeriodicTilingGenerator( trihexagonalTiling ),
  getPeriodicTilingGenerator( smallRhombitrihexagonalTiling ),
  getPeriodicTilingGenerator( truncatedSquareTiling ),
  getPeriodicTilingGenerator( snubSquareTiling ),
  getPeriodicTilingGenerator( truncatedHexagonalTiling ),
  getPeriodicTilingGenerator( elongatedTriangularTiling ),
  getPeriodicTilingGenerator( greatRhombitrihexagonalTiling ),
  getPeriodicTilingGenerator( snubHexagonalTiling ),
  getPeriodicTilingGenerator( deltoidalTrihexagonalTiling ),
  getPeriodicTilingGenerator( tetrakisSquareTiling ),
  getPeriodicTilingGenerator( cairoPentagonalTiling ),
  getPeriodicTilingGenerator( triakisTriangularTiling ),
  getPeriodicTilingGenerator( prismaticPentagonalTiling ),
  getPeriodicTilingGenerator( bisectedHexagonalTiling ),
  getPeriodicTilingGenerator( floretPentagonalTiling ),
  getPeriodicTilingGenerator( portugalTiling ),
  getPeriodicTilingGenerator( falseCubicTiling ),
  getPeriodicTilingGenerator( trihexAndHexTiling ),
  getPeriodicTilingGenerator( squareTiling ),
  getPeriodicTilingGenerator( hexagonalTiling )
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
      spacing: 10,
      align: 'left'
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

    polygonGeneratorProperty.link( generator => {
      propertiesControlsContainer.children.forEach( child => child.dispose() );

      const parameters: Record<string, any> = {};

      const update = () => {
        setPreview( generator, parameters );
      };

      for ( const [ key, parameter ] of Object.entries( generator.parameters ) ) {
        if ( parameter.type === 'integer' ) {
          const property = new NumberProperty( generator.defaultParameterValues[ key ] );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( new NumberControl( parameter.label, property, parameter.range, {
            layoutFunction: NumberControl.createLayoutFunction4(),
            titleNodeOptions: {
              font: popupFont,
              fill: uiForegroundColorProperty
            },
            sliderOptions : {
              trackSize: new Dimension2( 100, 5 ),
              labelTagName: 'label',
              keyboardStep: 1,
              labelContent: parameter.label
            },
            numberDisplayOptions: {
              decimalPlaces: 0
            },
            delta: 1
          } ) );
        }
        else if ( parameter.type === 'float' ) {
          const property = new NumberProperty( generator.defaultParameterValues[ key ] );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( new NumberControl( parameter.label, property, parameter.range, {
            layoutFunction: NumberControl.createLayoutFunction4(),
            titleNodeOptions: {
              font: popupFont,
              fill: uiForegroundColorProperty
            },
            sliderOptions : {
              trackSize: new Dimension2( 100, 5 ),
              labelTagName: 'label',
              keyboardStep: 0.1,
              labelContent: parameter.label
            },
            numberDisplayOptions: {
              decimalPlaces: 2
            },
            delta: 0.01
          } ) );
        }
        else if ( parameter.type === 'boolean' ) {
          const property = new BooleanProperty( generator.defaultParameterValues[ key ] );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( getSettingsCheckbox( parameter.label, property ) );
        }
        else if ( parameter.type === 'choice' ) {
          const property = new Property<string>( parameter.choices[ 0 ].value );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( getVerticalRadioButtonGroup( parameter.label, property, parameter.choices.map( choice => {
            return {
              value: choice.value,
              createNode: () => new Text( choice.label, {
                font: popupFont,
                fill: uiForegroundColorProperty
              } ),
              a11yName: choice.label
            };
          } ) ) );
        }
        else {
          // TODO::: more!!!
        }
      }

      // TODO: factor out with the panels/etc.
      const commonButtonOptions = {
        textFill: uiButtonForegroundProperty,
        baseColor: uiButtonBaseColorProperty,
        xMargin: 5,
        yMargin: 5,
        font: popupFont,
        buttonAppearanceStrategy: rectangularButtonAppearanceStrategy,
      };

      propertiesControlsContainer.addChild( new TextPushButton( 'Generate', combineOptions<TextPushButtonOptions>( {}, commonButtonOptions, {
        layoutOptions: {
          align: 'center'
        },
        listener: () => {
          const polygons = generator.generate( parameters );

          const board = new PolygonalBoard( polygons, generator.scale ?? 1 );

          options.loadPuzzle( BasicPuzzle.generateHard( board ) );
        }
      } ) ) );
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
      if ( width !== null && height !== null && localBounds.isFinite() ) {
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