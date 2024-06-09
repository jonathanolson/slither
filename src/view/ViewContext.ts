import { TinyEmitter, TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { Node } from 'phet-lib/scenery';

export class ViewContext {
  public constructor(
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>,
    public readonly glassPane: Node,
    public readonly stepEmitter: TinyEmitter<[ number ]>,
  ) {}
}