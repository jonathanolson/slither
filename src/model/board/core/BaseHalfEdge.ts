import { TStructure } from './TStructure.ts';
import { THalfEdge } from './THalfEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class BaseHalfEdge<Structure extends TStructure> implements THalfEdge {

  public edge!: Structure[ 'Edge' ];

  public reversed!: Structure[ 'HalfEdge' ];

  public next!: Structure[ 'HalfEdge' ];
  public previous!: Structure[ 'HalfEdge' ];

  // The face to the "left" of the directed half-edge
  public face: Structure[ 'Face' ] | null = null;

  public constructor(
    public readonly start: Structure[ 'Vertex' ],
    public readonly end: Structure[ 'Vertex' ],
    public readonly isReversed: boolean
  ) {
    assertEnabled() && assert( start );
    assertEnabled() && assert( end );
  }
}