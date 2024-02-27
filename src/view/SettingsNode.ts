import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { HBox, Node, Text, VBox } from 'phet-lib/scenery';
import { autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleLoopToBlackProperty, autoSolveSimpleLoopToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexOnlyOptionToBlackProperty } from '../model/solver/autoSolver';
import { availableThemes, joinedLinesCapProperty, joinedLinesJoinProperty, lineCaps, lineJoins, popupFont, popupHeaderFont, redLineVisibleProperty, redXsAlignedProperty, redXsVisibleProperty, themeProperty, uiForegroundColorProperty, vertexStyleProperty, vertexStyles, verticesVisibleProperty, whiteLineVisibleProperty } from './Theme.ts';
import { PopupNode } from './PopupNode.ts';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';
import { LocalStorageBooleanProperty } from '../util/localStorage.ts';

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
          font: popupHeaderFont,
          fill: uiForegroundColorProperty
        } ),
        new UITextCheckbox( 'Vertex Joint X', autoSolveSimpleVertexJointToRedProperty ),
        new UITextCheckbox( 'Vertex Forced Line', autoSolveSimpleVertexOnlyOptionToBlackProperty ),
        new UITextCheckbox( 'Vertex Forced X', autoSolveSimpleVertexAlmostEmptyToRedProperty ),
        new UITextCheckbox( 'Completed Face X', autoSolveSimpleFaceToRedProperty ),
        new UITextCheckbox( 'Completed Face Lines', autoSolveSimpleFaceToBlackProperty ),
        new UITextCheckbox( 'Simple Loop X', autoSolveSimpleLoopToRedProperty ),
        new UITextCheckbox( 'Simple Loop Lines', autoSolveSimpleLoopToBlackProperty )
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
            font: popupFont,
            fill: uiForegroundColorProperty
          } ),
          a11yName: theme.name
        };
      } )
    );

    const displayNode = new VBox( {
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text( 'Puzzle Display', {
          font: popupHeaderFont,
          fill: uiForegroundColorProperty
        } ),
        new UITextCheckbox( 'Possible Line Visible', whiteLineVisibleProperty ),
        new UITextCheckbox( 'Impossible Line Visible', redLineVisibleProperty ),
        new UITextCheckbox( 'Vertices Visible', verticesVisibleProperty ),
        new UITextCheckbox( 'Red X Visible', redXsVisibleProperty ),
        new UITextCheckbox( 'Red X Aligned', redXsAlignedProperty ),
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
                    font: popupFont,
                    fill: uiForegroundColorProperty
                  } ),
                  a11yName: join
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
                    font: popupFont,
                    fill: uiForegroundColorProperty
                  } ),
                  a11yName: cap
                };
              } )
            ),
            getVerticalRadioButtonGroup(
              'Vertex style',
              vertexStyleProperty,
              vertexStyles.map( vertexStyle => {
                return {
                  value: vertexStyle,
                  createNode: () => new Text( vertexStyle, {
                    font: popupFont,
                    fill: uiForegroundColorProperty
                  } ),
                  a11yName: vertexStyle
                };
              } )
            )
          ]
        } )
      ]
    } );

    // TODO: debug?

    super( new VBox( {
      spacing: 20,
      align: 'left',
      children: [
        autoSolveNode,
        themeNode,
        displayNode,
        new UITextCheckbox( 'Advanced Settings Visible', advancedSettingsVisibleProperty )
      ]
    } ), glassPane, layoutBoundsProperty );
  }
}
