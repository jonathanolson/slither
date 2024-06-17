import { tooltipFont } from './Theme.ts';
import { ViewContext } from './ViewContext.ts';

import { TimerListener, stepTimer } from 'phet-lib/axon';
import { Node, Pointer, SceneryEvent, TInputListener, Text } from 'phet-lib/scenery';
import { Panel } from 'phet-lib/sun';

export class TooltipListener implements TInputListener {
  private timerListener: TimerListener | null = null;
  private tooltipNode: Node | null = null;

  public constructor(
    public readonly viewContext: ViewContext,
    public readonly tooltipTextOverride?: string,
  ) {}

  public showTooltip(label: string, targetNode: Node, pointer: Pointer): void {
    if (!this.tooltipNode) {
      // TODO: THEME!!!
      this.tooltipNode = new Panel(
        new Text(label, {
          font: tooltipFont,
        }),
        {
          cornerRadius: 1,
          xMargin: 2,
          yMargin: 2,
        },
      );

      const point = this.viewContext.glassPane.globalToLocalPoint(pointer.point);

      this.tooltipNode.leftTop = point.plusXY(0, this.viewContext.glassPane.getUniqueTransform().transformDeltaY(20));
      if (this.tooltipNode.bottom > this.viewContext.layoutBoundsProperty.value.bottom) {
        this.tooltipNode.bottom = point.y - 2;
      }
      if (this.tooltipNode.left < this.viewContext.layoutBoundsProperty.value.left) {
        this.tooltipNode.left = this.viewContext.layoutBoundsProperty.value.left + 2;
      }
      if (this.tooltipNode.right > this.viewContext.layoutBoundsProperty.value.right) {
        this.tooltipNode.right = this.viewContext.layoutBoundsProperty.value.right - 2;
      }

      this.viewContext.glassPane.addChild(this.tooltipNode);
    }
  }

  public hideTooltip(): void {
    if (this.tooltipNode) {
      this.tooltipNode.dispose();
      this.tooltipNode = null;
    }
  }

  private clearListener(): void {
    if (this.timerListener) {
      stepTimer.clearTimeout(this.timerListener);
      this.timerListener = null;
    }
  }

  public enter(event: SceneryEvent<MouseEvent | TouchEvent | PointerEvent>): void {
    const node = event.currentTarget;

    const pointer = event.pointer;

    if (node && this.timerListener === null) {
      // Listen to something that changes when our accessibleName changes (or anything else) so we can update the tooltip on changes
      const updateTooltip = () => {
        const label = this.tooltipTextOverride ?? node?.labelContent ?? node?.accessibleName;

        if (label) {
          this.showTooltip(label!, node, pointer);

          let tooltipNode = this.tooltipNode!;

          const labelUpdateListener = () => {
            if (this.tooltipNode === tooltipNode) {
              this.hideTooltip();
              updateTooltip();
            }
          };
          node.rendererSummaryRefreshEmitter.addListener(labelUpdateListener);
          tooltipNode.disposeEmitter.addListener(() => {
            node.rendererSummaryRefreshEmitter.removeListener(labelUpdateListener);
          });
        }
      };

      this.timerListener = stepTimer.setTimeout(() => {
        updateTooltip();
      }, 200);
    }
  }

  public exit(event: SceneryEvent<MouseEvent | TouchEvent | PointerEvent>): void {
    this.clearListener();
    this.hideTooltip();
  }

  public dispose(): void {
    this.clearListener();
    this.hideTooltip();
  }
}
