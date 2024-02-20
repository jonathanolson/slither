import { TAction, TBoard, TDelta, TEdge, THalfEdge, TSimpleRegion, TSimpleRegionData, TState, TVertex } from '../structure.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TinyEmitter } from 'phet-lib/axon';

// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta
export class GeneralSimpleRegion implements TSimpleRegion {

  public readonly edges: TEdge[];
  public readonly a: TVertex;
  public readonly b: TVertex;

  public constructor(
    public readonly id: number,
    public readonly halfEdges: THalfEdge[],
    public readonly isSolved: boolean = false
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