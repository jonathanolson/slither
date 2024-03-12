import { TVertex } from '../../board/core/TVertex.ts';
import _ from '../../../workarounds/_.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TSectorData } from '../sector/TSectorData.ts';
import { getSectorsFromVertex } from '../sector/getSectorsFromVertex.ts';

export class VertexState {

  public readonly order: number;
  public readonly possibilityCount: number;

  private readonly matrix: boolean[]; // TODO: bitpacking?

  public constructor(
    public readonly vertex: TVertex,
    matrix?: boolean[],
    possibilityCount?: number
  ) {
    this.order = vertex.edges.length;

    if ( matrix ) {
      this.matrix = matrix;
    }
    else {
      this.matrix = _.range( 0, this.order * ( this.order - 1 ) + 1 ).map( () => true );
    }

    if ( possibilityCount !== undefined ) {
      this.possibilityCount = possibilityCount;
    }
    else {
      this.possibilityCount = this.matrix.filter( x => x ).length;
    }

    assertEnabled() && assert( this.matrix.length === this.order * ( this.order - 1 ) + 1 );
    assertEnabled() && assert( this.possibilityCount === this.matrix.filter( x => x ).length );
  }

  public isAny(): boolean {
    return this.possibilityCount === this.order * ( this.order - 1 ) + 1;
  }

  public isForced(): boolean {
    return this.possibilityCount === 1;
  }

  public allowsEmpty(): boolean {
    return this.matrix[ this.order * ( this.order - 1 ) ];
  }

  public allowsPair( edgeA: TEdge, edgeB: TEdge ): boolean {
    return this.matrix[ this.getPairIndex( edgeA, edgeB ) ];
  }

  public getPairIndex( edgeA: TEdge, edgeB: TEdge ): number {
    const indexA = this.vertex.edges.indexOf( edgeA );
    const indexB = this.vertex.edges.indexOf( edgeB );

    const minIndex = Math.min( indexA, indexB );
    const maxIndex = Math.max( indexA, indexB );

    return VertexState.getIndex( minIndex, maxIndex, this.order );
  }

  public equals( other: VertexState ): boolean {
    return this.vertex === other.vertex && this.matrix.every( ( x, i ) => x === other.matrix[ i ] );
  }

  public and( other: VertexState ): VertexState {
    assertEnabled() && assert( this.vertex === other.vertex );

    return new VertexState( this.vertex, this.matrix.map( ( x, i ) => x && other.matrix[ i ] ) );
  }

  public or( other: VertexState ): VertexState {
    assertEnabled() && assert( this.vertex === other.vertex );

    return new VertexState( this.vertex, this.matrix.map( ( x, i ) => x || other.matrix[ i ] ) );
  }

  public isSubsetOf( other: VertexState ): boolean {
    return this.matrix.every( ( x, i ) => !x || other.matrix[ i ] );
  }

  public withEmpty( empty: boolean ): VertexState {
    return new VertexState( this.vertex, this.matrix.slice( 0, -1 ).concat( empty ) );
  }

  public withPair( edgeA: TEdge, edgeB: TEdge, pair: boolean ): VertexState {
    const index = this.getPairIndex( edgeA, edgeB );

    return new VertexState( this.vertex, this.matrix.slice( 0, index ).concat( pair, this.matrix.slice( index + 1 ) ) );
  }

  public serialize(): TSerializedVertexState {
    const result = VertexState.packMatrix( this.matrix );

    assertEnabled() && assert( this.equals( VertexState.deserialize( this.vertex, result ) ) );

    return result;
  }

  public static getIndex( minIndex: number, maxIndex: number, order: number ): number {
    // upper-triangular matrix indexing
    return ( minIndex * ( 2 * order - minIndex - 1 ) / 2 ) + ( maxIndex - minIndex - 1 );
  }

  public static fromLookup( vertex: TVertex, lookup: ( a: TEdge, b: TEdge ) => boolean, allowEmpty: boolean ): VertexState {
    const order = vertex.edges.length;
    const matrix: boolean[] = [];

    for ( let i = 0; i < order; i++ ) {
      for ( let j = i + 1; j < order; j++ ) {
        matrix.push( lookup( vertex.edges[ i ], vertex.edges[ j ] ) );
      }
    }
    matrix.push( allowEmpty );

    return new VertexState( vertex, matrix );
  }

  public static any( vertex: TVertex ): VertexState {
    return VertexState.fromLookup( vertex, () => true, true );
  }

  public static withOnlyEmpty( vertex: TVertex ): VertexState {
    return VertexState.fromLookup( vertex, () => false, true );
  }

  public static withOnlyPair( vertex: TVertex, edgeA: TEdge, edgeB: TEdge ): VertexState {
    return VertexState.fromLookup( vertex, ( a, b ) => ( a === edgeA && b === edgeB ) || ( a === edgeB && b === edgeA ), false );
  }

  public static withoutEmpty( vertex: TVertex ): VertexState {
    return VertexState.fromLookup( vertex, () => true, false );
  }

  public static withoutPair( vertex: TVertex, edgeA: TEdge, edgeB: TEdge ): VertexState {
    return VertexState.fromLookup( vertex, ( a, b ) => ( a !== edgeA && a !== edgeB ) || ( b !== edgeA && b !== edgeB ), true );
  }

  public static fromVertexSectorData( vertex: TVertex, sectorData: TSectorData ): VertexState {
    const order = vertex.edges.length;
    const matrix: boolean[] = [];

    const sectors = getSectorsFromVertex( vertex );
    const sectorStates = sectors.map( sector => sectorData.getSectorState( sector ) );

    for ( let i = 0; i < order; i++ ) {
      const edgeA = vertex.edges[ i ];
      for ( let j = i + 1; j < order; j++ ) {
        const edgeB = vertex.edges[ j ];

        matrix.push( sectorStates.every( ( state, i ) => {
          const sector = sectors[ i ];
          let count = 0;
          if ( edgeA === sector.edge || edgeA === sector.next.edge ) { count++; }
          if ( edgeB === sector.edge || edgeB === sector.next.edge ) { count++; }
          return state.allows( count );
        } ) );
      }
    }
    matrix.push( sectorStates.every( state => state.zero ) );

    return new VertexState( vertex, matrix );
  }

  public static packMatrix( matrix: boolean[] ): string {
    const bytes = new Uint8Array( Math.ceil( matrix.length / 8 ) );
    for ( let i = 0; i < matrix.length; i++ ) {
      if ( matrix[ i ] ) {
        bytes[ Math.floor( i / 8 ) ] |= 1 << ( 7 - ( i % 8 ) );
      }
    }
    const result = btoa( String.fromCharCode( ...bytes ) );
    if ( assertEnabled() ) {
      const unpacked = VertexState.unpackMatrix( result ).slice( 0, matrix.length );
      assert( matrix.length === unpacked.length && matrix.every( ( x, i ) => x === unpacked[ i ] ) );
    }
    return result;
  }

  public static unpackMatrix( str: string ): boolean[] {
    const bytes = Uint8Array.from( atob( str ), c => c.charCodeAt( 0 ) );
    const booleans = [];
    for ( let i = 0; i < bytes.length * 8; i++ ) {
      booleans.push( ( bytes[ Math.floor( i / 8 ) ] & ( 1 << ( 7 - ( i % 8 ) ) ) ) !== 0 );
    }
    return booleans;
  }

  public static deserialize( vertex: TVertex, serialized: TSerializedVertexState ): VertexState {
    return new VertexState( vertex, VertexState.unpackMatrix( serialized ).slice( 0, vertex.edges.length ) );
  }
}

export type TSerializedVertexState = string;
