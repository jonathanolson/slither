import { TEmitter, TReadOnlyProperty } from 'phet-lib/axon';
import { Shape } from 'phet-lib/kite';
import { DragListener, FireListener, Node, SceneryEvent } from 'phet-lib/scenery';

export type ShapeInteractionNodeOptions<T> = {
  delayInteractionEmitter?: TEmitter<[T]>;
  isDragModeProperty?: TReadOnlyProperty<boolean>;
  onDragStart?: (item: T, button: 0 | 2) => void;
  onDrag?: (item: T) => void;
  onDragEnd?: () => void;
};

export class ShapeInteractionNode<T> extends Node {
  public constructor(
    items: T[],
    getShape: (item: T) => Shape,
    listener: (item: T, button: 0 | 1 | 2) => void,
    options?: ShapeInteractionNodeOptions<T>,
  ) {
    super();

    const delayedInteractionItems = new Set<T>();

    // Add a temporary delay to prevent clicks toggling an item after it has been auto-solved (generally)
    if (options?.delayInteractionEmitter) {
      const emitter = options?.delayInteractionEmitter;

      const delayListener = (item: T) => {
        delayedInteractionItems.add(item);
        setTimeout(() => {
          delayedInteractionItems.delete(item);
        }, 700);
      };
      emitter.addListener(delayListener);
      this.disposeEmitter.addListener(() => emitter.removeListener(delayListener));
    }

    // TODO: CAG this, or get the "background" shape from the outside boundary of the board and expand it (for cheap)
    const mainShape = new Shape();

    const itemShapes = items.map((item) => {
      const pointerAreaShape = getShape(item);
      pointerAreaShape.makeImmutable();

      mainShape.subpaths.push(...pointerAreaShape.subpaths);

      return pointerAreaShape;
    });

    this.mouseArea = this.touchArea = mainShape.makeImmutable();

    // TODO: set up listeners in a better way?

    const getItemFromEvent = (event: SceneryEvent): T | null => {
      const point = event.trail.globalToLocalPoint(event.pointer.point);

      for (let i = 0; i < itemShapes.length; i++) {
        const shape = itemShapes[i];

        if (shape.bounds.containsPoint(point) && shape.containsPoint(point)) {
          const item = items[i];

          if (!delayedInteractionItems.has(item)) {
            return item;
          }
        }
      }

      return null;
    };

    const onPress = (event: SceneryEvent, button: 0 | 1 | 2) => {
      const item = getItemFromEvent(event);
      if (item) {
        listener(item, button);
      }
    };

    this.cursor = 'pointer';

    // TODO: config setting for shift-click reversal?
    const primaryFireListener = new FireListener({
      mouseButton: 0,
      // @ts-expect-error
      fire: (event) => onPress(event, event.domEvent?.shiftKey ? 2 : 0),
    });

    const secondaryFireListener = new FireListener({
      mouseButton: 2,
      // @ts-expect-error
      fire: (event) => onPress(event, event.domEvent?.shiftKey ? 0 : 2),
    });

    const tertiaryFireListener = new FireListener({
      mouseButton: 1,
      fire: (event) => onPress(event, 1),
    });

    this.disposeEmitter.addListener(() => {
      primaryFireListener.dispose();
      secondaryFireListener.dispose();
      tertiaryFireListener.dispose();
    });

    if (options?.isDragModeProperty) {
      const isDragModeProperty = options.isDragModeProperty;

      const onStart = (event: SceneryEvent, button: 0 | 2) => {
        const item = getItemFromEvent(event);
        if (item) {
          options.onDragStart?.(item, button);
        }
      };

      const onDrag = (event: SceneryEvent) => {
        const item = getItemFromEvent(event);
        if (item) {
          options.onDrag?.(item);
        }
      };

      const onEnd = () => {
        options.onDragEnd?.();
      };

      const canStartPress = (event: SceneryEvent | null): boolean => {
        if (!event) {
          return false;
        }

        // Don't let the drag listener start if we don't get a valid item
        const item = getItemFromEvent(event);

        return !!item;
      };

      const primaryDragListener = new DragListener({
        mouseButton: 0,
        // @ts-expect-error
        start: (event) => onStart(event, event.domEvent?.shiftKey ? 2 : 0),
        drag: onDrag,
        end: onEnd,
        canStartPress: canStartPress,
      });

      const secondaryDragListener = new DragListener({
        mouseButton: 2,
        // @ts-expect-error
        start: (event) => onStart(event, event.domEvent?.shiftKey ? 0 : 2),
        drag: onDrag,
        end: onEnd,
        canStartPress: canStartPress,
      });

      this.disposeEmitter.addListener(() => {
        primaryDragListener.dispose();
        secondaryDragListener.dispose();
      });

      const dragModeListener = (isDragMode: boolean) => {
        this.inputListeners =
          isDragMode ?
            [primaryDragListener, secondaryDragListener]
          : [primaryFireListener, secondaryFireListener, tertiaryFireListener];
      };
      isDragModeProperty.link(dragModeListener);
      this.disposeEmitter.addListener(() => isDragModeProperty.unlink(dragModeListener));
    } else {
      this.addInputListener(primaryFireListener);
      this.addInputListener(secondaryFireListener);
      this.addInputListener(tertiaryFireListener);
    }
  }
}
