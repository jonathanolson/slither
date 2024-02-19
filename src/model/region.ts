import EdgeState from './EdgeState';
import { TAction, TBoard, TDelta, TEdge, TEdgeData, TEdgeDataListener, THalfEdge, TSimpleRegion, TSimpleRegionData, TState, TVertex } from './structure';
import assert, { assertEnabled } from '../workarounds/assert.ts';
import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import _ from '../workarounds/_';
import { TinyEmitter } from 'phet-lib/axon';
import { TSolver } from './solver.ts';

export default class SetRelation extends EnumerationValue {
  // x in A IFF x in B
  public static readonly EQUALS = new SetRelation();

  // A is a subset of B
  public static readonly SUBSET = new SetRelation();

  // B is a subset of A
  public static readonly SUPERSET = new SetRelation();

  // A and B have no elements in common
  public static readonly DISJOINT = new SetRelation();

  // A and B have some elements in common, but neither is a subset of the other
  public static readonly OVERLAPS = new SetRelation();

  public static readonly enumeration = new Enumeration( SetRelation );
}


// "There will be one (and only one) strongly-connecting chain between the vertices through edges in the edge set"
// (it will not contain the entire loop)
export class Net {
  public constructor(
    public readonly a: TVertex,
    public readonly b: TVertex,
    public readonly edges: Set<TEdge>
  ) {
    assertEnabled() && assert( a !== b );
  }

  // If all of the edges are black (for regions, this will be one subchain)
  public isComplete(
    data: TEdgeData
  ): boolean {
    return [ ...this.edges ].every( edge => data.getEdgeState( edge ) === EdgeState.BLACK );
  }

  public getSharedVertexCount( other: Net ): number {
    return ( this.a === other.a ? 1 : 0 ) + ( this.a === other.b ? 1 : 0 ) + ( this.b === other.a ? 1 : 0 ) + ( this.b === other.b ? 1 : 0 );
  }

  public hasSameVertices( other: Net ): boolean {
    return ( this.a === other.a && this.b === other.b ) || ( this.a === other.b && this.b === other.a );
  }

  public getSetRelation( other: Net ): SetRelation {
    let hasInThisOnly = false;
    let hasInOtherOnly = false;
    let hasInBoth = false;

    for ( const edge of this.edges ) {
      if ( other.edges.has( edge ) ) {
        hasInBoth = true;
      }
      else {
        hasInThisOnly = true;
      }

      if ( hasInBoth && hasInThisOnly ) {
        break;
      }
    }

    for ( const edge of other.edges ) {
      if ( !this.edges.has( edge ) ) {
        hasInOtherOnly = true;
        break;
      }
    }

    if ( hasInBoth ) {
      if ( !hasInThisOnly && !hasInOtherOnly ) {
        return SetRelation.EQUALS;
      }
      else if ( hasInThisOnly ) {
        return SetRelation.SUBSET;
      }
      else if ( hasInOtherOnly ) {
        return SetRelation.SUPERSET;
      }
      else {
        return SetRelation.OVERLAPS;
      }
    }
    else {
      return SetRelation.DISJOINT;
    }
  }

  public findAllSimplePaths(): TEdge[][] {
    const paths: TEdge[][] = [];
    const visited = new Set<TVertex>();
    const stack: TEdge[] = [];

    const recur = ( vertex: TVertex ) => {
      visited.add( vertex );
      for ( const edge of vertex.edges ) {
        if ( !this.edges.has( edge ) ) {
          continue;
        }
        const other = edge.getOtherVertex( vertex );
        if ( visited.has( other ) ) {
          continue;
        }
        stack.push( edge );
        if ( other === this.b ) {
          paths.push( [ ...stack ] );
        }
        else {
          recur( other );
        }
        stack.pop();
      }
      visited.delete( vertex );
    };
    recur( this.a );

    return paths;
  }

  // TODO: use forced loop removal BEFORE finding bridges/etc.
  /**
   * Find a group of edges where if any one of them is "black", it will loop around (forced) to the same vertex.
   * In nets, this means the edges aren't part of the net, and should be excluded from "bridge" computations
   * In regions, this means THOSE SHOULD BE SET TO RED.
   */
  public findForcedLoopEdges(): Set<TEdge> {
    const forcedLoopEdges = new Set<TEdge>();
    const scannedEdges = new Set<TEdge>();

    const getFilteredEdges = ( vertex: TVertex, badEdge: TEdge ) => vertex.edges.filter( edge => this.edges.has( edge ) && edge !== badEdge );

    for ( const edge of this.edges ) {
      // Already scanned
      if ( scannedEdges.has( edge ) ) { continue; }

      let startEdges = getFilteredEdges( edge.start, edge );
      let endEdges = getFilteredEdges( edge.end, edge );

      // If we aren't part of a forced loop (due to vertex edge counts), then skip
      if ( startEdges.length !== 1 && endEdges.length !== 1 ) {
        scannedEdges.add( edge );
        continue;
      }

      let loopEdges: TEdge[] = [ edge ];
      let startVertex = edge.start;
      let endVertex = edge.end;

      while ( startEdges.length === 1 && startVertex !== endVertex ) {
        const nextEdge = startEdges[ 0 ];
        loopEdges.push( nextEdge );
        startVertex = nextEdge.getOtherVertex( startVertex );
        startEdges = getFilteredEdges( startVertex, nextEdge );
      }
      while ( endEdges.length === 1 && startVertex !== endVertex ) {
        const nextEdge = endEdges[ 0 ];
        loopEdges.push( nextEdge );
        endVertex = nextEdge.getOtherVertex( endVertex );
        endEdges = getFilteredEdges( endVertex, nextEdge );
      }

      if ( startVertex === endVertex ) {
        loopEdges.forEach( edge => forcedLoopEdges.add( edge ) );
      }
      loopEdges.forEach( edge => scannedEdges.add( edge ) );
    }

    return forcedLoopEdges;
  }

  public getPossibleEdgesAndBridges(): {
    possibleEdges: TEdge[],
    bridges: TEdge[]
  } {
    let time = 0;
    const disc = new Map<TVertex, number>();
    const low = new Map<TVertex, number>();
    const visited = new Set<TVertex>();
    const parent = new Map<TVertex, TVertex>();

    // keep track of the edges to parent vertices
    const edgeToParent = new Map<TVertex, TEdge>();

    const stack: TEdge[] = [];
    const biconnectedComponents: TEdge[][] = [];
    const bridges: TEdge[] = [];
    const pathEdges: TEdge[] = [];

    const recur = ( vertex: TVertex ) => {
      visited.add( vertex );
      disc.set( vertex, time );
      low.set( vertex, time );
      time++;

      vertex.edges.forEach( edge => {
        if ( !this.edges.has( edge ) ) {
          return;
        }
        const otherVertex = edge.getOtherVertex( vertex );

        if ( !visited.has( otherVertex ) ) {
          parent.set( otherVertex, vertex );
          edgeToParent.set( otherVertex, edge );
          stack.push( edge );

          recur( otherVertex );

          if ( low.get( otherVertex )! >= disc.get( vertex )! ) {
            const component: TEdge[] = [];
            let poppedEdge;
            do {
              poppedEdge = stack.pop()!;
              component.push( poppedEdge );
            } while ( poppedEdge !== edge );
            biconnectedComponents.push( component );
          }

          if ( low.get( otherVertex )! > disc.get( vertex )! ) {
            bridges.push( edge );
          }

          low.set( vertex, Math.min( low.get( vertex )!, low.get( otherVertex )! ) );
        }
        else if ( otherVertex !== parent.get( vertex ) ) {
          low.set( vertex, Math.min( low.get( vertex )!, disc.get( otherVertex )! ) );
          if ( disc.get( otherVertex )! < disc.get( vertex )! ) {
            stack.push( edge );
          }
        }
      });
    };

    recur( this.a );

    // Reconstruct the path from a to b using the edgeToParent map
    let currentVertex = this.b;
    while ( currentVertex !== this.a && edgeToParent.has( currentVertex ) ) {
      const edge = edgeToParent.get( currentVertex )!;
      pathEdges.unshift( edge ); // Add the edge to the beginning of the path
      currentVertex = parent.get( currentVertex )!; // Move to the parent vertex
    }

    // If currentVertex is not a and we're out of the loop, there's no path from a to b
    if ( currentVertex !== this.a ) {
      return {
        possibleEdges: [],
        bridges: []
      };
    }

    const possibleEdges: TEdge[] = [];
    for ( let component of biconnectedComponents ) {
      if ( pathEdges.some( edge => component.includes( edge ) ) ) {
        possibleEdges.push( ...component );
      }
    }

    return {
      possibleEdges: possibleEdges,
      bridges: bridges.filter( bridgeEdge => possibleEdges.includes( bridgeEdge ) )
    };
  }

  public static test( numVertices: number, numEdges: number ): void {
    if ( numVertices > 26 ) {
      throw new Error( 'Too many vertices' );
    }

    const vertices: TVertex[] = _.range( 0, numVertices ).map( i => {
      return {
        id: String.fromCharCode( 65 + i ),
        edges: []
      } as unknown as TVertex; // Forgive me
    } );

    const allEdges: TEdge[] = [];
    let number = 0;
    for ( let i = 0; i < vertices.length; i++ ) {
      for ( let j = i + 1; j < vertices.length; j++ ) {
        const edge = {
          id: `(${number++},${( vertices[ i ] as any ).id},${( vertices[ j ] as any ).id})`, // Forgive me
          start: vertices[ i ],
          end: vertices[ j ],
          vertices: [ vertices[ i ], vertices[ j ] ],
          getOtherVertex( vertex: TVertex ): TVertex {
            return vertex === vertices[ i ] ? vertices[ j ] : vertices[ i ];
          }
        } as unknown as TEdge;

        vertices[ i ].edges.push( edge );
        vertices[ j ].edges.push( edge );
        allEdges.push( edge );
      }
    }

    const edges = _.sampleSize( allEdges, numEdges );
    const [
      a,
      b
    ] = _.sampleSize( vertices, 2 );

    console.log( `Vertex start: ${( a as any ).id}` );
    console.log( `Vertex end: ${( b as any ).id}` );
    console.log( `Edges:\n${_.sortBy( edges, x => ( x as any ).id ).map( edge => ( edge as any ).id ).join( '\n' )}` );

    const net = new Net( a, b, new Set( edges ) );

    const allSimplePaths = net.findAllSimplePaths();
    const allEdgesInSimplePaths = _.sortBy( [ ...new Set( allSimplePaths.flat() ) ], x => ( x as any ).id );
    const expectedBridgeEdges = _.sortBy( allEdgesInSimplePaths.filter( edge => allSimplePaths.every( path => path.includes( edge ) ) ), x => ( x as any ).id );

    console.log( `All simple paths:\n${allSimplePaths.map( path => path.map( edge => `${( edge as any ).id}` ).join( ', ' ) ).join( '\n' )}` );

    console.log( `All edges in simple paths:\n${[ ...allEdgesInSimplePaths ].map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );
    console.log( `Expected bridge edges:\n${expectedBridgeEdges.map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );

    const {
      possibleEdges,
      bridges
    } = net.getPossibleEdgesAndBridges();

    console.log( `Possible edges:\n${_.sortBy( possibleEdges, x => ( x as any ).id ).map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );
    console.log( `Bridge edges:\n${_.sortBy( bridges, x => ( x as any ).id ).map( edge => `  ${( edge as any ).id}` ).join( '\n' )}` );

    if ( possibleEdges.length !== allEdgesInSimplePaths.length ) {
      throw new Error( 'Possible edges length mismatch' );
    }
    if ( !allEdgesInSimplePaths.every( edge => possibleEdges.includes( edge ) ) ) {
      throw new Error( 'Possible edges mismatch' );
    }
    if ( bridges.length !== expectedBridgeEdges.length ) {
      throw new Error( 'Bridge edges length mismatch' );
    }
    if ( !bridges.every( edge => expectedBridgeEdges.includes( edge ) ) ) {
      throw new Error( 'Bridge edges mismatch' );
    }
  }

  public equals( other: Net ): boolean {
    return ( ( this.a === other.a && this.b === other.b ) || ( this.a === other.b && this.b === other.a ) ) &&
      this.edges.size === other.edges.size &&
      [ ...this.edges ].every( edge => other.edges.has( edge ) );
  }
}

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

export class Constriction {
  public constructor(
    public readonly a: Region,
    public readonly b: Region
  ) {}
}

export class GeneralSimpleRegion implements TSimpleRegion {
  
  public readonly edges: TEdge[];
  public readonly a: TVertex;
  public readonly b: TVertex;
  
  public constructor(
    public readonly id: number,
    public readonly halfEdges: THalfEdge[]
  ) {
    this.a = halfEdges[ 0 ].start;
    this.b = halfEdges[ halfEdges.length - 1 ].end;
    this.edges = halfEdges.map( halfEdge => halfEdge.edge );

    if ( assertEnabled() ) {
      assert( halfEdges.length > 0 );
      for ( let i = 0; i < halfEdges.length - 1; i++ ) {
        assert( halfEdges[ i ].end === halfEdges[ i + 1 ].start );
      }
    }
  }
}


export class GeneralSimpleRegionData implements TState<TSimpleRegionData> {

  public readonly simpleRegionsChangedEmitter = new TinyEmitter<[ addedRegions: Iterable<TSimpleRegion>, removedRegions: Iterable<TSimpleRegion>, addedWeirdEdges: Iterable<TEdge>, removedWeirdEdges: Iterable<TEdge> ]>;

  public readonly simpleRegions: Set<TSimpleRegion>;
  public readonly weirdEdges: Set<TEdge>;

  public constructor(
    public readonly board: TBoard,
    simpleRegions?: Iterable<TSimpleRegion>,
    weirdEdges?: Iterable<TEdge>
  ) {
    this.simpleRegions = new Set( simpleRegions );
    this.weirdEdges = new Set( weirdEdges );
  }
  
  public getSimpleRegions(): TSimpleRegion[] {
    return [ ...this.simpleRegions ];
  }
  
  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    for ( const simpleRegion of this.simpleRegions ) {
      if ( simpleRegion.a === vertex || simpleRegion.b === vertex ) {
        return simpleRegion;
      }
    }
    return null;
  }
  
  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    for ( const simpleRegion of this.simpleRegions ) {
      if ( simpleRegion.edges.includes( edge ) ) {
        return simpleRegion;
      }
    }
    return null;
  }
  
  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    for ( const simpleRegion of this.simpleRegions ) {
      if ( simpleRegion.id === id ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getWeirdEdges(): TEdge[] {
    return [ ...this.weirdEdges ];
  }
  
  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    for ( const removedRegion of removedRegions ) {
      this.simpleRegions.delete( removedRegion );
    }
    for ( const newRegion of addedRegions ) {
      this.simpleRegions.add( newRegion );
    }
    for ( const removedEdge of removedWeirdEdges ) {
      this.weirdEdges.delete( removedEdge );
    }
    for ( const newEdge of addedWeirdEdges ) {
      this.weirdEdges.add( newEdge );
    }
    this.simpleRegionsChangedEmitter.emit( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public clone(): GeneralSimpleRegionData {
    return new GeneralSimpleRegionData( this.board, this.simpleRegions, this.weirdEdges );
  }

  public createDelta(): TDelta<TSimpleRegionData> {
    return new GeneralSimpleRegionDelta( this.board, this );
  }
}

// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta

export class GeneralSimpleRegionAction implements TAction<TSimpleRegionData> {
  public constructor(
    public readonly board: TBoard,
    public readonly addedRegions: Set<TSimpleRegion> = new Set(),
    public readonly removedRegions: Set<TSimpleRegion> = new Set(),
    public readonly addedWeirdEdges: Set<TEdge> = new Set(),
    public readonly removedWeirdEdges: Set<TEdge> = new Set()
  ) {}

  public apply( state: TSimpleRegionData ): void {
    state.modifyRegions( this.addedRegions, this.removedRegions, this.addedWeirdEdges, this.removedWeirdEdges );
  }

  public getUndo( state: TSimpleRegionData ): TAction<TSimpleRegionData> {
    return new GeneralSimpleRegionAction( this.board, this.removedRegions, this.addedRegions, this.removedWeirdEdges, this.addedWeirdEdges );
  }

  public isEmpty(): boolean {
    return this.addedRegions.size === 0 && this.removedRegions.size === 0 && this.addedWeirdEdges.size === 0 && this.removedWeirdEdges.size === 0;
  }
}

export class GeneralSimpleRegionDelta extends GeneralSimpleRegionAction implements TDelta<TSimpleRegionData> {

  public readonly simpleRegionsChangedEmitter = new TinyEmitter<[ addedRegions: Iterable<TSimpleRegion>, removedRegions: Iterable<TSimpleRegion>, addedWeirdEdges: Iterable<TEdge>, removedWeirdEdges: Iterable<TEdge> ]>;

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TSimpleRegionData>,
    addedRegions: Set<TSimpleRegion> = new Set(),
    removedRegions: Set<TSimpleRegion> = new Set(),
    addedWeirdEdges: Set<TEdge> = new Set(),
    removedWeirdEdges: Set<TEdge> = new Set()
  ) {
    super( board, addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return [
      ...this.parentState.getSimpleRegions().filter( simpleRegion => !this.removedRegions.has( simpleRegion ) ),
      ...this.addedRegions
    ];
  }

  // TODO: make more efficient
  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    for ( const simpleRegion of this.getSimpleRegions() ) {
      if ( simpleRegion.a === vertex || simpleRegion.b === vertex ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    for ( const simpleRegion of this.getSimpleRegions() ) {
      if ( simpleRegion.edges.includes( edge ) ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    for ( const simpleRegion of this.getSimpleRegions() ) {
      if ( simpleRegion.id === id ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getWeirdEdges(): TEdge[] {
    return [
      ...this.parentState.getWeirdEdges().filter( edge => !this.removedWeirdEdges.has( edge ) ),
      ...this.addedWeirdEdges
    ];
  }

  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    for ( const removedRegion of removedRegions ) {
      if ( this.addedRegions.has( removedRegion ) ) {
        this.addedRegions.delete( removedRegion );
      }
      else {
        this.removedRegions.add( removedRegion );
      }
    }
    for ( const newRegion of addedRegions ) {
      this.addedRegions.add( newRegion );
    }
    for ( const removedEdge of removedWeirdEdges ) {
      if ( this.addedWeirdEdges.has( removedEdge ) ) {
        this.addedWeirdEdges.delete( removedEdge );
      }
      else {
        this.removedWeirdEdges.add( removedEdge );
      }
    }
    for ( const newEdge of addedWeirdEdges ) {
      this.addedWeirdEdges.add( newEdge );
    }
    this.simpleRegionsChangedEmitter.emit( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public clone(): GeneralSimpleRegionDelta {
    return new GeneralSimpleRegionDelta( this.board, this.parentState, new Set( this.addedRegions ), new Set( this.removedRegions ), new Set( this.addedWeirdEdges ), new Set( this.removedWeirdEdges ) );
  }

  public createDelta(): TDelta<TSimpleRegionData> {
    return new GeneralSimpleRegionDelta( this.board, this );
  }
}

let simpleRegionGlobalId = 0;
export class SafeEdgeToSimpleRegionSolver implements TSolver<TEdgeData & TSimpleRegionData, TAction<TEdgeData & TSimpleRegionData>> {

  private readonly dirtyEdges = new Set<TEdge>();

  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TEdgeData & TSimpleRegionData>,
  ) {
    board.edges.forEach( edge => {
      this.dirtyEdges.add( edge );
    } );

    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      this.dirtyEdges.add( edge );
    };

    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyEdges.size > 0;
  }

  public nextAction(): TAction<TEdgeData & TSimpleRegionData> | null {
    if ( !this.dirty ) { return null; }

    const oldRegions = this.state.getSimpleRegions();
    const oldWeirdEdges = this.state.getWeirdEdges();

    // TODO: handle spiked 2s(!)

    const nowBlackEdges = new Set<TEdge>();
    const nowClearedEdges = new Set<TEdge>();

    for ( const edge of this.dirtyEdges ) {
      const edgeState = this.state.getEdgeState( edge );
      if ( edgeState === EdgeState.BLACK ) {
        nowBlackEdges.add( edge );
      }
      else {
        nowClearedEdges.add( edge );
      }
    }

    const addedRegions = new Set<TSimpleRegion>();
    const removedRegions = new Set<TSimpleRegion>();
    const regions = new Set<TSimpleRegion>( oldRegions );
    const addedWeirdEdges = new Set<TEdge>();
    const removedWeirdEdges = new Set<TEdge>();
    const weirdEdges = new Set<TEdge>( oldWeirdEdges );

    // Handle removals from weird edges
    for ( const edge of nowClearedEdges ) {
      if ( weirdEdges.has( edge ) ) {
        weirdEdges.delete( edge );
        removedWeirdEdges.add( edge );
      }
    }

    for ( const edge of nowBlackEdges ) {
      // Handle additions that duplicate weird edges (we'll leave the weird edge mark)
      if ( weirdEdges.has( edge ) ) {
        nowBlackEdges.delete( edge );
      }

      // Handle additions that duplicate actual regions
      if ( [ ...regions ].some( region => region.halfEdges.some( halfEdge => halfEdge.edge === edge ) ) ) {
        nowBlackEdges.delete( edge );
      }
    }

    // Now, we have three disjoint sets: nowBlackEdges, nowClearedEdges, and weirdEdges

    // Handle removals from actual regions
    for ( const region of oldRegions ) {
      if ( region.halfEdges.some( halfEdge => nowClearedEdges.has( halfEdge.edge ) ) ) {
        const halfEdgeRegions: THalfEdge[][] = [];
        let currentHalfEdgeRegion: THalfEdge[] = [];

        for ( const halfEdge of region.halfEdges ) {
          if ( !nowClearedEdges.has( halfEdge.edge ) ) {
            currentHalfEdgeRegion.push( halfEdge );
          }
          else if ( currentHalfEdgeRegion.length > 0 ) {
            halfEdgeRegions.push( currentHalfEdgeRegion );
            currentHalfEdgeRegion = [];
          }
        }
        if ( currentHalfEdgeRegion.length > 0 ) {
          halfEdgeRegions.push( currentHalfEdgeRegion );
        }

        removedRegions.add( region );
        regions.delete( region );

        if ( halfEdgeRegions.length ) {
          const largestHalfEdgeRegion = _.maxBy( halfEdgeRegions, halfEdgeRegion => halfEdgeRegion.length )!;

          for ( const halfEdgeRegion of halfEdgeRegions ) {
            const newRegion = new GeneralSimpleRegion(
              halfEdgeRegion === largestHalfEdgeRegion ? region.id : simpleRegionGlobalId++,
              halfEdgeRegion
            );
            addedRegions.add( newRegion );
            regions.add( newRegion );
          }
        }
      }
    }

    const attemptToAddEdge = ( edge: TEdge ): boolean => {
      const startVertex = edge.start;
      const endVertex = edge.end;

      // NOTE: guaranteed to NOT exist in our regions (by now)


      // Should only be at most
      const startRegion = [ ...regions ].find( region => region.a === startVertex || region.b === startVertex ) || null;
      const endRegion = [ ...regions ].find( region => region.a === endVertex || region.b === endVertex ) || null;

      // Check to see if it is a weird edge
      const startVertexEdgeCount = startVertex.edges.filter( vertexEdge => this.state.getEdgeState( vertexEdge ) === EdgeState.BLACK ).length;
      const endVertexEdgeCount = endVertex.edges.filter( vertexEdge => this.state.getEdgeState( vertexEdge ) === EdgeState.BLACK ).length;
      if ( startVertexEdgeCount > 2 || endVertexEdgeCount > 2 ) {
        // It's weird(!)
        return false;
      }

      const addRegion = ( region: TSimpleRegion ) => {
        regions.add( region );
        addedRegions.add( region );
      };
      const removeRegion = ( region: TSimpleRegion ) => {
        regions.delete( region );
        if ( addedRegions.has( region ) ) {
          addedRegions.delete( region );
        }
        else {
          removedRegions.add( region );
        }
      };

      const combineHalfEdgeArrays = ( ...arrays: THalfEdge[][] ): THalfEdge[] => {
        if ( arrays.length === 0 ) {
          return [];
        }
        let result = [
          ...arrays[ 0 ]
        ];
        for ( let i = 1; i < arrays.length; i++ ) {
          const arr = arrays[ i ];
          if ( arr.length === 0 ) {
            continue;
          }

          // TODO: could probably do things faster
          if ( result[ 0 ].start === arr[ 0 ].start ) {
            result = [
              ...arr.map( halfEdge => halfEdge.reversed ).reverse(),
              ...result
            ];
          }
          else if ( result[ 0 ].start === arr[ arr.length - 1 ].end ) {
            result = [
              ...arr,
              ...result
            ];
          }
          else if ( result[ result.length - 1 ].end === arr[ 0 ].start ) {
            // TODO: push instead?
            result = [
              ...result,
              ...arr
            ];
          }
          else if ( result[ result.length - 1 ].end === arr[ arr.length - 1 ].end ) {
            // TODO: push instead?
            result = [
              ...result,
              ...arr.map( halfEdge => halfEdge.reversed ).reverse()
            ];
          }
          else {
            throw new Error( 'Cannot combine half edge arrays' );
          }
        }
        return result;
      };

      if ( startRegion && endRegion ) {
        if ( startRegion === endRegion ) {
          // TODO: how do we handle... completed loops? Do we check to see if it is solved?
          // TODO: Do we... have a data type that checks these things?
          return false; // TODO: hah, we just mark it as weird.... for now?
        }
        else {
          // We are joining two regions(!)

          const primaryRegion = startRegion.halfEdges.length >= endRegion.halfEdges.length ? startRegion : endRegion;
          const secondaryRegion = primaryRegion === startRegion ? endRegion : startRegion;

          const newRegion = new GeneralSimpleRegion( primaryRegion.id, combineHalfEdgeArrays( primaryRegion.halfEdges, [ edge.forwardHalf ], secondaryRegion.halfEdges ) );

          removeRegion( primaryRegion );
          removeRegion( secondaryRegion );
          addRegion( newRegion );
        }
      }
      else if ( startRegion ) {
        const newRegion = new GeneralSimpleRegion( startRegion.id, combineHalfEdgeArrays( startRegion.halfEdges, [ edge.forwardHalf ] ) );

        removeRegion( startRegion );
        addRegion( newRegion );
      }
      else if ( endRegion ) {
        const newRegion = new GeneralSimpleRegion( endRegion.id, combineHalfEdgeArrays( endRegion.halfEdges, [ edge.forwardHalf ] ) );

        removeRegion( endRegion );
        addRegion( newRegion );
      }
      else {
        const newRegion = new GeneralSimpleRegion( simpleRegionGlobalId++, [ edge.forwardHalf ] );

        addRegion( newRegion );
      }

      return true;
    };

    // Try weird edges first
    for ( const weirdEdge of weirdEdges ) {
      const success = attemptToAddEdge( weirdEdge );

      if ( success ) {
        removedWeirdEdges.add( weirdEdge );
        weirdEdges.delete( weirdEdge );
      }
    }

    for ( const edge of nowBlackEdges ) {
      const success = attemptToAddEdge( edge );

      if ( !success ) {
        addedWeirdEdges.add( edge );
        weirdEdges.add( edge ); // TODO: why, we're not saving it...?
      }
    }

    // NOTE: only do this at the end, since if we "error out" we'll want to note we still need to be computed
    this.dirtyEdges.clear();

    return new GeneralSimpleRegionAction( this.board, addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public clone( equivalentState: TState<TEdgeData & TSimpleRegionData> ): SafeEdgeToSimpleRegionSolver {
    return new SafeEdgeToSimpleRegionSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}

/*
export interface TSolver<Data, Action extends TAction<Data>> {
  // If there is a chance nextAction will return an action
  dirty: boolean;

  // TODO: We could also report out the "difficulty" of the next dirty solver, so we could potentially
  // TODO: backtrack more efficiently by exploring the "easier" parts first in each black/red pair.
  // TODO: --- decide whether this actually just... ADDs to the computational cost of the solver?

  // If this returns null, the solver is "currently exhausted" / "clean", and should be marked as NOT dirty.
  nextAction(): Action | null;

  // Create a copy of this solver, but referring to an equivalent state object (allows branching).
  clone( equivalentState: TState<Data> ): TSolver<Data, Action>;

  dispose(): void;
}
 */