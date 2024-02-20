import { Property, TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { AlignBox, Font, Node, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { Checkbox, Panel, VerticalAquaRadioButtonGroup } from 'phet-lib/sun';
import { autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleLoopToBlackProperty, autoSolveSimpleLoopToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexOnlyOptionToBlackProperty } from '../model/solver/autoSolver';
import { availableThemes, barrierColorProperty, themeProperty, uiBackgroundProperty, uiForegroundProperty } from './Theme.ts';

// TODO: solidify font stuff (maybe have Font properties based on a theme?)
const font = new Font( {
  family: 'sans-serif',
  size: 16
} );

export class SettingsNode extends Node {
  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>
  ) {
    super();

    const topNode = new Node();

    const barrier = new Rectangle( { fill: barrierColorProperty } );
    this.addChild( barrier );
    layoutBoundsProperty.link( layoutBounds => {
      barrier.rectBounds = layoutBounds;
    } );
    barrier.addInputListener( {
      down: () => {
        this.hide();
      }
    } );

    const getBooleanCheckbox = ( label: string, property: Property<boolean> ) => {
      return new Checkbox( property, new Text( label, {
        font: font,
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
          font: font,
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
    //     createNode: () => new Text( theme.name, { font: font } ),
    //     a11yName: theme.name
    //   };
    // } ), topNode, {
    //
    // } );

    const themeSelector = new VerticalAquaRadioButtonGroup( themeProperty, availableThemes.map( theme => {
      return {
        value: theme,
        createNode: () => new Text( theme.name, {
          font: font,
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
          font: font,
          fill: uiForegroundProperty
        } ),
        themeSelector
      ]
    } );

    // TODO: debug?
    // TODO: theme

    const panel = new Panel( new VBox( {
      spacing: 20,
      align: 'left',
      children: [
        autoSolveNode,
        themeNode
      ]
    } ), {
      xMargin: 15,
      yMargin: 15,
      fill: uiBackgroundProperty,
      stroke: uiForegroundProperty
    } );

    // TODO: actually, we can probably have a much more responsive layout, right?
    layoutBoundsProperty.link( layoutBounds => {
      panel.maxWidth = layoutBounds.width * 0.8;
      panel.maxHeight = layoutBounds.height * 0.8;
    } );

    this.addChild( new AlignBox( panel, {
      alignBoundsProperty: layoutBoundsProperty
    } ) );

    this.addChild( topNode );
  }

  public show(): void {
    if ( !this.glassPane.hasChild( this ) ) {
      this.glassPane.addChild( this );

      // TODO: reset to whatever views here
    }
  }

  public hide(): void {
    if ( this.glassPane.hasChild( this ) ) {
      this.glassPane.removeChild( this );
    }
  }
}
