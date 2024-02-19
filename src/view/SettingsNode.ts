import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { AlignBox, Node, Rectangle } from 'phet-lib/scenery';
import { Panel } from 'phet-lib/sun';

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

    // TODO: autosolve
    // TODO: debug?
    // TODO: theme

    const panel = new Panel( new Rectangle( 0, 0, 500, 400, { fill: 'red' } ), {
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
