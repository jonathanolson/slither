import { currentTheme } from './Theme.ts';

import { TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions } from 'phet-lib/phet-core';
import { Color, PaintColorProperty, PaintableNode } from 'phet-lib/scenery';
import { ButtonInteractionState, TButtonAppearanceStrategyOptions } from 'phet-lib/sun';

export class UIStickyToggleButtonAppearanceStrategy {
  public readonly maxLineWidth: number;

  private readonly disposeFlatAppearanceStrategy: () => void;

  public constructor(
    buttonBackground: PaintableNode,
    interactionStateProperty: TReadOnlyProperty<ButtonInteractionState>,
    baseColorProperty: TReadOnlyProperty<Color>,
    providedOptions?: TButtonAppearanceStrategyOptions,
  ) {
    // dynamic colors
    const baseDarkerABit = new PaintColorProperty(baseColorProperty, { luminanceFactor: -0.3 });
    const baseDarkerMore = new PaintColorProperty(baseColorProperty, { luminanceFactor: -0.6 });

    // various fills that are used to alter the button's appearance
    const overFillProperty = baseDarkerABit;
    const idleFillProperty = baseDarkerMore;

    const options = combineOptions<TButtonAppearanceStrategyOptions>(
      {
        stroke: baseDarkerMore,
      },
      providedOptions,
    );

    const lineWidth = 1.5;

    // If the stroke wasn't provided, set a default.
    buttonBackground.stroke = options.stroke || baseDarkerMore;
    buttonBackground.lineWidth = lineWidth;

    this.maxLineWidth = 1.5;

    // Cache colors
    buttonBackground.cachedPaints = [baseColorProperty, overFillProperty, idleFillProperty];

    // Change colors to match interactionState
    function interactionStateListener(interactionState: ButtonInteractionState): void {
      let opacity = 1;
      let lineWidth = 1;

      switch (interactionState) {
        case ButtonInteractionState.IDLE:
          buttonBackground.fill = baseColorProperty;
          buttonBackground.stroke = baseDarkerABit;
          opacity = 0.3;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = baseColorProperty;
          buttonBackground.stroke = baseDarkerABit;
          opacity = 0.5;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = baseColorProperty;
          buttonBackground.stroke = currentTheme.uiButtonSelectedStrokeColorProperty;
          lineWidth = 1.5;
          break;

        default:
          throw new Error(`unsupported interactionState: ${interactionState}`);
      }

      buttonBackground.opacity = opacity;
      buttonBackground.lineWidth = lineWidth;
    }

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
    interactionStateProperty.link(interactionStateListener);

    this.disposeFlatAppearanceStrategy = () => {
      if (interactionStateProperty.hasListener(interactionStateListener)) {
        interactionStateProperty.unlink(interactionStateListener);
      }
      baseDarkerABit.dispose();
      baseDarkerMore.dispose();
    };
  }

  public dispose(): void {
    this.disposeFlatAppearanceStrategy();
  }
}
