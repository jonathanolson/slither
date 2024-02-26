import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { HBox, Node, Text, VBox } from 'phet-lib/scenery';
import { autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleLoopToBlackProperty, autoSolveSimpleLoopToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexOnlyOptionToBlackProperty } from '../model/solver/autoSolver';
import { availableThemes, joinedLinesCapProperty, joinedLinesJoinProperty, lineCaps, lineJoins, popupFont, popupHeaderFont, redXsVisibleProperty, themeProperty, uiForegroundColorProperty, verticesVisibleProperty, whiteDottedVisibleProperty } from './Theme.ts';
import { PopupNode } from './PopupNode.ts';
import { getSettingsCheckbox } from './getSettingsCheckbox.ts';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';

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
        getSettingsCheckbox( 'Vertex Joint X', autoSolveSimpleVertexJointToRedProperty ),
        getSettingsCheckbox( 'Vertex Forced Line', autoSolveSimpleVertexOnlyOptionToBlackProperty ),
        getSettingsCheckbox( 'Vertex Forced X', autoSolveSimpleVertexAlmostEmptyToRedProperty ),
        getSettingsCheckbox( 'Completed Face X', autoSolveSimpleFaceToRedProperty ),
        getSettingsCheckbox( 'Completed Face Lines', autoSolveSimpleFaceToBlackProperty ),
        getSettingsCheckbox( 'Simple Loop X', autoSolveSimpleLoopToRedProperty ),
        getSettingsCheckbox( 'Simple Loop Lines', autoSolveSimpleLoopToBlackProperty )
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
        getSettingsCheckbox( 'Red X Visible', redXsVisibleProperty ),
        getSettingsCheckbox( 'Undecided Line Visible', whiteDottedVisibleProperty ),
        getSettingsCheckbox( 'Vertices Visible', verticesVisibleProperty ),
        new HBox( {
          spacing: 20,
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
        displayNode
      ]
    } ), glassPane, layoutBoundsProperty );
  }
}
