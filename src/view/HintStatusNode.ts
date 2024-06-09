import { HBox, Node } from 'phet-lib/scenery';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { Panel, PanelOptions } from 'phet-lib/sun';
import { currentTheme } from './Theme.ts';
import { ViewContext } from './ViewContext.ts';
import HintState from '../model/puzzle/HintState.ts';
import { SpinningIndicatorNode } from 'phet-lib/scenery-phet';
import { UIText } from './UIText.ts';
import { UITextPushButton } from './UITextPushButton.ts';

export class HintStatusNode extends Node {

  private readonly spinningIndicatorNode: SpinningIndicatorNode;

  public constructor(
    viewContext: ViewContext,
    hintStateProperty: TReadOnlyProperty<HintState>,
    applyHintCallback: () => void,
  ) {
    super( {} );

    this.spinningIndicatorNode = new SpinningIndicatorNode( {
      diameter: 20,
      // TODO: activeColor/inactiveColor, pass in theme Properties (typecast to satisfy overly-specific guards)
    } );

    const panelOptions: PanelOptions = {
      xMargin: 5,
      yMargin: 5,
      fill: currentTheme.uiBackgroundColorProperty,
      stroke: currentTheme.uiForegroundColorProperty,
    };

    const loadingNode = new Panel( new HBox( {
      spacing: 10,
      children: [
        new Node( { children: [ this.spinningIndicatorNode ] } ),
        new UIText( 'Loading Hint Solver...' ),
      ],
    } ), panelOptions );

    const searchingNode = new Panel( new HBox( {
      spacing: 10,
      children: [
        new Node( { children: [ this.spinningIndicatorNode ] } ),
        new UIText( 'Searching for Hint...' ),
      ],
    } ), panelOptions );

    const foundNode = new UITextPushButton( 'Apply Hint', {
      listener: applyHintCallback,
    } );

    const notFoundNode = new Panel( new UIText( 'No Hint Found' ), panelOptions );

    searchingNode.pickable = false;
    notFoundNode.pickable = false;

    const hintStateListener = ( hintState: HintState ) => {
      this.children = [
        ...( hintState === HintState.LOADING ? [ loadingNode ] : [] ),
        ...( hintState === HintState.SEARCHING ? [ searchingNode ] : [] ),
        ...( hintState === HintState.FOUND ? [ foundNode ] : [] ),
        ...( hintState === HintState.NOT_FOUND ? [ notFoundNode ] : [] ),
      ];
    };
    hintStateProperty.link( hintStateListener );
    this.disposeEmitter.addListener( () => hintStateProperty.unlink( hintStateListener ) );
  }

  public step( dt: number ): void {
    this.spinningIndicatorNode.step( dt );
  }
}