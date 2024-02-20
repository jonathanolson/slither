import { Property, TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { Node, Text, VBox } from 'phet-lib/scenery';
import { Checkbox, VerticalAquaRadioButtonGroup } from 'phet-lib/sun';
import { autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleLoopToBlackProperty, autoSolveSimpleLoopToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexOnlyOptionToBlackProperty } from '../model/solver/autoSolver';
import { availableThemes, popupFont, themeProperty, uiBackgroundProperty, uiForegroundProperty } from './Theme.ts';
import { PopupNode } from './PopupNode.ts';

export class SettingsNode extends PopupNode {
  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>
  ) {

    const getBooleanCheckbox = ( label: string, property: Property<boolean> ) => {
      return new Checkbox( property, new Text( label, {
        font: popupFont,
        fill: uiForegroundProperty
      } ), {
        checkboxColor: uiForegroundProperty,
        checkboxColorBackground: uiBackgroundProperty
      } );
    };

    const autoSolveNode = new VBox( {
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text( 'Solve After Every Move', {
          font: popupFont,
          fill: uiForegroundProperty
        } ),
        getBooleanCheckbox( 'Vertex Joint X', autoSolveSimpleVertexJointToRedProperty ),
        getBooleanCheckbox( 'Vertex Forced Line', autoSolveSimpleVertexOnlyOptionToBlackProperty ),
        getBooleanCheckbox( 'Vertex Forced X', autoSolveSimpleVertexAlmostEmptyToRedProperty ),
        getBooleanCheckbox( 'Completed Face X', autoSolveSimpleFaceToRedProperty ),
        getBooleanCheckbox( 'Completed Face Lines', autoSolveSimpleFaceToBlackProperty ),
        getBooleanCheckbox( 'Simple Loop X', autoSolveSimpleLoopToRedProperty ),
        getBooleanCheckbox( 'Simple Loop Lines', autoSolveSimpleLoopToBlackProperty )
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
