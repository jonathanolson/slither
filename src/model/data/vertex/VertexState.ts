import { TVertex } from '../../board/core/TVertex.ts';
import _ from '../../../workarounds/_.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TSectorData } from '../sector/TSectorData.ts';
import { getSectorsFromVertex } from '../sector/getSectorsFromVertex.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import EdgeState from '../edge/EdgeState.ts';
import { TFaceColorData } from '../face-color/TFaceColorData.ts';

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
      this.matrix = _.range( 0, VertexState.getMatrixSize( this.order ) ).map( () => true );
    }

    if ( possibilityCount !== undefined ) {
      this.possibilityCount = possibilityCount;
    }
    else {
      this.possibilityCount = this.matrix.filter( x => x ).length;
    }

    assertEnabled() && assert( this.matrix.length === VertexState.getMatrixSize( this.order ) );
    assertEnabled() && assert( this.possibilityCount === this.matrix.filter( x => x ).length );
  }

  public isAny(): boolean {
    return this.possibilityCount === VertexState.getMatrixSize( this.order );
  }

  public isForced(): boolean {
    return this.possibilityCount === 1;
  }

  public allowsEmpty(): boolean {
    return this.matrix[ VertexState.getMatrixSize( this.order ) - 1 ];
  }

  public allowsPair( edgeA: TEdge, edgeB: TEdge ): boolean {
    return this.matrix[ this.getPairIndex( edgeA, edgeB ) ];
  }

  public getAllowedPairs(): [ TEdge, TEdge ][] {
    const result: [ TEdge, TEdge ][] = [];
    let index = 0;
    for ( let i = 0; i < this.order; i++ ) {
      for ( let j = i + 1; j < this.order; j++ ) {
        if ( this.matrix[ index++ ] ) {
          result.push( [ this.vertex.edges[ i ], this.vertex.edges[ j ] ] );
        }
      }
    }
    return result;
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

  public static getMatrixSize( order: number ): number {
    return order * ( order - 1 ) / 2 + 1;
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

  public static none( vertex: TVertex ): VertexState {
    return VertexState.fromLookup( vertex, () => false, false );
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

  public static fromEdgeColorSectorData( vertex: TVertex, data: TEdgeData & TFaceColorData & TSectorData ): VertexState {
    const order = vertex.edges.length;
    const matrix: boolean[] = [];

    const blackEdges = vertex.edges.filter( edge => data.getEdgeState( edge ) === EdgeState.BLACK );

    // TODO: BAIL if we are guaranteed to have no changes? (all edges white, all colors unique no opposites, sectors are any)

    if ( blackEdges.length > 2 ) {
      // buggy case!
      return VertexState.none( vertex );
    }
    if ( blackEdges.length === 2 ) {
      // TODO: how to handle... bad cases?
      return VertexState.withOnlyPair( vertex, blackEdges[ 0 ], blackEdges[ 1 ] );
    }
    const blackEdge = blackEdges.length ? blackEdges[ 0 ] : null;

    const redEdges = new Set( vertex.edges.filter( edge => data.getEdgeState( edge ) === EdgeState.RED ) );
    if ( redEdges.size === order ) {
      return VertexState.withOnlyEmpty( vertex );
    }

    let sectors = getSectorsFromVertex( vertex );

    // Reorder sectors (so that sector[ 0 ] is between edge[ 0 ] and edge[ 1 ], and so on)
    sectors = [ ...sectors.slice( 1 ), sectors[ 0 ] ];
    assertEnabled() && assert( sectors[ 0 ].edge === vertex.edges[ 1 ] && sectors[ 0 ].next.edge === vertex.edges[ 0 ] );

    const sectorStates = sectors.map( sector => data.getSectorState( sector ) );
    const sectorsAllowZero = sectorStates.every( state => state.zero );

    const faceColors = sectors.map( sector => sector.face ? data.getFaceColor( sector.face ) : data.getOutsideColor() );

    const uniqueFaceColors = new Set( faceColors );
    const oppositeMap = new Map( [ ...uniqueFaceColors ].map( color => [ color, data.getOppositeFaceColor( color ) ] ) );
    const containsNoOppositeColors = [ ...oppositeMap.values() ].every( color => !color || !uniqueFaceColors.has( color ) );

    for ( let i = 0; i < order; i++ ) {
      const edgeA = vertex.edges[ i ];
      if ( redEdges.has( edgeA ) ) {
        // Short-circuit, no need to check the rest of the row
        for ( let j = i + 1; j < order; j++ ) {
          matrix.push( false );
        }
        continue;
      }

      for ( let j = i + 1; j < order; j++ ) {
        let possible = true;

        const edgeB = vertex.edges[ j ];
        if ( possible && redEdges.has( edgeB ) ) {
          possible = false;
        }

        if ( possible && blackEdge && ( edgeA !== blackEdge && edgeB !== blackEdge ) ) {
          possible = false;
        }

        if ( possible ) {
          possible = possible && sectorStates.every( ( state, i ) => {
            const sector = sectors[ i ];
            let count = 0;
            if ( edgeA === sector.edge || edgeA === sector.next.edge ) { count++; }
            if ( edgeB === sector.edge || edgeB === sector.next.edge ) { count++; }
            return state.allows( count );
          } );
        }

        if ( possible ) {
          // TODO: potentially optimize here?
          const sideAColors = faceColors.slice( i, j );
          const sideBColors = [ ...faceColors.slice( j ), ...faceColors.slice( 0, i ) ];

          // on same colors are on both sides
          if ( sideAColors.some( color => sideBColors.includes( color ) ) ) {
            possible = false;
          }

          // no opposites are together on a side
          if ( possible && sideAColors.some( color => {
            const opposite = oppositeMap.get( color );
            return opposite && sideAColors.includes( opposite );
          } ) ) {
            possible = false;
          }
          if ( possible && sideBColors.some( color => {
            const opposite = oppositeMap.get( color );
            return opposite && sideBColors.includes( opposite );
          } ) ) {
            possible = false;
          }
        }

        matrix.push( possible );
      }
    }
    matrix.push( blackEdges.length === 0 && sectorsAllowZero && containsNoOppositeColors );

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
    return new VertexState( vertex, VertexState.unpackMatrix( serialized ).slice( 0, VertexState.getMatrixSize( vertex.edges.length ) ) );
  }
}

export type TSerializedVertexState = string;
