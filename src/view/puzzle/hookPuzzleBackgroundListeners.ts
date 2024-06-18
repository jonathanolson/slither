import PanDragMode, { panDragModeProperty } from '../PanDragMode.ts';

import { FireListener, Node, PressListenerEvent } from 'phet-lib/scenery';

export const hookPuzzleBackgroundListeners = (
  node: Node,
  facePressListener?: (button: 0 | 1 | 2) => void,
  faceBackgroundDragStartListener?: (event: PressListenerEvent) => void,
): void => {
  // TODO: config setting for shift-click reversal?
  const primaryFireListener = new FireListener({
    mouseButton: 0,
    // @ts-expect-error
    fire: (event) => facePressListener && facePressListener(event.domEvent?.shiftKey ? 2 : 0),
  });

  const secondaryFireListener = new FireListener({
    mouseButton: 2,
    // @ts-expect-error
    fire: (event) => facePressListener && facePressListener(event.domEvent?.shiftKey ? 0 : 2),
  });

  const tertiaryFireListener = new FireListener({
    mouseButton: 1,
    fire: (event) => facePressListener && facePressListener(1),
  });

  node.addInputListener({
    down: (event) => {
      if (panDragModeProperty.value === PanDragMode.DRAG_ONLY) {
        faceBackgroundDragStartListener && faceBackgroundDragStartListener(event);
      }
    },
  });

  node.addInputListener(primaryFireListener);
  node.addInputListener(secondaryFireListener);
  node.addInputListener(tertiaryFireListener);
  node.cursor = 'pointer';

  node.disposeEmitter.addListener(() => {
    primaryFireListener.dispose();
    secondaryFireListener.dispose();
    tertiaryFireListener.dispose();
  });
};
