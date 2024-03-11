import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { HBox, Node, Text, VBox } from 'phet-lib/scenery';
import { autoSolveFaceColorParityColorsProperty, autoSolveFaceColorParityPartialReductionProperty, autoSolveFaceColorParityToBlackProperty, autoSolveFaceColorParityToRedProperty, autoSolveFaceColorToBlackProperty, autoSolveFaceColorToRedProperty, autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleLoopToBlackProperty, autoSolveSimpleLoopToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexForcedLineToBlackProperty, autoSolveDoubleMinusOneFacesProperty } from '../model/solver/autoSolver';
import { availableThemes, edgeColorsVisibleProperty, faceColorsVisibleProperty, faceColorThresholdProperty, faceValueStyleProperty, faceValueStyles, joinedLinesCapProperty, joinedLinesJoinProperty, lineCaps, lineJoins, popupColorEditor, redLineStyleProperty, redLineStyles, redLineVisibleProperty, redXsAlignedProperty, redXsVisibleProperty, sectorsNextToEdgesVisibleProperty, sectorsTrivialVisibleProperty, sectorsVisibleProperty, smallVertexProperty, themeProperty, uiFont, uiForegroundColorProperty, uiHeaderFont, vertexStyleProperty, vertexStyles, verticesVisibleProperty, whiteLineVisibleProperty } from './Theme.ts';
import { PopupNode } from './PopupNode.ts';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';
import { LocalStorageBooleanProperty } from '../util/localStorage.ts';
import { UITextPushButton } from './UITextPushButton.ts';
import { showLayoutTestProperty } from '../model/board/layout/layout.ts';
import SlitherQueryParameters from '../SlitherQueryParameters.ts';
import { UIText } from './UIText.ts';

export const advancedSettingsVisibleProperty = new LocalStorageBooleanProperty( 'advancedSettingsVisibleProperty', false );

export class SettingsNode extends PopupNode {
  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>
  ) {

    const autoSolveNode = new VBox( {
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text( 'Solve After Every Move', {
          font: uiHeaderFont,
          fill: uiForegroundColorProperty
        } ),
        new UITextCheckbox( 'Vertex Joint X', autoSolveSimpleVertexJointToRedProperty ),
        new UITextCheckbox( 'Vertex Forced Line', autoSolveSimpleVertexForcedLineToBlackProperty ),
        new UITextCheckbox( 'Vertex Forced X', autoSolveSimpleVertexAlmostEmptyToRedProperty ),
        new UITextCheckbox( 'Completed Face X', autoSolveSimpleFaceToRedProperty ),
        new UITextCheckbox( 'Completed Face Lines', autoSolveSimpleFaceToBlackProperty ),
        new UITextCheckbox( 'Simple Loop X', autoSolveSimpleLoopToRedProperty ),
        new UITextCheckbox( 'Simple Loop Lines', autoSolveSimpleLoopToBlackProperty ),
        new UITextCheckbox( 'Double Minus One Faces', autoSolveDoubleMinusOneFacesProperty ),
        new UITextCheckbox( 'Face Color X', autoSolveFaceColorToRedProperty ),
        new UITextCheckbox( 'Face Color Lines', autoSolveFaceColorToBlackProperty ),
        new UITextCheckbox( 'Face Color Parity X', autoSolveFaceColorParityToRedProperty ),
        new UITextCheckbox( 'Face Color Parity Lines', autoSolveFaceColorParityToBlackProperty ),
        new UITextCheckbox( 'Face Color Parity Colors', autoSolveFaceColorParityColorsProperty ),
        new UITextCheckbox( 'Face Color Parity Partial Reduction', autoSolveFaceColorParityPartialReductionProperty )
      ]
    } );

    // // TODO: remove this hack, ComboBox and other files...
    // window.phet.chipper = window.phet.chipper || {};
    // window.phet.chipper.queryParameters = window.phet.chipper.queryParameters || {};
    // window.phet.chipper.queryParameters.stringTest = null;
    // window.phet.chipper.isFuzzEnabled = () => false;
    //
    // const themeSelector = new ComboBox( themeProperty, availableThemes.map( theme => {
    //   return {
    //     value: theme,
    //     createNode: () => new Text( theme.name, { font: popupFont } ),
    //     a11yName: theme.name
    //   };
    // } ), topNode, {
    //
    // } );

    const themeNode = getVerticalRadioButtonGroup(
      'Theme',
      themeProperty,
      availableThemes.map( theme => {
        return {
          value: theme,
          createNode: () => new Text( theme.name, {
            font: uiFont,
            fill: uiForegroundColorProperty
          } ),
          a11yName: theme.name
        };
      } )
    );

    const themeEditButtons = new VBox( {
      spacing: 15,
      stretch: true,
      visible: SlitherQueryParameters.debugColors,
      children: availableThemes.filter( theme => theme.isEditable ).map( theme => new UITextPushButton( `Edit ${theme.name} Theme`, {
        listener: () => {
          popupColorEditor( theme );
        }
      } ) )
    } );

    const displayNode = new VBox( {
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text( 'Puzzle Display', {
          font: uiHeaderFont,
          fill: uiForegroundColorProperty
        } ),
        new UITextCheckbox( 'Edge Colors Visible', edgeColorsVisibleProperty ),
        new UITextCheckbox( 'Face Colors Visible', faceColorsVisibleProperty ),
        new UITextCheckbox( 'Sectors Visible', sectorsVisibleProperty ),
        new UITextCheckbox( 'Sectors Next to Edges', sectorsNextToEdgesVisibleProperty, {
          advanced: true
        } ),
        new UITextCheckbox( 'Trivial Sectors', sectorsTrivialVisibleProperty, {
          advanced: true
        } ),
        getVerticalRadioButtonGroup( 'Face Color Threshold', faceColorThresholdProperty, [
          {
            value: 1,
            createNode: () => new UIText( 'Show All' ),
            labelContent: 'Show All'
          },
          {
            value: 2,
            createNode: () => new UIText( '2+' ),
            labelContent: '2+'
          },
          {
            value: 3,
            createNode: () => new UIText( '3+' ),
            labelContent: '3+'
          },
          {
            value: 5,
            createNode: () => new UIText( '5+' ),
            labelContent: '5+'
          },
          {
            value: 10,
            createNode: () => new UIText( '10+' ),
            labelContent: '10+'
          },
          {
            value: Number.POSITIVE_INFINITY,
            createNode: () => new UIText( 'Only Outside' ),
            labelContent: 'Only Outside'
          }
        ] ),
        new UITextCheckbox( 'Possible Line Visible', whiteLineVisibleProperty ),
        new UITextCheckbox( 'Impossible Line Visible', redLineVisibleProperty ),
        new UITextCheckbox( 'Vertices Visible', verticesVisibleProperty ),
        new UITextCheckbox( 'Vertices Small', smallVertexProperty ),
        new UITextCheckbox( 'Red X Visible', redXsVisibleProperty ),
        new UITextCheckbox( 'Red X Aligned', redXsAlignedProperty ),
        new UITextCheckbox( 'Show Layout Test', showLayoutTestProperty, {
          advanced: true
        } ),
        new HBox( {
          spacing: 20,
          visibleProperty: advancedSettingsVisibleProperty,
          children: [
            getVerticalRadioButtonGroup(
              'Line Join',
              joinedLinesJoinProperty,
              lineJoins.map( join => {
                return {
                  value: join,
                  createNode: () => new Text( join, {
                    font: uiFont,
                    fill: uiForegroundColorProperty
                  } ),
                  labelContent: join
                };
              } )
            ),
            getVerticalRadioButtonGroup(
              'Line Cap',
              joinedLinesCapProperty,
              lineCaps.map( cap => {
                return {
                  value: cap,
                  createNode: () => new Text( cap, {
                    font: uiFont,
                    fill: uiForegroundColorProperty
                  } ),
                  labelContent: cap
                };
              } )
            ),
            getVerticalRadioButtonGroup(
              'Vertex Style',
              vertexStyleProperty,
              vertexStyles.map( vertexStyle => {
                return {
                  value: vertexStyle,
                  createNode: () => new Text( vertexStyle, {
                    font: uiFont,
                    fill: uiForegroundColorProperty
                  } ),
                  labelContent: vertexStyle
                };
              } )
            ),
            getVerticalRadioButtonGroup(
              'Impossible Line Style',
              redLineStyleProperty,
              redLineStyles.map( redLineStyle => {
                return {
                  value: redLineStyle,
                  createNode: () => new Text( redLineStyle, {
                    font: uiFont,
                    fill: uiForegroundColorProperty
                  } ),
                  labelContent: redLineStyle
                };
              } )
            ),
            getVerticalRadioButtonGroup(
              'Face Value Style',
              faceValueStyleProperty,
              faceValueStyles.map( faceValueStyle => {
                return {
                  value: faceValueStyle,
                  createNode: () => new Text( faceValueStyle, {
                    font: uiFont,
                    fill: uiForegroundColorProperty
                  } ),
                  labelContent: faceValueStyle
                };
              } )
            )
          ]
        } ),
        new UITextPushButton( 'Reload to Defaults', {
          listener: () => {
            localStorage.clear();

            window.location.reload();
          }
        } )
      ]
    } );

    // TODO: debug?

    super( new VBox( {
      spacing: 20,
      align: 'left',
      children: [
        autoSolveNode,
        new HBox( {
          spacing: 30,
          children: [ themeNode, themeEditButtons ]
        } ),
        displayNode,
        new UITextCheckbox( 'Advanced Settings Visible', advancedSettingsVisibleProperty )
      ]
    } ), glassPane, layoutBoundsProperty );
  }
}
