import { Bounds2, Dimension2, Range, Vector2 } from 'phet-lib/dot';
import { HBox, HBoxOptions, HSeparator, Node, Path, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import _ from '../workarounds/_.ts';
import { BooleanProperty, Multilink, NumberProperty, Property, TinyEmitter, TinyProperty } from 'phet-lib/axon';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';
import { currentTheme, generateButtonFont, uiFont } from './Theme.ts';
import { optionize } from 'phet-lib/phet-core';
import { Shape } from 'phet-lib/kite';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { bisectedHexagonalTiling, cairoPentagonalTiling, deltoidalTrihexagonalTiling, elongatedTriangularTiling, floretPentagonalTiling, greatRhombitrihexagonalTiling, hexagonalTiling, penrose10, penrose11, penrose13, penrose14, penrose20, penrose6, PeriodicBoardTiling, PolygonalBoard, portugalTiling, prismaticPentagonalTiling, rhombilleTiling, smallRhombitrihexagonalTiling, snubHexagonalTiling, snubSquareTiling, squareTiling, tetrakisSquareTiling, triakisTriangularTiling, triangularTiling, trihexagonalTiling, trihexAndHexTiling, truncatedHexagonalTiling, truncatedSquareTiling } from '../model/board/core/TiledBoard.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import { getCentroid } from '../model/board/core/createBoardDescriptor.ts';
import { advancedSettingsVisibleProperty } from './SettingsNode.ts';
import assert, { assertEnabled } from '../workarounds/assert.ts';
import { UITextPushButton } from './UITextPushButton.ts';
import { generateFaceAdditive } from '../model/generator/generateFaceAdditive.ts';
import { greedyFaceMinimize } from '../model/generator/greedyFaceMinimize.ts';
import FaceValue from '../model/data/face-value/FaceValue.ts';
import { interruptableSleep } from '../util/interruptableSleep.ts';
import { LocalStorageProperty } from '../util/localStorage.ts';
import { NumberControl } from 'phet-lib/scenery-phet';
import { InterruptedError } from '../model/solver/errors/InterruptedError.ts';
import CanSolveDifficulty, { canSolveDifficultyProperty } from '../model/generator/CanSolveDifficulty.ts';
import { withAllFacesFilled } from '../model/generator/withAllFacesFilled.ts';
import { UIText } from './UIText.ts';
import { UIAquaRadioButtonGroup } from './UIAquaRadioButtonGroup.ts';

type SelfOptions = {
  loadPuzzle: ( puzzle: TPropertyPuzzle<TStructure, TCompleteData> ) => void;
};

export type GenerateNodeOptions = SelfOptions & HBoxOptions;

export type PolygonGeneratorParameter = {
  label: string;
  advanced?: boolean;
} & ( {
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

type PeriodicTilingParameterOverrides = {
  width?: number;
  height?: number;
  squareRegion?: boolean;
};

export const getPeriodicTilingGenerator = (
  periodicTiling: PeriodicBoardTiling,
  overrides?: PeriodicTilingParameterOverrides
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
        label: 'Square',
        type: 'boolean'
      }
    },
    defaultParameterValues: {
      width: overrides?.width ?? 10,
      height: overrides?.height ?? 10,
      squareRegion: overrides?.squareRegion ?? false
    },
    scale: periodicTiling.scale,
    generate: ( ( parameters: { width: number; height: number; squareRegion: boolean } ) => {

      const unitPolygons = periodicTiling.polygons;
      const basisA = periodicTiling.basisA;
      const basisB = periodicTiling.basisB;

      const polygons: Vector2[][] = [];

      const bounds = new Bounds2( -parameters.width / 2, -parameters.height / 2, parameters.width / 2, parameters.height / 2 );

      const unitPolygonsBounds = Bounds2.NOTHING.copy();
      unitPolygons.forEach( polygon => {
        polygon.forEach( vertex => {
          unitPolygonsBounds.addPoint( vertex );
        } );
      } );

      const size = Math.max(
        Math.abs( bounds.minX ),
        Math.abs( bounds.maxX ),
        Math.abs( bounds.minY ),
        Math.abs( bounds.maxY )
      ) * 20; // TODO ... overkill?

      // Using mutable forms for performance
      const polygonBounds = Bounds2.NOTHING.copy();
      const aDelta = new Vector2( 0, 0 );
      const bDelta = new Vector2( 0, 0 );
      const delta = new Vector2( 0, 0 );

      _.range( -size, size ).forEach( a => {
        aDelta.set( basisA ).multiplyScalar( a );

        _.range( -size, size ).forEach( b => {
          bDelta.set( basisB ).multiplyScalar( b );

          delta.set( aDelta ).add( bDelta );

          polygonBounds.set( unitPolygonsBounds ).shift( delta );

          if ( !bounds.intersectsBounds( polygonBounds ) ) {
            return;
          }

          // TODO: we COULD do the centroid for each one?
          unitPolygons.forEach( unitPolygon => {
            const tilePolygon = unitPolygon.map( v => v.plus( delta ) );

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

export const squarePolygonGenerator: PolygonGenerator = {
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
    width: 6,
    height: 10
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
};

export const hexagonalPolygonGenerator: PolygonGenerator = {
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
      range: new Range( 0, 25 ),
      advanced: true
    }
  },
  defaultParameterValues: {
    radius: 4,
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
};

export const penroseTilingGenerator: PolygonGenerator = {
  name: 'Penrose',
  parameters: {
    // TODO: support all radii, and handle prescale
    radius: {
      label: 'Radius',
      type: 'choice',
      choices: [
        {
          value: '6',
          label: '6'
        },
        {
          value: '10',
          label: '10'
        },
        {
          value: '11',
          label: '11'
        },
        {
          value: '13',
          label: '13'
        },
        {
          value: '14',
          label: '14'
        },
        {
          value: '20',
          label: '20'
        }
      ]
    }
  },
  defaultParameterValues: {
    radius: '6'
  },
  generate: ( ( parameters: { radius: string } ): Vector2[][] => {
    const penroseTiling = {
      '6': penrose6,
      '10': penrose10,
      '11': penrose11,
      '13': penrose13,
      '14': penrose14,
      '20': penrose20
    }[ parameters.radius ]!;

    assertEnabled() && assert( penroseTiling );

    const prescale = 0.01;

    // They are closed, we ignore the last point
    const thinPolygons = penroseTiling.thinShape.subpaths.filter( subpath => subpath.segments.length ).map( subpath => subpath.points.slice( 0, -1 ).map( v => v.timesScalar( prescale ) ) );
    const thickPolygons = penroseTiling.thickShape.subpaths.filter( subpath => subpath.segments.length ).map( subpath => subpath.points.slice( 0, -1 ).map( v => v.timesScalar( prescale ) ) );

    return [ ...thickPolygons, ...thinPolygons ];
  } ) as ( parameters: Record<string, any> ) => Vector2[][]
};

export const polygonGenerators: PolygonGenerator[] = [
  getPeriodicTilingGenerator( rhombilleTiling, {
    width: 8,
    height: 8
  } ),
  squarePolygonGenerator,
  hexagonalPolygonGenerator,
  getPeriodicTilingGenerator( cairoPentagonalTiling, {
    // TODO: get more aesthetic options!
    width: 8,
    height: 8,
    squareRegion: true
  } ),
  getPeriodicTilingGenerator( snubSquareTiling, {
    width: 5,
    height: 6,
    squareRegion: true
  } ),
  getPeriodicTilingGenerator( triangularTiling, {
    width: 6,
    height: 5
  } ),
  getPeriodicTilingGenerator( trihexagonalTiling, {
    width: 9,
    height: 9
  } ),

  getPeriodicTilingGenerator( snubHexagonalTiling, {
    width: 9,
    height: 9
  } ),

  getPeriodicTilingGenerator( floretPentagonalTiling, {
    // TODO: more aesthetic!
    width: 7,
    height: 8
  } ),

  // Quadish things
  getPeriodicTilingGenerator( deltoidalTrihexagonalTiling ),

  // Triangular things
  getPeriodicTilingGenerator( triakisTriangularTiling ),
  getPeriodicTilingGenerator( bisectedHexagonalTiling ),
  getPeriodicTilingGenerator( tetrakisSquareTiling, {
    squareRegion: true
  } ),

  // Irregular things
  getPeriodicTilingGenerator( portugalTiling ),
  getPeriodicTilingGenerator( truncatedSquareTiling ),

  // Irregular with larger N faces
  getPeriodicTilingGenerator( trihexAndHexTiling, {
    width: 9,
    height: 9
  } ),
  // NOTE: Disabled because this is basically just hex...
  // getPeriodicTilingGenerator( falseCubicTiling, {
  //   width: 9,
  //   height: 10
  // } ),

  // Large N faces
  getPeriodicTilingGenerator( truncatedHexagonalTiling ),
  getPeriodicTilingGenerator( smallRhombitrihexagonalTiling, {
    width: 9,
    height: 9
  } ),
  getPeriodicTilingGenerator( greatRhombitrihexagonalTiling ),

  // Gridlike things
  getPeriodicTilingGenerator( prismaticPentagonalTiling ),
  getPeriodicTilingGenerator( elongatedTriangularTiling, {
    width: 6,
    height: 8,
    squareRegion: true
  } ),

  getPeriodicTilingGenerator( squareTiling ),
  getPeriodicTilingGenerator( hexagonalTiling ),
  penroseTilingGenerator
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
    const polygonGeneratorProperty = new LocalStorageProperty<PolygonGenerator>( 'polygonGeneratorProperty', {
      serialize: generator => generator.name,
      deserialize: value => polygonGenerators.find( generator => generator.name === value ) ?? polygonGenerators[ 0 ]
    } );
    // TODO: simplify this a bit

    const initialParameters = localStorage.getItem( 'polygonGeneratorParameters' ) ? JSON.parse( localStorage.getItem( 'polygonGeneratorParameters' )! ) : null;
    let usedInitialParameters = false;

    const polygonGeneratorButtonGroup = getVerticalRadioButtonGroup( 'Patterns', polygonGeneratorProperty, polygonGenerators.map( generator => {
      return {
        value: generator,
        createNode: () => new Text( generator.name, {
          font: uiFont,
          fill: currentTheme.uiForegroundColorProperty
        } ),
        labelContent: generator.name
      };
    } ), {
      layoutOptions: {
        align: 'top',
        grow: 0
      },
      justify: 'top'
    } );

    const generateButtonContainer = new HBox( {
      spacing: 10,
      align: 'center',
      layoutOptions: {
        grow: 0,
      },
      grow: 1
    } );

    const difficultyControlsContainer = new HBox( {
      spacing: 10,
      align: 'center',
      layoutOptions: {
        grow: 0
      },
      children: [
        new UIText( 'Solver Difficulty' ),
        new UIAquaRadioButtonGroup( canSolveDifficultyProperty, [
          {
            value: CanSolveDifficulty.STANDARD,
            createNode: () => new UIText( 'Standard' ),
            labelContent: 'Standard'
          },
          {
            value: CanSolveDifficulty.NO_LIMIT,
            createNode: () => new UIText( 'No Limit' ),
            labelContent: 'No Limit'
          }
        ], {
          orientation: 'horizontal',
          align: 'center',
          spacing: 30
        } )
      ]
    } );

    const propertiesControlsContainer = new HBox( {
      spacing: 10,
      align: 'center',
      justify: 'spaceEvenly',
      layoutOptions: {
        grow: 0
      }
    } );

    const previewBoardNode = new Node();
    const previewGeneratedNode = new Node();

    const interruptGenerateEmitter = new TinyEmitter();

    interruptGenerateEmitter.addListener( () => {
      previewGeneratedNode.children = [];
    } );

    const previewContainer = new Node( {
      children: [
        previewBoardNode,
        previewGeneratedNode
      ]
    } );

    const setPreview = ( generator: PolygonGenerator, parameters: Record<string, any> ) => {
      // TODO: switch to a Property<Vector2[][]>, so we can remove them. We'll display them efficiently here
      const polygons = generator.generate( parameters );

      const shape = new Shape();
      polygons.forEach( polygon => shape.polygon( polygon ) );
      previewBoardNode.children = [
        new Path( shape, {
          fill: currentTheme.puzzleBackgroundColorProperty,
          stroke: currentTheme.blackLineColorProperty,
          lineWidth: 0.05
        } )
      ];
      interruptGenerateEmitter.emit();
    };

    setPreview( polygonGenerators[ 0 ], {
      width: 5,
      height: 5
    } );

    polygonGeneratorProperty.link( generator => {
      propertiesControlsContainer.children.forEach( child => child.dispose() );
      generateButtonContainer.children.forEach( child => child.dispose() );

      const parameters: Record<string, any> = {};

      // TODO: simplify this a bit
      const getInitialParameterValue = ( key: string ) => {
        if ( initialParameters && !usedInitialParameters && key in initialParameters ) {
          return initialParameters[ key ]; // TODO: hopefully this is... in range?  eeek
        }
        else {
          return generator.defaultParameterValues[ key ];
        }
      };

      const update = () => {
        localStorage.setItem( 'polygonGeneratorParameters', JSON.stringify( parameters ) );
        setPreview( generator, parameters );
      };

      for ( const [ key, parameter ] of Object.entries( generator.parameters ) ) {
        if ( parameter.type === 'integer' ) {
          const property = new NumberProperty( getInitialParameterValue( key ) );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( new NumberControl( parameter.label, property, parameter.range, {
            layoutFunction: NumberControl.createLayoutFunction4(),
            titleNodeOptions: {
              font: uiFont,
              fill: currentTheme.uiForegroundColorProperty
            },
            sliderOptions : {
              trackSize: new Dimension2( 100, 5 ),
              labelTagName: 'label',
              keyboardStep: 1,
              labelContent: parameter.label
            },
            arrowButtonOptions: {
              touchAreaXDilation: 5,
              touchAreaYDilation: 25,
            },
            numberDisplayOptions: {
              decimalPlaces: 0
            },
            delta: 1,
            visibleProperty: parameter.advanced ? advancedSettingsVisibleProperty : null
          } ) );
        }
        else if ( parameter.type === 'float' ) {
          const property = new NumberProperty( getInitialParameterValue( key ) );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( new NumberControl( parameter.label, property, parameter.range, {
            layoutFunction: NumberControl.createLayoutFunction4(),
            titleNodeOptions: {
              font: uiFont,
              fill: currentTheme.uiForegroundColorProperty
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
            delta: 0.01,
            visibleProperty: parameter.advanced ? advancedSettingsVisibleProperty : null
          } ) );
        }
        else if ( parameter.type === 'boolean' ) {
          const property = new BooleanProperty( getInitialParameterValue( key ) );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );
          propertiesControlsContainer.addChild( new UITextCheckbox( parameter.label, property, {
            advanced: parameter.advanced
          } ) );
        }
        else if ( parameter.type === 'choice' ) {
          const property = new Property<string>( getInitialParameterValue( key ) );
          property.link( value => {
            parameters[ key ] = value;
            update();
          } );

          // TODO: refactor getVerticalRadioButtonGroup to UIVerticalRadioButtonGroup? (and add advanced pass-through handling)
          propertiesControlsContainer.addChild( getVerticalRadioButtonGroup( parameter.label, property, parameter.choices.map( choice => {
            return {
              value: choice.value,
              createNode: () => new Text( choice.label, {
                font: uiFont,
                fill: currentTheme.uiForegroundColorProperty
              } ),
              labelContent: choice.label
            };
          } ) ) );
        }
        else {
          // TODO::: more!!!
        }
      }

      usedInitialParameters = true;

      generateButtonContainer.addChild( new UITextPushButton( 'Generate', {
        font: generateButtonFont,
        layoutOptions: {
          align: 'center'
        },
        listener: async () => {
          interruptGenerateEmitter.emit();

          const polygons = generator.generate( parameters );

          const board = new PolygonalBoard( polygons, generator.scale ?? 1 );

          const interruptedProperty = new TinyProperty( false );

          const interruptListener = () => {
            interruptedProperty.value = true;
          };
          interruptGenerateEmitter.addListener( interruptListener );

          const faceDefineEmitter = new TinyEmitter<[ index: number, state: FaceValue ]>;
          const faceMinimizeEmitter = new TinyEmitter<[ index: number, state: FaceValue ]>;
          const faceResetEmitter = new TinyEmitter();

          faceResetEmitter.addListener( () => {
            previewGeneratedNode.children = [];
          } );

          faceDefineEmitter.addListener( ( index, state ) => {
            previewGeneratedNode.addChild( new Path( Shape.polygon( polygons[ index ] ), {
              fill: currentTheme.generateAddedFaceColorProperty,
              stroke: currentTheme.blackLineColorProperty,
              lineWidth: 0.05
            } ) );
            if ( state !== null ) {
              previewGeneratedNode.addChild( new Text( `${state}`, {
                font: generateButtonFont,
                fill: currentTheme.faceValueColorProperty,
                maxWidth: 0.9,
                maxHeight: 0.9,
                center: getCentroid( polygons[ index ] )
              } ) );
            }
          } );

          faceMinimizeEmitter.addListener( ( index, state ) => {
            previewGeneratedNode.addChild( new Path( Shape.polygon( polygons[ index ] ), {
              fill: currentTheme.generateMinimizedFaceColorProperty,
              stroke: currentTheme.blackLineColorProperty,
              lineWidth: 0.05
            } ) );
            if ( state !== null ) {
              previewGeneratedNode.addChild( new Text( `${state}`, {
                font: generateButtonFont,
                fill: currentTheme.faceValueColorProperty,
                maxWidth: 0.9,
                maxHeight: 0.9,
                center: getCentroid( polygons[ index ] )
              } ) );
            }
          } );

          try {
            const canSolveDifficulty = canSolveDifficultyProperty.value;
            const canSolve = canSolveDifficulty.canSolve;

            const getUniquePuzzle = async () => {
              return await generateFaceAdditive( board, interruptedProperty, faceDefineEmitter );
            };

            const getMinimizablePuzzle = async () => {
              let uniquePuzzle = await getUniquePuzzle();

              if ( canSolveDifficulty === CanSolveDifficulty.NO_LIMIT ) {
                return uniquePuzzle;
              }
              else {
                // TODO: should we do this on everything? probably not, because it ... doesn't change the distribution? BUT might make it harder?

                const blankFaces = board.faces.filter( face => uniquePuzzle.cleanState.getFaceValue( face ) === null );
                const minimizablePuzzle = withAllFacesFilled( uniquePuzzle );
                blankFaces.forEach( face => {
                  faceDefineEmitter.emit( board.faces.indexOf( face ), minimizablePuzzle.cleanState.getFaceValue( face ) );
                } );
                return minimizablePuzzle;
              }
            };

            let minimizablePuzzle = await getMinimizablePuzzle();
            while ( !canSolve( minimizablePuzzle.board, minimizablePuzzle.cleanState.clone() ) ) {
              faceResetEmitter.emit();
              minimizablePuzzle = await getMinimizablePuzzle();
            }

            const minimizedPuzzle = await greedyFaceMinimize( minimizablePuzzle, canSolve, interruptedProperty, faceMinimizeEmitter );

            // Maybe... let it complete on the screen before we do complicated time consuming things
            interruptableSleep( 17, interruptedProperty );
            
            if ( !interruptedProperty.value ) {
              previewGeneratedNode.children = [];
              options.loadPuzzle( BasicPuzzle.fromSolvedPuzzle( minimizedPuzzle ) );
            }
          }
          catch ( e ) {
            if ( e instanceof InterruptedError ) {
              // do nothing, we got interrupted and that's fine. Handled elsewhere
            }
          }

          if ( interruptGenerateEmitter.hasListener( interruptListener ) ) {
            interruptGenerateEmitter.removeListener( interruptListener );
          }
        }
      } ) );
    } );

    const previewRectangle = new Rectangle( {
      fill: currentTheme.playAreaBackgroundColorProperty,
      sizable: true,
      layoutOptions: {
        grow: 1
      },
      children: [
        previewContainer
      ]
    } );

    Multilink.multilink( [
      previewRectangle.localPreferredWidthProperty,
      previewRectangle.localPreferredHeightProperty,
      previewContainer.localBoundsProperty
    ], ( width, height, localBounds ) => {
      if ( width !== null && height !== null && localBounds.isFinite() ) {
        const padding = 15;
        const availableWidth = width - 2 * padding;
        const availableHeight = height - 2 * padding;
        const scale = Math.min( availableWidth / localBounds.width, availableHeight / localBounds.height );
        previewContainer.setScaleMagnitude( scale );
        previewContainer.centerX = width / 2;
        previewContainer.centerY = height / 2;
      }
    } );

    const options = optionize<GenerateNodeOptions, SelfOptions, HBoxOptions>()( {
      spacing: 10,
      stretch: true,
      children: [
        polygonGeneratorButtonGroup,
        new VBox( {
          spacing: 10,
          stretch: true,
          layoutOptions: {
            grow: 1
          },
          children: [
            previewRectangle,
            generateButtonContainer,
            new HSeparator(),
            difficultyControlsContainer,
            new HSeparator(),
            propertiesControlsContainer,
          ]
        } ),
      ]
    }, providedOptions );

    super( options );
  }
}
