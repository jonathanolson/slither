import { VecLit } from './VecLit';
import { Lit } from './Lit';

export class Clause extends VecLit {
  private _mark: number;
  private _learnt: boolean;
  private _has_extra: boolean;
  private _act!: number;
  private _abs!: number;

  public equals( obj: Clause ): boolean {
    return this === obj;
  }

  public constructor( ps: VecLit, use_extra: boolean, learnt: boolean ) {
    super();
    this._mark = 0;
    this._learnt = learnt;
    this._has_extra = use_extra;
    for ( let i = 0; i < ps.size(); ++i ) {
      this.push( ps.get( i ) );
    }
    if ( this._has_extra ) {
      if ( this._learnt ) {
        this._act = 0;
      }
      else {
        this.calcAbstraction();
      }
    }
  }

  public calcAbstraction(): void {
    if ( !this._has_extra ) {
      throw new Error( 'has_extra is false' );
    }
    let abstraction = 0;
    for ( let i = 0; i < this.size(); ++i ) {
      abstraction |= 1 << ( this.get( i ).var() & 31 );
    }
    this._abs = abstraction;
  }

  public learnt(): boolean {
    return this._learnt;
  }

  public has_extra(): boolean {
    return this._has_extra;
  }

  public mark( m?: number ): number | undefined {
    if ( m === undefined ) {
      return this._mark;
    }
    else {
      this._mark = m;
    }
  }

  public reloced(): boolean {
    return false;
  }

  public relocation(): Clause {
    throw new Error( 'UnsupportedOperationException' );
  }

  public relocate( c: Clause ): void {
    throw new Error( 'UnsupportedOperationException' );
  }

  public get activity(): number {
    if ( !this._has_extra ) {
      throw new Error( 'has_extra is false' );
    }
    return this._act;
  }

  public set activity( value: number ) {
    this._act = value;
  }

  public abstraction(): number {
    if ( !this._has_extra ) {
      throw new Error( 'has_extra is false' );
    }
    return this._abs;
  }

  public subsumes( other: Clause ): Lit {
    if ( this._learnt || other._learnt ) {
      throw new Error( 'learnt is true' );
    }
    if ( !this._has_extra || other._has_extra ) {
      throw new Error( 'has_extra is false' );
    }
    if ( other.size() < this.size() || ( this._abs & ~other._abs ) !== 0 ) {
      return Lit.ERROR;
    }

    let ret = Lit.UNDEF;
    L: for ( let i = 0; i < this.size(); i++ ) {
      const cc = this.get( i );
      for ( let j = 0; j < other.size(); j++ ) {
        const dd = other.get( j );
        if ( cc.equals( dd ) ) {
          continue L;
        }
        else if ( ret.equals( Lit.UNDEF ) && cc.equals( dd.not() ) ) {
          ret = cc;
          continue L;
        }
      }
      return Lit.ERROR;
    }
    return ret;
  }

  public strengthen( p: Lit ): void {
    this.remove( p );
    this.calcAbstraction();
  }

  public static readonly CRef_Undef = new Clause( new VecLit(), false, false );
}
