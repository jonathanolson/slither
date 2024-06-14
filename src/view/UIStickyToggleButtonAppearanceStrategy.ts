import { Color, PaintableNode, PaintColorProperty } from 'phet-lib/scenery';
import { TReadOnlyProperty } from 'phet-lib/axon';
import { ButtonInteractionState, TButtonAppearanceStrategyOptions } from 'phet-lib/sun';
import { combineOptions } from 'phet-lib/phet-core';
import { currentTheme } from './Theme.ts';

export class UIStickyToggleButtonAppearanceStrategy {
  public readonly maxLineWidth: number;

  private readonly disposeFlatAppearanceStrategy: () => void;

  /**
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty - interaction state, used to trigger updates
   * @param baseColorProperty - base color from which other colors are derived
   * @param [providedOptions]
   */
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

    this.maxLineWidth = buttonBackground.hasStroke() ? lineWidth : 0;

    // Cache colors
    buttonBackground.cachedPaints = [baseColorProperty, overFillProperty, idleFillProperty];

    // Change colors to match interactionState
    function interactionStateListener(interactionState: ButtonInteractionState): void {
      switch (interactionState) {
        case ButtonInteractionState.IDLE:
          buttonBackground.fill = idleFillProperty;
          buttonBackground.stroke = null;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFillProperty;
          buttonBackground.stroke = null;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = baseColorProperty;
          buttonBackground.stroke = currentTheme.uiButtonSelectedStrokeColorProperty;
          break;

        default:
          throw new Error(`unsupported interactionState: ${interactionState}`);
      }
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
