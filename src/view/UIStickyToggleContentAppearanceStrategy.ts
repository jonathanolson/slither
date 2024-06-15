import { TReadOnlyProperty } from 'phet-lib/axon';
import { Node } from 'phet-lib/scenery';
import { ButtonInteractionState, TContentAppearanceStrategyOptions } from 'phet-lib/sun';

export class UIStickyToggleContentAppearanceStrategy {
  public readonly dispose: () => void;

  public constructor(
    content: Node,
    interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
    options?: TContentAppearanceStrategyOptions,
  ) {
    function interactionStateListener(interactionState: ButtonInteractionState): void {
      let opacity = 1;

      switch (interactionState) {
        case ButtonInteractionState.IDLE:
          opacity = 0.6;
          break;

        case ButtonInteractionState.OVER:
          break;

        case ButtonInteractionState.PRESSED:
          break;

        default:
          throw new Error(`unsupported interactionState: ${interactionState}`);
      }

      content.opacity = opacity;
    }

    interactionStateProperty.link(interactionStateListener);

    this.dispose = () => {
      if (interactionStateProperty.hasListener(interactionStateListener)) {
        interactionStateProperty.unlink(interactionStateListener);
      }
    };
  }
}
