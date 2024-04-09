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

  public applyEmbedding( embedding: Embedding ): TFeature[] {
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

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    // TODO: See if we... subset any? Hmmm?
    return otherFeatures.some( feature => this.equals( feature ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'face-color-dual',
      primaryFaces: this.primaryFaces.map( face => face.index ),
      secondaryFaces: this.secondaryFaces.map( face => face.index ),
      sameColorPaths: this.sameColorPaths.map( path => path.map( edge => edge.index ) ),
      oppositeColorPaths: this.oppositeColorPaths.map( path => path.map( edge => edge.index ) )
    };
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