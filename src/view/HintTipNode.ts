import { Node } from 'phet-lib/scenery';
import { TReadOnlyProperty } from 'phet-lib/axon';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { Panel } from 'phet-lib/sun';
import { AnnotationNode } from './AnnotationNode.ts';
import { currentTheme } from './Theme.ts';

export class HintTipNode extends Node {
  public constructor(
    public readonly displayedAnnotationProperty: TReadOnlyProperty<TAnnotation | null>
  ) {
    super( {
      pickable: false,
      opacity: 0.7
    } );

    displayedAnnotationProperty.link( annotation => {
      this.children = [];

      if ( annotation ) {
        this.addChild( new Panel( AnnotationNode.getHintNode( annotation ), {
          xMargin: 5,
          yMargin: 5,
          fill: currentTheme.uiBackgroundColorProperty,
          stroke: currentTheme.uiForegroundColorProperty
        } ) );
      }
    } );
  }
}