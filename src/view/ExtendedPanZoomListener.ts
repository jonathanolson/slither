import { AnimatedPanZoomListener, SceneryEvent } from 'phet-lib/scenery';
import { Vector2 } from 'phet-lib/dot';
import assert, { assertEnabled } from '../workarounds/assert.ts';

// TODO: patch into AnimatedPanZoomListener ideally? Create issue
export class ExtendedPanZoomListener extends AnimatedPanZoomListener {
  public override wheel( event: SceneryEvent ): void {

    // cannot reposition if a dragging with middle mouse button - but wheel zoom should not cancel a middle press
    // (behavior copied from other browsers)
    // @ts-expect-error
    if ( !this.middlePress ) {
      const wheel = new Wheel( event, this._targetScale );

      // @ts-expect-error
      this.repositionFromWheel( wheel, event );
    }
  }
}

const scratchTranslationVector = new Vector2( 0, 0 );

/**
 * A type that contains the information needed to respond to a wheel input.
 */
class Wheel {

  // is the ctrl key down during this wheel input? Cannot use KeyStateTracker because the
  // ctrl key might be 'down' on this event without going through the keyboard. For example, with a trackpad
  // the browser sets ctrlKey true with the zoom gesture.
  public readonly isCtrlKeyDown: boolean;

  // magnitude and direction of scale change from the wheel input
  public readonly scaleDelta: number;

  // the target of the wheel input in the global coordinate frame
  public readonly targetPoint: Vector2;

  // the translation vector for the target node in response to the wheel input
  public readonly translationVector: Vector2;

  /**
   * @param event
   * @param targetScale - scale describing the targetNode, see PanZoomListener._targetScale
   */
  public constructor( event: SceneryEvent, targetScale: number ) {
    const domEvent = event.domEvent as WheelEvent;
    assertEnabled() && assert( domEvent instanceof WheelEvent, 'SceneryEvent should have a DOMEvent from the wheel input' );

    this.isCtrlKeyDown = domEvent.ctrlKey;
    this.scaleDelta = domEvent.deltaY > 0 ? -0.5 : 0.5;
    this.targetPoint = event.pointer.point;

    // the DOM Event specifies deltas that look appropriate and works well in different cases like
    // mouse wheel and trackpad input, both which trigger wheel events but at different rates with different
    // delta values - but they are generally too large, reducing a bit feels more natural and gives more control
    let translationX = domEvent.deltaX * 0.5;
    let translationY = domEvent.deltaY * 0.5;

    // FireFox defaults to scrolling in units of "lines" rather than pixels, resulting in slow movement - speed up
    // translation in this case
    if ( domEvent.deltaMode === window.WheelEvent.DOM_DELTA_LINE ) {
      translationX = translationX * 25;
      translationY = translationY * 25;
    }

    if ( domEvent.shiftKey ) {
      // Rotate the translation vector by 90 degrees if shift is held
      [ translationX, translationY ] = [ translationY, -translationX ];
    }

    this.translationVector = scratchTranslationVector.setXY( translationX * targetScale, translationY * targetScale );
  }
}