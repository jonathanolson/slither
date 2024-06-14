import { HBox, Node } from 'phet-lib/scenery';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Panel, PanelOptions } from 'phet-lib/sun';
import { currentTheme } from './Theme.ts';
import { ViewContext } from './ViewContext.ts';
import HintState from '../model/puzzle/HintState.ts';
import { SpinningIndicatorNode } from 'phet-lib/scenery-phet';
import { UIText } from './UIText.ts';
import { UITextPushButton } from './UITextPushButton.ts';

const activeColor = currentTheme.uiForegroundColorProperty;
const inactiveColor = new DerivedProperty([currentTheme.uiForegroundColorProperty], (color) => color.withAlpha(0.15));

export class HintStateNode extends Node {
  public constructor(
    viewContext: ViewContext,
    hintStateProperty: TReadOnlyProperty<HintState>,
    applyHintCallback: () => void,
    clearHintCallback: () => void,
  ) {
    super({});

    const spinningIndicatorNode = new SpinningIndicatorNode({
      diameter: 20,
      activeColor: activeColor as any,
      inactiveColor: inactiveColor as any,
    });
    this.disposeEmitter.addListener(() => spinningIndicatorNode.dispose());

    const panelOptions: PanelOptions = {
      xMargin: 5,
      yMargin: 5,
      fill: currentTheme.uiBackgroundColorProperty,
      stroke: currentTheme.uiForegroundColorProperty,
    };

    const loadingNode = new Panel(
      new HBox({
        spacing: 10,
        children: [new Node({ children: [spinningIndicatorNode] }), new UIText('Loading Hint Solver...')],
      }),
      panelOptions,
    );

    const searchingNode = new HBox({
      spacing: 10,
      children: [
        new Panel(
          new HBox({
            spacing: 10,
            children: [new Node({ children: [spinningIndicatorNode] }), new UIText('Searching for Hint...')],
          }),
          panelOptions,
        ),
        new UITextPushButton('Cancel', {
          listener: clearHintCallback,
        }),
      ],
    });

    const foundNode = new HBox({
      spacing: 10,
      children: [
        new UITextPushButton('Apply Hint', {
          listener: applyHintCallback,
        }),
        new UITextPushButton('Hide Hint', {
          listener: clearHintCallback,
        }),
      ],
    });

    const notFoundNode = new Panel(new UIText('No Hint Found'), panelOptions);

    notFoundNode.pickable = false;

    const hintStateListener = (hintState: HintState) => {
      this.children = [
        ...(hintState === HintState.LOADING ? [loadingNode] : []),
        ...(hintState === HintState.SEARCHING ? [searchingNode] : []),
        ...(hintState === HintState.FOUND ? [foundNode] : []),
        ...(hintState === HintState.NOT_FOUND ? [notFoundNode] : []),
      ];
    };
    hintStateProperty.link(hintStateListener);
    this.disposeEmitter.addListener(() => hintStateProperty.unlink(hintStateListener));

    const stepListener = (dt: number) => {
      spinningIndicatorNode.step(dt);
    };
    viewContext.stepEmitter.addListener(stepListener);
    this.disposeEmitter.addListener(() => viewContext.stepEmitter.removeListener(stepListener));
  }
}
