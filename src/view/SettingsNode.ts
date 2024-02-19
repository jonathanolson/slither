import { Property, TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { AlignBox, Font, Node, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { Checkbox, Panel } from 'phet-lib/sun';
import { autoSolveSimpleFaceToBlackProperty, autoSolveSimpleFaceToRedProperty, autoSolveSimpleVertexAlmostEmptyToRedProperty, autoSolveSimpleVertexJointToRedProperty, autoSolveSimpleVertexOnlyOptionToBlackProperty } from '../model/solver/autoSolver';

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

    // TODO: customize this color
    const barrier = new Rectangle( { fill: 'rgba(127,127,127,0.7)' } );
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
      return new Checkbox( property, new Text( label, { font: font } ), {

      } );
    };

    const autoSolveNode = new VBox( {
      stretch: true,
      align: 'left',
      spacing: 8,
      children: [
        new Text( 'Solve After Every Move', { font: font } ),
        getBooleanCheckbox( 'Vertex Joint X', autoSolveSimpleVertexJointToRedProperty ),
        getBooleanCheckbox( 'Vertex Forced Line', autoSolveSimpleVertexOnlyOptionToBlackProperty ),
        getBooleanCheckbox( 'Vertex Forced X', autoSolveSimpleVertexAlmostEmptyToRedProperty ),
        getBooleanCheckbox( 'Completed Face X', autoSolveSimpleFaceToRedProperty ),
        getBooleanCheckbox( 'Completed Face Lines', autoSolveSimpleFaceToBlackProperty )
      ]
    } );

    // TODO: debug?
    // TODO: theme

    const panel = new Panel( autoSolveNode, {
      xMargin: 15,
      yMargin: 15
    } );

    // TODO: actually, we can probably have a much more responsive layout, right?
    layoutBoundsProperty.link( layoutBounds => {
      panel.maxWidth = layoutBounds.width * 0.8;
      panel.maxHeight = layoutBounds.height * 0.8;
    } );

    this.addChild( new AlignBox( panel, {
      alignBoundsProperty: layoutBoundsProperty
    } ) );
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
