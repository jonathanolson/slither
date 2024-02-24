import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { Node, Text, VBox } from 'phet-lib/scenery';
import { VerticalAquaRadioButtonGroup } from 'phet-lib/sun';
import { autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleLoopToBlackProperty, autoSolveSimpleLoopToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexOnlyOptionToBlackProperty } from '../model/solver/autoSolver';
import { availableThemes, popupFont, themeProperty, uiForegroundProperty } from './Theme.ts';
import { PopupNode } from './PopupNode.ts';
import { getSettingsCheckbox } from './getSettingsCheckbox.ts';

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
          font: popupFont,
          fill: uiForegroundProperty
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

    const themeSelector = new VerticalAquaRadioButtonGroup( themeProperty, availableThemes.map( theme => {
      return {
        value: theme,
        createNode: () => new Text( theme.name, {
          font: popupFont,
          fill: uiForegroundProperty
        } ),
        a11yName: theme.name
      };
    } ) );

    const themeNode = new VBox( {
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text( 'Theme', {
          font: popupFont,
          fill: uiForegroundProperty
        } ),
        themeSelector
      ]
    } );

    // TODO: debug?

    super( new VBox( {
      spacing: 20,
      align: 'left',
      children: [
        autoSolveNode,
        themeNode
      ]
    } ), glassPane, layoutBoundsProperty );
  }
}
