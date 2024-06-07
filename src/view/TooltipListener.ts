import { stepTimer, TimerListener, TReadOnlyProperty } from 'phet-lib/axon';
import { Node, Pointer, SceneryEvent, Text, TInputListener } from 'phet-lib/scenery';
import { Bounds2 } from 'phet-lib/dot';
import { Panel } from 'phet-lib/sun';
import { tooltipFont } from './Theme.ts';

export class TooltipListener implements TInputListener {

  private timerListener: TimerListener | null = null;
  private tooltipNode: Node | null = null;

  public constructor(
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>,
    public readonly glassPane: Node,
    public readonly tooltipTextOverride?: string,
  ) {

  }

  public showTooltip( label: string, targetNode: Node, pointer: Pointer ): void {
    if ( !this.tooltipNode ) {
      // TODO: THEME!!!
      this.tooltipNode = new Panel( new Text( label, {
        font: tooltipFont,
      } ), {
        cornerRadius: 1,
        xMargin: 2,
        yMargin: 2,
      } );

      const point = this.glassPane.globalToLocalPoint( pointer.point );

      this.tooltipNode.leftTop = point.plusXY( 0, 15 );
      if ( this.tooltipNode.bottom > this.layoutBoundsProperty.value.bottom ) {
        this.tooltipNode.bottom = point.y - 2;
      }
      if ( this.tooltipNode.left < this.layoutBoundsProperty.value.left ) {
        this.tooltipNode.left = this.layoutBoundsProperty.value.left + 2;
      }
      if ( this.tooltipNode.right > this.layoutBoundsProperty.value.right ) {
        this.tooltipNode.right = this.layoutBoundsProperty.value.right - 2;
      }

      this.glassPane.addChild( this.tooltipNode );
    }
  }

  public hideTooltip(): void {
    if ( this.tooltipNode ) {
      this.tooltipNode.dispose();
      this.tooltipNode = null;
    }
  }

  private clearListener(): void {
    if ( this.timerListener ) {
      stepTimer.clearTimeout( this.timerListener );
      this.timerListener = null;
    }
  }

  public enter( event: SceneryEvent<MouseEvent | TouchEvent | PointerEvent> ): void {
    const node = event.currentTarget;

    const label = this.tooltipTextOverride ?? node?.labelContent ?? node?.accessibleName;

    const pointer = event.pointer;

    if ( node && label && this.timerListener === null ) {
      this.timerListener = stepTimer.setTimeout( () => {

        this.showTooltip( label!, node, pointer );
      }, 200 );
    }
  }

  public exit( event: SceneryEvent<MouseEvent | TouchEvent | PointerEvent> ): void {
    this.clearListener();
    this.hideTooltip();
  }

  public dispose(): void {
    this.clearListener();
    this.hideTooltip();
  }
}