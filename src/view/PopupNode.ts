import { currentTheme } from './Theme.ts';
import { ViewContext } from './ViewContext.ts';

import { optionize } from 'phet-lib/phet-core';
import { AlignBox, Node, Rectangle } from 'phet-lib/scenery';
import { Panel, PanelOptions } from 'phet-lib/sun';

export type PopupNodeOptions = {
  allowBarrierClickToHide?: boolean;
  panelOptions?: PanelOptions;
};

export class PopupNode extends Node {
  public constructor(
    public readonly content: Node,
    public readonly viewContext: ViewContext,
    providedOptions?: PopupNodeOptions,
  ) {
    const options = optionize<PopupNodeOptions>()(
      {
        allowBarrierClickToHide: true,
        panelOptions: {
          xMargin: 15,
          yMargin: 15,
          fill: currentTheme.uiBackgroundColorProperty,
          stroke: currentTheme.uiForegroundColorProperty,
        },
      },
      providedOptions,
    );

    super();

    // TODO: pass-through more options

    const barrier = new Rectangle({ fill: currentTheme.barrierColorProperty });
    this.addChild(barrier);
    viewContext.layoutBoundsProperty.link((layoutBounds) => {
      barrier.rectBounds = layoutBounds;
    });

    if (options.allowBarrierClickToHide) {
      barrier.addInputListener({
        down: () => {
          this.hide();
        },
      });
    }

    const panel = new Panel(content, options.panelOptions);

    // TODO: actually, we can probably have a much more responsive layout, right?
    viewContext.layoutBoundsProperty.link((layoutBounds) => {
      panel.maxWidth = layoutBounds.width * 0.9;
      panel.maxHeight = layoutBounds.height * 0.9;
    });

    this.addChild(
      new AlignBox(panel, {
        alignBoundsProperty: viewContext.layoutBoundsProperty,
        yAlign: 'top',
        topMargin: 50,
      }),
    );
  }

  public show(): void {
    if (!this.viewContext.glassPane.hasChild(this)) {
      this.reset();
      this.viewContext.glassPane.addChild(this);
    }
  }

  public hide(): void {
    if (this.viewContext.glassPane.hasChild(this)) {
      this.viewContext.glassPane.removeChild(this);
    }
  }

  public reset(): void {}
}
