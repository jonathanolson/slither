import { TEdge } from '../structure.ts';

import { Net } from './Net.ts';

// Like a net, but:
// "The final opposite part of the loop goes through none of the edge set"
export class Region extends Net {
  public getComplement( allNonRedEdges: Set<TEdge> ): Region {
    // TODO: use Set.prototype.difference soon
    const complementEdges = new Set<TEdge>();
    allNonRedEdges.forEach( edge => {
      if ( !this.edges.has( edge ) ) {
        complementEdges.add( edge );
      }
    } );
    return new Region( this.b, this.a, complementEdges );
  }
}