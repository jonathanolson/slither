import { DerivedProperty, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2, Matrix3 } from 'phet-lib/dot';
import { controlBarMargin, currentTheme } from './Theme.ts';
import { AlignGroup, Node, Path, Rectangle } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import UIRectangularRadioButtonGroup from './UIRectangularRadioButtonGroup.ts';
import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';
import { advancedSettingsVisibleProperty } from './SettingsNode.ts';
import { fontAwesomePencilShape, toFontAwesomePath } from './FontAwesomeShape.ts';
import { puzzleFromCompressedString } from '../model/puzzle/TPuzzle.ts';
import { VertexStateNode } from './puzzle/VertexStateNode.ts';
import assert, { assertEnabled } from '../workarounds/assert.ts';
import { FaceStateNode } from './puzzle/FaceStateNode.ts';
import { basicFaceColoringPuzzleStyle, basicLinesPuzzleStyle, basicSectorsPuzzleStyle, classicPuzzleStyle, customPuzzleStyle, faceStatePuzzleStyle, pureFaceColorPuzzleStyle, puzzleStyleProperty, sectorsWithColorsPuzzleStyle, vertexStatePuzzleStyle } from './puzzle/puzzleStyles.ts';

export type ViewStyleBarNodeOptions = {
  layoutBoundsProperty: TReadOnlyProperty<Bounds2>;
};

export default class ViewStyleBarNode extends UIRectangularRadioButtonGroup<TPuzzleStyle> {
  public constructor(
    options: ViewStyleBarNodeOptions
  ) {
    const {
      basicLinesIcon,
      basicFaceColoringIcon,
      pureFaceColoringIcon,
      classicIcon,
      basicSectorsIcon,
      sectorsWithColorsIcon,
      vertexStateIcon,
      faceStateIcon,
      customIcon
    } = ViewStyleBarNode.getIcons();

    // TODO: deduplicate with the bit in Settings?
    super( puzzleStyleProperty, [
      {
        value: basicLinesPuzzleStyle,
        createNode: () => basicLinesIcon,
        labelContent: 'Basic Lines'
      },
      {
        value: basicFaceColoringPuzzleStyle,
        createNode: () => basicFaceColoringIcon,
        labelContent: 'Basic Face Colors'
      },
      {
        value: pureFaceColorPuzzleStyle,
        createNode: () => pureFaceColoringIcon,
        labelContent: 'Pure Face Colors'
      },
      {
        value: classicPuzzleStyle,
        createNode: () => classicIcon,
        labelContent: 'Classic'
      },
      {
        value: basicSectorsPuzzleStyle,
        createNode: () => basicSectorsIcon,
        labelContent: 'Basic Sectors',
        options: {
          visibleProperty: advancedSettingsVisibleProperty
        }
      },
      {
        value: sectorsWithColorsPuzzleStyle,
        createNode: () => sectorsWithColorsIcon,
        labelContent: 'Sectors With Colors',
        options: {
          visibleProperty: advancedSettingsVisibleProperty
        }
      },
      {
        value: vertexStatePuzzleStyle,
        createNode: () => vertexStateIcon,
        labelContent: 'Sectors With Colors',
        options: {
          visibleProperty: advancedSettingsVisibleProperty
        }
      },
      {
        value: faceStatePuzzleStyle,
        createNode: () => faceStateIcon,
        labelContent: 'Sectors With Colors',
        options: {
          visibleProperty: advancedSettingsVisibleProperty
        }
      },
      {
        value: customPuzzleStyle,
        createNode: () => customIcon,
        labelContent: 'Custom',
        options: {
          visibleProperty: advancedSettingsVisibleProperty
        }
      }
    ] );

    options.layoutBoundsProperty.link( bounds => {
      this.maxWidth = Math.max( 1, bounds.width - 2 * controlBarMargin );
    } );
  }

  public static getIcons() {

    const uncoloredBackground = new Rectangle( 0, 0, 15, 15, {
      stroke: currentTheme.whiteLineColorProperty,
      fill: currentTheme.faceColorDefaultColorProperty
    } );
    const coloredBackground = new Rectangle( 0, 0, 15, 15, {
      stroke: currentTheme.whiteLineColorProperty,
      fill: new DerivedProperty( [ currentTheme.faceColorBasicTargetColorProperty ], color => color.withAlpha( 1 ) )
    } );

    const coloredLines = new Path( new Shape().moveTo( 0, 15 ).lineTo( 0, 0 ).lineTo( 15, 0 ).makeImmutable(), {
      stroke: new DerivedProperty( [ currentTheme.simpleRegionTargetColorProperty ], color => color.withAlpha( 1 ) ),
      lineWidth: 4,
      lineCap: 'round',
      lineJoin: 'round'
    } );
    const uncoloredLines = new Path( new Shape().moveTo( 0, 15 ).lineTo( 0, 0 ).lineTo( 15, 0 ).makeImmutable(), {
      stroke: currentTheme.blackLineColorProperty,
      lineWidth: 4,
      lineCap: 'round',
      lineJoin: 'round'
    } );

    const sector = new Path( new Shape().arc( 0, 0, 9, 0, Math.PI / 2, false ), {
      stroke: currentTheme.sectorOnlyOneColorProperty
    } );

    const basicLinesIcon = new Node( {
      children: [
        uncoloredBackground,
        coloredLines
      ]
    } );

    const basicFaceColoringIcon = new Node( {
      children: [
        coloredBackground,
        uncoloredLines
      ]
    } );

    const pureFaceColoringIcon = new Node( {
      children: [
        new Rectangle( 0, 0, 15, 15, {
          fill: currentTheme.uiForegroundColorProperty
        } )
      ]
    } );

    const halfSize = 3;
    const xShape = new Shape()
      .moveTo( -halfSize, -halfSize )
      .lineTo( halfSize, halfSize )
      .moveTo( -halfSize, halfSize )
      .lineTo( halfSize, -halfSize );

    const classicIcon = new Node( {
      children: [
        new Rectangle( 0, 0, 15, 15, {
          fill: currentTheme.puzzleBackgroundColorProperty
        } ),
        new Path( new Shape().moveTo( 0, 15 ).lineTo( 0, 0 ).lineTo( 15, 0 ).makeImmutable(), {
          stroke: currentTheme.blackLineColorProperty,
          lineWidth: 3,
          lineCap: 'square',
          lineJoin: 'miter'
        } ),
        new Path( xShape, {
          stroke: currentTheme.xColorProperty,
          lineWidth: 2,
          x: 15,
          y: 7.5
        } )
      ]
    } );

    const basicSectorsIcon = new Node( {
      children: [
        uncoloredBackground,
        sector,
        coloredLines,
      ]
    } );

    const sectorsWithColorsIcon = new Node( {
      children: [
        coloredBackground,
        sector,
        uncoloredLines,
      ]
    } );

    // TODO: less lazy way
    const demoPuzzle = puzzleFromCompressedString( 'eJytV11v2jAU/S9+9oOvv4PUh7VQqS+dNtZK08RDVlwUjQIiKWuF8t9nJw2JjWGJygtKfE7OuR/Oxdmjndnm2XqFRoDR73W6naPRHhXvG4NG6DrNzXW1hh2vyJ5Mjka/9ugNjQhG79Xvrr7ZubsSdzCoMYhh1MPAw5in6WO8xmhMU3iY/5ysMRZ7TnmY/5z24qQelnhx+hgQL5gABM8xAP3SMB/0axOAfnECUHierJxh9JxG+9k2mmDAFLPZhxJEKIA5Fpg2FBqhcCyxwqKhsAiFWRuNk4bCIxRqbWxVdcMREY6wPra4QBqSjJAS62SLDIe0VISknZctKBwy07HkSWVnA+Oz0hJRXqSF6bxAN+uXzdIUZpwWKaoL/pguX+v7lnbrrXcb464csW1Q61Lt1A5BhAQWEFRIoAFBHyu4rMx8YaZuIQh7Ytc/InYUF3FVhMwl/d0s7FgJnpiGkM+uFDD6a7LtfNJRdCHerJfrbaRu7TpGT+66Llxm5xiTIhESGNdaccnZB2Fa54a+PvyY3o0nnXpb7/Vms86zwhyk76yQ1QBOOFeESZ0w5cqWRdYDg7v7nvphoI0+EEEJIcIaJIoyCPQf7seTG+swRvF3uTzlt3pdLhsPRmXCtdAEEkpUfw8Y4KEp1ZpwpaWQjBHR14MOyQMEkTQhYK2EpL092AAPxaRilJKEckbFUb9PevAhHoqDtG2XTNreJ737IYb0I1ECqOBCJMDtzu3rIQd4cHBdUEwntlCgeuehhtTKblhCpSB2byXWp6+H7uNhwWy1S5fZ/ICh0XO6zI2bceap+DAKR1yANNzavL52dDtht8XRaDerubcGZTuMpUv7nABEBOgQARoRYEMEWESADBEQEQHVEeD/rUGsimKIgoq1AQbFEGsEkE+nMTAK/vkoookMqibEOmpD60q4v3h3qjJvsRfqMUCCT5H6wVNnJPTty9UVckFGeNDh5Wd4tMNji9M81lNPdPXO8FSHx8/l0U2YniNCX0Xel9jNZVERmwNbrJe33nrfg+6+PThX546XtNhmloh+OkM7pvMvq/dmNgdHWjgr5gZ9R6/VKravR1L0clLsclL8clJHHxCeFOutIy8X0tEniydFe+scfdmcTO1PbE/NyrL8B0eOKVk=' )!;
    assertEnabled() && assert( demoPuzzle );

    const vertexStateNode = new VertexStateNode( demoPuzzle.board.vertices[ 5 ], demoPuzzle.stateProperty, new TinyProperty( false ), {
      ...vertexStatePuzzleStyle,
      allVertexStateVisibleProperty: new TinyProperty( true )
    } );
    const vertexStateIcon = new Node( {
      children: [
        vertexStateNode
      ],
      scale: 60
    } );

    const faceStateNode = new FaceStateNode( demoPuzzle.board.faces[ 5 ], demoPuzzle.stateProperty, faceStatePuzzleStyle );
    const faceStateIcon = new Node( {
      children: [
        faceStateNode
      ],
      scale: 30
    } );

    const customIcon = toFontAwesomePath( fontAwesomePencilShape, {
      fill: currentTheme.uiForegroundColorProperty,
      matrix: new Matrix3().rowMajor(
        0.75, 0, 0,
        0, -0.75, 0,
        0, 0, 1
      )
    } );

    const alignGroup = new AlignGroup();

    return {
      basicLinesIcon: alignGroup.createBox( basicLinesIcon ),
      basicFaceColoringIcon: alignGroup.createBox( basicFaceColoringIcon ),
      pureFaceColoringIcon: alignGroup.createBox( pureFaceColoringIcon ),
      classicIcon: alignGroup.createBox( classicIcon ),
      basicSectorsIcon: alignGroup.createBox( basicSectorsIcon ),
      sectorsWithColorsIcon: alignGroup.createBox( sectorsWithColorsIcon ),
      vertexStateIcon: alignGroup.createBox( vertexStateIcon ),
      faceStateIcon: alignGroup.createBox( faceStateIcon ),
      customIcon: alignGroup.createBox( customIcon ),
    };
  }
}