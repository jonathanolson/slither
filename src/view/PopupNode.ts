import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { AlignBox, Node, Rectangle } from 'phet-lib/scenery';
import { Panel, PanelOptions } from 'phet-lib/sun';
import { barrierColorProperty, uiBackgroundColorProperty, uiForegroundColorProperty } from './Theme.ts';
import { optionize } from 'phet-lib/phet-core';

export type PopupNodeOptions = {
  allowBarrierClickToHide?: boolean;
  panelOptions?: PanelOptions;
};

export class PopupNode extends Node {
  public constructor(
    public readonly content: Node,
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>,
    providedOptions?: PopupNodeOptions
  ) {

    const options = optionize<PopupNodeOptions>()( {
      allowBarrierClickToHide: true,
      panelOptions: {
        xMargin: 15,
        yMargin: 15,
        fill: uiBackgroundColorProperty,
        stroke: uiForegroundColorProperty
      }
    }, providedOptions );

    super();

    // TODO: pass-through more options

    const barrier = new Rectangle( { fill: barrierColorProperty } );
    this.addChild( barrier );
    layoutBoundsProperty.link( layoutBounds => {
      barrier.rectBounds = layoutBounds;
    } );

    if ( options.allowBarrierClickToHide ) {
      barrier.addInputListener( {
        down: () => {
          this.hide();
        }
      } );
    }

    const panel = new Panel( content, options.panelOptions );

    // TODO: actually, we can probably have a much more responsive layout, right?
    layoutBoundsProperty.link( layoutBounds => {
      panel.maxWidth = layoutBounds.width * 0.9;
      panel.maxHeight = layoutBounds.height * 0.9;
    } );

    this.addChild( new AlignBox( panel, {
      alignBoundsProperty: layoutBoundsProperty,
      yAlign: 'top',
      topMargin: 50
    } ) );
  }

  public show(): void {
    if ( !this.glassPane.hasChild( this ) ) {
      this.reset();
      this.glassPane.addChild( this );
    }
  }

  public hide(): void {
    if ( this.glassPane.hasChild( this ) ) {
      this.glassPane.removeChild( this );
    }
  }

  public reset(): void {

  }
}
