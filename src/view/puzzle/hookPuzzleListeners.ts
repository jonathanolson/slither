import { FireListener, Node } from 'phet-lib/scenery';

export const hookPuzzleListeners = <T>(
  obj: T,
  node: Node,
  pressListener?: ( obj: T, button: 0 | 1 | 2 ) => void,
): void => {
    // TODO: config setting for shift-click reversal?
  const primaryFireListener = new FireListener( {
    mouseButton: 0,
    // @ts-expect-error
    fire: event => pressListener && pressListener( obj, event.domEvent?.shiftKey ? 2 : 0 )
  } );

  const secondaryFireListener = new FireListener( {
    mouseButton: 2,
    // @ts-expect-error
    fire: event => pressListener && pressListener( obj, event.domEvent?.shiftKey ? 0 : 2 )
  } );

  const tertiaryFireListener = new FireListener( {
    mouseButton: 1,
    fire: event => pressListener && pressListener( obj, 1 )
  } );

  node.addInputListener( primaryFireListener );
  node.addInputListener( secondaryFireListener );
  node.addInputListener( tertiaryFireListener );
  node.cursor = 'pointer';

  node.disposeEmitter.addListener( () => {
    primaryFireListener.dispose();
    secondaryFireListener.dispose();
    tertiaryFireListener.dispose();
  } );
};