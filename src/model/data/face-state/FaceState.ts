import { TFace } from '../../board/core/TFace.ts';
import _ from '../../../workarounds/_.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { packBooleanArray, unpackBooleanArray } from '../../../util/booleanPacking.ts';
import FaceValue from '../face-value/FaceValue.ts';
import { getBinaryIndex, getBinaryQuantity, getCombinationIndex, getCombinationQuantity } from '../../../util/booleanIndexing.ts';

export class FaceState {

  public readonly order: number;
  public readonly possibilityCount: number;

  private readonly matrix: boolean[]; // TODO: bitpacking?

  public constructor(
    public readonly face: TFace,
    public readonly faceValue: FaceValue,
    matrix?: boolean[],
    possibilityCount?: number
  ) {
    this.order = face.edges.length;

    if ( matrix ) {
      this.matrix = matrix;
    }
    else {
      this.matrix = _.range( 0, FaceState.getMatrixSize( this.order, this.faceValue ) ).map( () => true );
    }

    if ( possibilityCount !== undefined ) {
      this.possibilityCount = possibilityCount;
    }
    else {
      this.possibilityCount = this.matrix.filter( x => x ).length;
    }

    assertEnabled() && assert( this.matrix.length === FaceState.getMatrixSize( this.order, this.faceValue ) );
    assertEnabled() && assert( this.possibilityCount === this.matrix.filter( x => x ).length );
  }

  public isAny(): boolean {
    return this.possibilityCount === FaceState.getMatrixSize( this.order, this.faceValue );
  }

  public isForced(): boolean {
    return this.possibilityCount === 1;
  }

  public allowsEmpty(): boolean {
    return this.allowsBlackEdges( [] );
  }

  public allowsBlackEdges( blackEdges: TEdge[] ): boolean {
    return this.matrix[ this.getBlackEdgesIndex( blackEdges ) ];
  }

  public getAllowedCombinations(): TEdge[][] {
    // TODO:
    throw new Error( 'unimplemented' );
  }

  public getBlackEdgesIndex( blackEdges: TEdge[] ): number {
    const indices = blackEdges.map( edge => this.face.edges.indexOf( edge ) );
    assertEnabled() && assert( indices.every( index => index >= 0 ) );

    return this.faceValue === null ? getBinaryIndex( indices, this.order ) : getCombinationIndex( indices, this.order );
  }

  public equals( other: FaceState ): boolean {
    return this.face === other.face && this.matrix.every( ( x, i ) => x === other.matrix[ i ] );
  }

  public and( other: FaceState ): FaceState {
    assertEnabled() && assert( this.face === other.face );

    return new FaceState( this.face, this.faceValue, this.matrix.map( ( x, i ) => x && other.matrix[ i ] ) );
  }

  public or( other: FaceState ): FaceState {
    assertEnabled() && assert( this.face === other.face );

    return new FaceState( this.face, this.faceValue, this.matrix.map( ( x, i ) => x || other.matrix[ i ] ) );
  }

  public isSubsetOf( other: FaceState ): boolean {
    return this.matrix.every( ( x, i ) => !x || other.matrix[ i ] );
  }

  public withBlackEdges( blackEdges: TEdge[], included: boolean ): FaceState {
    const index = this.getBlackEdgesIndex( blackEdges );

    // TODO: should we copy it and then modify?
    return new FaceState( this.face, this.faceValue, this.matrix.slice( 0, index ).concat( included, this.matrix.slice( index + 1 ) ) );
  }

  public serialize(): TSerializedFaceState {
    const result: TSerializedFaceState = {
      faceValue: this.faceValue,
      matrix: packBooleanArray( this.matrix )
    };

    assertEnabled() && assert( this.equals( FaceState.deserialize( this.face, result ) ) );

    return result;
  }

  public static getMatrixSize( order: number, faceValue: FaceValue ): number {
    if ( faceValue === null ) {
      return getBinaryQuantity( order );
    }
    else {
      return getCombinationQuantity( order, faceValue );
    }
  }

  // NOTE: don't mutate the callback result, ALSO model other faster patterns on this
  public static forEachIndexCombination( order: number, faceValue: FaceValue, callback: ( indices: number[] ) => void ): void {
    let stack: number[] = [];

    const recur = () => {
      if ( faceValue !== null ) {
        if ( stack.length === faceValue ) {
          callback( stack );
          return;
        }
      }
      else {
        callback( stack );
      }

      const start = stack.length > 0 ? stack[ stack.length - 1 ] + 1 : 0;
      for ( let i = start; i < order; i++ ) {
        stack.push( i );
        recur();
        stack.pop();
      }
    };
    recur();
  }

  public static forEachEdgeCombination( edges: TEdge[], faceValue: FaceValue, callback: ( indices: number[], edges: TEdge[] ) => void ): void {
    let indexStack: number[] = [];
    let valueStack: TEdge[] = [];

    const recur = () => {
      if ( faceValue !== null ) {
        if ( indexStack.length === faceValue ) {
          callback( indexStack, valueStack );
          return;
        }
      }
      else {
        callback( indexStack, valueStack );
      }

      const start = indexStack.length > 0 ? indexStack[ indexStack.length - 1 ] + 1 : 0;
      for ( let i = start; i < edges.length; i++ ) {
        indexStack.push( i );
        valueStack.push( edges[ i ] );
        recur();
        indexStack.pop();
        valueStack.pop();
      }
    };
    recur();
  }

  public static fromLookup( face: TFace, faceValue: FaceValue, lookup: ( blackEdges: TEdge[] ) => boolean ): FaceState {
    const order = face.edges.length;
    const matrix: boolean[] = new Array( FaceState.getMatrixSize( order, faceValue ) ).fill( false );

    FaceState.forEachEdgeCombination( face.edges, faceValue, ( indices, edges ) => {
      const value = lookup( edges );

      if ( value ) {
        const index = faceValue === null ? getBinaryIndex( indices, order ) : getCombinationIndex( indices, order );
        matrix[ index ] = true;
      }
    } );

    return new FaceState( face, faceValue, matrix );
  }

  public static none( face: TFace, faceValue: FaceValue ): FaceState {
    const size = FaceState.getMatrixSize( face.edges.length, faceValue );
    const matrix = new Array( size ).fill( false );
    return new FaceState( face, faceValue, matrix, 0 );
  }

  public static any( face: TFace, faceValue: FaceValue ): FaceState {
    const size = FaceState.getMatrixSize( face.edges.length, faceValue );
    const matrix = new Array( size ).fill( true );
    return new FaceState( face, faceValue, matrix, size );
  }

  public static withOnlyBlackEdges( face: TFace, faceValue: FaceValue, blackEdges: TEdge[] ): FaceState {
    const size = FaceState.getMatrixSize( face.edges.length, faceValue );
    const matrix = new Array( size ).fill( false );
    const indices = blackEdges.map( edge => face.edges.indexOf( edge ) );
    const index = faceValue === null ? getBinaryIndex( indices, face.edges.length ) : getCombinationIndex( indices, face.edges.length );
    matrix[ index ] = true;
    return new FaceState( face, faceValue, matrix, 1 );
  }

  public static withoutBlackEdges( face: TFace, faceValue: FaceValue, blackEdges: TEdge[] ): FaceState {
    const size = FaceState.getMatrixSize( face.edges.length, faceValue );
    const matrix = new Array( size ).fill( true );
    const indices = blackEdges.map( edge => face.edges.indexOf( edge ) );
    const index = faceValue === null ? getBinaryIndex( indices, face.edges.length ) : getCombinationIndex( indices, face.edges.length );
    matrix[ index ] = false;
    return new FaceState( face, faceValue, matrix, size - 1 );
  }

  public static deserialize( face: TFace, serialized: TSerializedFaceState ): FaceState {
    return new FaceState( face, serialized.faceValue, unpackBooleanArray( serialized.matrix, FaceState.getMatrixSize( face.edges.length, serialized.faceValue ) ) );
  }
}

export type TSerializedFaceState = {
  faceValue: FaceValue;
  matrix: string;
};
