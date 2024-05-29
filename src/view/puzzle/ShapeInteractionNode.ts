import { FireListener, Node, SceneryEvent } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';

export class ShapeInteractionNode<T> extends Node {

  public constructor(
    items: T[],
    getShape: ( item: T ) => Shape,
    listener: ( item: T, button: 0 | 1 | 2 ) => void,
  ) {
    super();

    // TODO: CAG this, or get the "background" shape from the outside boundary of the board and expand it (for cheap)
    const mainShape = new Shape();

    const itemShapes = items.map( item => {
      const pointerAreaShape = getShape( item );
      pointerAreaShape.makeImmutable();

      mainShape.subpaths.push( ...pointerAreaShape.subpaths );

      return pointerAreaShape;
    } );

    this.mouseArea = this.touchArea = mainShape.makeImmutable();

    // TODO: set up listeners in a better way?

    const getItemFromEvent = ( event: SceneryEvent ): T | null => {
      const point = event.trail.globalToLocalPoint( event.pointer.point );

      for ( let i = 0; i < itemShapes.length; i++ ) {
        const shape = itemShapes[ i ];

        if ( shape.bounds.containsPoint( point ) && shape.containsPoint( point ) ) {
          return items[ i ];
        }
      }

      return null;
    };

    const onPress = ( event: SceneryEvent, button: 0 | 1 | 2 ) => {
      const item = getItemFromEvent( event );
      if ( item ) {
        listener( item, button );
      }
    };

    // TODO: config setting for shift-click reversal?
    const primaryFireListener = new FireListener( {
      mouseButton: 0,
      // @ts-expect-error
      fire: event => onPress( event, event.domEvent?.shiftKey ? 2 : 0 )
    } );

    const secondaryFireListener = new FireListener( {
      mouseButton: 2,
      // @ts-expect-error
      fire: event => onPress( event, event.domEvent?.shiftKey ? 0 : 2 )
    } );

    const tertiaryFireListener = new FireListener( {
      mouseButton: 1,
      fire: event => onPress( event, 1 )
    } );

    this.addInputListener( primaryFireListener );
    this.addInputListener( secondaryFireListener );
    this.addInputListener( tertiaryFireListener );
    this.cursor = 'pointer';

    this.disposeEmitter.addListener( () => {
      primaryFireListener.dispose();
      secondaryFireListener.dispose();
      tertiaryFireListener.dispose();
    } );
  }
}