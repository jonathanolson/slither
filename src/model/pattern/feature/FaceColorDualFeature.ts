import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternFace } from '../TPatternFace.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicAnd, logicEven, logicOdd } from '../../logic/operations.ts';
import { Embedding } from '../Embedding.ts';
import { TFeature } from './TFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../TPatternBoard.ts';
import _ from '../../../workarounds/_.ts';

export class FaceColorDualFeature implements TEmbeddableFeature {

  public readonly allFaces: Set<TPatternFace> = new Set();

  public constructor(
    public readonly primaryFaces: TPatternFace[],
    public readonly secondaryFaces: TPatternFace[],
    public readonly sameColorPaths: TPatternEdge[][],
    public readonly oppositeColorPaths: TPatternEdge[][]
  ) {
    assertEnabled() && assert( primaryFaces.length + secondaryFaces.length > 1 );
    assertEnabled() && assert( primaryFaces.length );

    this.allFaces = new Set( [ ...primaryFaces, ...secondaryFaces ] );
  }

  public toCanonicalString(): string {
    const primaryIndices = _.sortBy( this.primaryFaces.map( face => face.index ) );
    const secondaryIndices = _.sortBy( this.secondaryFaces.map( face => face.index ) );

    const isPrimaryFirst = primaryIndices.length > secondaryIndices.length || ( primaryIndices.length === secondaryIndices.length && primaryIndices[ 0 ] < secondaryIndices[ 0 ] );

    const firstIndices = isPrimaryFirst ? primaryIndices : secondaryIndices;
    const secondIndices = isPrimaryFirst ? secondaryIndices : primaryIndices;

    return `face-color-dual-${firstIndices.join( ',' )}-${secondIndices.join( ',' )}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    for ( const path of this.sameColorPaths ) {
      if ( path.filter( edge => isEdgeBlack( edge ) ).length % 2 !== 0 ) {
        return false;
      }
    }

    for ( const path of this.oppositeColorPaths ) {
      if ( path.filter( edge => isEdgeBlack( edge ) ).length % 2 === 0 ) {
        return false;
      }
    }

    return true;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicAnd( [
      ...this.sameColorPaths.map( path => logicEven( path.map( edge => getFormula( edge ) ) ) ),
      ...this.oppositeColorPaths.map( path => logicOdd( path.map( edge => getFormula( edge ) ) ) )
    ] );
  }

  public embedded( embedding: Embedding ): FaceColorDualFeature[] {
    return [ new FaceColorDualFeature(
      this.primaryFaces.map( face => embedding.mapFace( face ) ),
      this.secondaryFaces.map( face => embedding.mapFace( face ) ),
      this.sameColorPaths.map( path => path.map( edge => embedding.mapNonExitEdge( edge ) ) ),
      this.oppositeColorPaths.map( path => path.map( edge => embedding.mapNonExitEdge( edge ) ) )
    ) ];
  }

  public equals( other: TFeature ): boolean {
    if ( !( other instanceof FaceColorDualFeature ) ) {
      return false;
    }

    if ( this.primaryFaces.length + this.secondaryFaces.length !== other.primaryFaces.length + other.secondaryFaces.length ) {
      return false;
    }

    const equalArray = ( a: TPatternFace[], b: TPatternFace[] ) => {
      // NOTE: assume both are unique
      return a.length === b.length && a.every( face => b.includes( face ) );
    };

    return ( equalArray( this.primaryFaces, other.primaryFaces ) && equalArray( this.secondaryFaces, other.secondaryFaces ) ) ||
           ( equalArray( this.primaryFaces, other.secondaryFaces ) && equalArray( this.secondaryFaces, other.primaryFaces ) );
  }

  public indexEquals( other: TFeature ): boolean {
    if ( !( other instanceof FaceColorDualFeature ) ) {
      return false;
    }

    if ( this.primaryFaces.length + this.secondaryFaces.length !== other.primaryFaces.length + other.secondaryFaces.length ) {
      return false;
    }

    const equalArray = ( a: TPatternFace[], b: TPatternFace[] ) => {
      // NOTE: assume both are unique
      return a.length === b.length && a.every( face => b.some( otherFace => face.index === otherFace.index ) );
    };

    return ( equalArray( this.primaryFaces, other.primaryFaces ) && equalArray( this.secondaryFaces, other.secondaryFaces ) ) ||
           ( equalArray( this.primaryFaces, other.secondaryFaces ) && equalArray( this.secondaryFaces, other.primaryFaces ) );
  }

  // TODO: We aren't requiring compatibility, is that correct
  public isSubsetOf( other: TFeature ): boolean {
    if ( !( other instanceof FaceColorDualFeature ) ) {
      return false;
    }

    if ( this.allFaces.size > other.allFaces.size ) {
      return false;
    }

    for ( const face of this.allFaces.values() ) {
      if ( !other.allFaces.has( face ) ) {
        return false;
      }
    }

    const isSame = other.primaryFaces.includes( this.primaryFaces[ 0 ] );

    if ( isSame ) {
      return this.primaryFaces.every( face => other.primaryFaces.includes( face ) ) && this.secondaryFaces.every( face => other.secondaryFaces.includes( face ) );
    }
    else {
      return this.primaryFaces.every( face => other.secondaryFaces.includes( face ) ) && this.secondaryFaces.every( face => other.primaryFaces.includes( face ) );
    }
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    // TODO: See if we... subset any? Hmmm?
    return otherFeatures.some( feature => this.equals( feature ) );
  }

  public serialize(): TSerializedEmbeddableFeature & { type: 'face-color-dual' } {
    return {
      type: 'face-color-dual',
      primaryFaces: this.primaryFaces.map( face => face.index ),
      secondaryFaces: this.secondaryFaces.map( face => face.index ),
      sameColorPaths: this.sameColorPaths.map( path => path.map( edge => edge.index ) ),
      oppositeColorPaths: this.oppositeColorPaths.map( path => path.map( edge => edge.index ) )
    };
  }

  public overlapsWith( other: FaceColorDualFeature ): boolean {
    for ( const face of this.allFaces ) {
      if ( other.allFaces.has( face ) ) {
        return true;
      }
    }
    return false;
  }

  // null if they are not compatible
  public union( other: FaceColorDualFeature ): FaceColorDualFeature | null {
    const hasSameOverlap = this.primaryFaces.some( face => other.primaryFaces.includes( face ) ) || this.secondaryFaces.some( face => other.secondaryFaces.includes( face ) );
    const hasOppositeOverlap = this.primaryFaces.some( face => other.secondaryFaces.includes( face ) ) || this.secondaryFaces.some( face => other.primaryFaces.includes( face ) );

    assertEnabled() && assert( hasSameOverlap || hasOppositeOverlap );

    if ( hasSameOverlap && hasOppositeOverlap ) {
      return null;
    }
    else if ( hasSameOverlap ) {
      // TODO: can we do this without creating so much garbage
      return FaceColorDualFeature.fromPrimarySecondaryFaces(
        [ ...new Set( [ ...this.primaryFaces, ...other.primaryFaces ] ) ],
        [ ...new Set( [ ...this.secondaryFaces, ...other.secondaryFaces ] ) ] );
    }
    else {
      return FaceColorDualFeature.fromPrimarySecondaryFaces(
        [ ...new Set( [ ...this.primaryFaces, ...other.secondaryFaces ] ) ],
        [ ...new Set( [ ...this.secondaryFaces, ...other.primaryFaces ] ) ] );
    }
  }

  public isCompatibleWith( other: FaceColorDualFeature ): boolean {
    let hasSame = false;
    let hasOpposite = false;

    const sharedFaces = new Set( [ ...this.allFaces ].filter( face => other.allFaces.has( face ) ) );

    // TODO: could be optimized? (should we store sets for primary/secondary?

    for ( const face of this.primaryFaces ) {
      if ( sharedFaces.has( face ) ) {
        if ( other.primaryFaces.includes( face ) ) {
          hasSame = true;
        }
        if ( other.secondaryFaces.includes( face ) ) {
          hasOpposite = true;
        }
      }
    }

    for ( const face of this.secondaryFaces ) {
      if ( sharedFaces.has( face ) ) {
        if ( other.primaryFaces.includes( face ) ) {
          hasOpposite = true;
        }
        if ( other.secondaryFaces.includes( face ) ) {
          hasSame = true;
        }
      }
    }

    return !hasSame || !hasOpposite;
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'face-color-dual' }, patternBoard: TPatternBoard ): FaceColorDualFeature {
    return new FaceColorDualFeature(
      serialized.primaryFaces.map( index => patternBoard.faces[ index ] ),
      serialized.secondaryFaces.map( index => patternBoard.faces[ index ] ),
      serialized.sameColorPaths.map( path => path.map( index => patternBoard.edges[ index ] ) ),
      serialized.oppositeColorPaths.map( path => path.map( index => patternBoard.edges[ index ] ) )
    );
  }

  public static fromPrimarySecondaryFaces( primaryFaces: TPatternFace[], secondaryFaces: TPatternFace[] ): FaceColorDualFeature {
    assertEnabled() && assert( primaryFaces.length + secondaryFaces.length > 1 );
    assertEnabled() && assert( primaryFaces.length );

    const sameColorPaths: TPatternEdge[][] = [];
    const oppositeColorPaths: TPatternEdge[][] = [];

    const allFaces = new Set( [ ...primaryFaces, ...secondaryFaces ] );
    const firstFace = primaryFaces[ 0 ];
    const visitedFaces = new Set( [ firstFace ] );

    for ( let hops = 1; visitedFaces.size < allFaces.size; hops++ ) {
      if ( hops > 100 ) {
        throw new Error( 'FaceColorDualFeature.fromPrimarySecondaryFaces: could not find all connections' );
      }
      const recur = ( face: TPatternFace, path: TPatternEdge[], initialFace: TPatternFace ) => {
        for ( const edge of face.edges ) {

          if ( edge.faces.length !== 2 ) {
            continue;
          }

          if ( path.includes( edge ) ) {
            continue;
          }

          const nextFace = edge.faces.find( f => f !== face )!;
          assertEnabled() && assert( nextFace );

          if ( visitedFaces.has( nextFace ) ) {
            continue;
          }

          if ( allFaces.has( nextFace ) ) {
            // Made a connection!!!!
            const completePath = [ ...path, edge ];

            const startFace = initialFace;
            const endFace = nextFace;

            const isSameColor = primaryFaces.includes( startFace ) === primaryFaces.includes( endFace );

            if ( isSameColor ) {
              sameColorPaths.push( completePath );
            }
            else {
              oppositeColorPaths.push( completePath );
            }

            // IMPORTANT: mark this face as solved!
            visitedFaces.add( nextFace );
          }
          else {
            recur( nextFace, [ ...path, edge ], initialFace );
          }
        }
      };

      [ ...visitedFaces ].forEach( face => recur( face, [], face ) );
    }

    return new FaceColorDualFeature( primaryFaces, secondaryFaces, sameColorPaths, oppositeColorPaths );
  }
}