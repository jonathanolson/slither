import { NumberEdge, NumberFace, NumberVertex } from './FaceTopology.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

export class Isomorphism {

  public readonly isIdentity: boolean;

  public constructor(
    public readonly vertexIndices: NumberVertex[],
    public readonly edgeIndices: NumberEdge[],
    public readonly faceIndices: NumberFace[]
  ) {
    assertEnabled() && assert( vertexIndices.every( index => Number.isInteger( index ) ) );
    assertEnabled() && assert( edgeIndices.every( index => Number.isInteger( index ) ) );
    assertEnabled() && assert( faceIndices.every( index => Number.isInteger( index ) ) );

    let isIdentity = true;
    for ( let i = 0; isIdentity && i < vertexIndices.length; i++ ) {
      if ( vertexIndices[ i ] !== i ) {
        isIdentity = false;
      }
    }
    for ( let i = 0; isIdentity && i < edgeIndices.length; i++ ) {
      if ( edgeIndices[ i ] !== i ) {
        isIdentity = false;
      }
    }
    for ( let i = 0; isIdentity && i < faceIndices.length; i++ ) {
      if ( faceIndices[ i ] !== i ) {
        isIdentity = false;
      }
    }

    this.isIdentity = isIdentity;
  }

  public mapVertex( vertex: NumberVertex ): NumberVertex {
    return this.vertexIndices[ vertex ];
  }

  public mapEdge( edge: NumberEdge ): NumberEdge {
    return this.edgeIndices[ edge ];
  }

  public mapFace( face: NumberFace ): NumberFace {
    return this.faceIndices[ face ];
  }

  public isInvertible(): boolean {
    return (
      Isomorphism.areIndicesInvertible( this.vertexIndices ) &&
      Isomorphism.areIndicesInvertible( this.edgeIndices ) &&
      Isomorphism.areIndicesInvertible( this.faceIndices )
    );
  }

  public inverted(): Isomorphism {
    assertEnabled() && assert( this.isInvertible() );

    return new Isomorphism(
      Isomorphism.invertedIndices( this.vertexIndices ),
      Isomorphism.invertedIndices( this.edgeIndices ),
      Isomorphism.invertedIndices( this.faceIndices )
    );
  }

  public equals( isomorphism: Isomorphism ): boolean {
    return (
      this.vertexIndices.length === isomorphism.vertexIndices.length &&
      this.edgeIndices.length === isomorphism.edgeIndices.length &&
      this.faceIndices.length === isomorphism.faceIndices.length &&
      this.vertexIndices.every( ( index, i ) => index === isomorphism.vertexIndices[ i ] ) &&
      this.edgeIndices.every( ( index, i ) => index === isomorphism.edgeIndices[ i ] ) &&
      this.faceIndices.every( ( index, i ) => index === isomorphism.faceIndices[ i ] )
    );
  }

  public toString(): string {
    return `Isomorphism[V: [${this.vertexIndices.join( ', ' )}], E: [${this.edgeIndices.join( ', ' )}], F: [${this.faceIndices.join( ', ' )}]]`;
  }

  public static areIndicesInvertible( indices: number[] ): boolean {
    const seen: boolean[] = new Array( indices.length ).fill( false );
    for ( let i = 0; i < indices.length; i++ ) {
      const mappedIndex = indices[ i ];

      if ( mappedIndex < 0 || mappedIndex >= indices.length ) {
        return false;
      }

      if ( seen[ mappedIndex ] ) {
        return false;
      }
      seen[ indices[ i ] ] = true;
    }
    return true;
  }

  public static invertedIndices( indices: number[] ): number[] {
    assertEnabled() && assert( Isomorphism.areIndicesInvertible( indices ) );

    const invertedIndices: number[] = new Array( indices.length );
    for ( let i = 0; i < indices.length; i++ ) {
      invertedIndices[ indices[ i ] ] = i;
    }
    return invertedIndices;
  }
}