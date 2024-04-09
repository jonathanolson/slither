import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { Formula } from '../logic/Formula.ts';
import { Term } from '../logic/Term.ts';
import { logicAnd, logicEven, logicExactlyN, logicExactlyOne, logicNot, logicNot1, logicNotAll, logicOdd, logicOr, logicTrue, logicZeroOrTwo } from '../logic/operations.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { Embedding } from './Embedding.ts';

export interface TFeature {
  isPossibleWith( isEdgeBlack: ( edge: TPatternEdge ) => boolean ): boolean;
  getPossibleFormula( getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge> ): Formula<TPatternEdge>;
}

export interface TEmbeddableFeature extends TFeature {
  applyEmbedding( embedding: Embedding ): TFeature[];
  isRedundant( otherFeatures: TFeature[] ): boolean;
  equals( other: TFeature ): boolean;
  indexEquals( other: TFeature ): boolean;

  // TODO: serialization(?)!!!
}

export class VertexFeature implements TFeature {

  public constructor(
    public readonly vertex: TPatternVertex
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.vertex.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === 0 || blackCount === 2;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicZeroOrTwo( this.vertex.edges.map( edge => getFormula( edge ) ) );
  }
}

export class NoLoopsFeature implements TFeature {

  public constructor(
    public readonly possibleLoops: TPatternEdge[][]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return this.possibleLoops.every( loop => loop.some( edge => !isEdgeBlack( edge ) ) );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicAnd( this.possibleLoops.map( loop => logicNotAll( loop.map( edge => getFormula( edge ) ) ) ) );
  }

  public static fromBoard( patternBoard: TPatternBoard ): NoLoopsFeature {
    return new NoLoopsFeature( NoLoopsFeature.findLoops( patternBoard.edges, patternBoard.vertices ).map( set => [ ...set ] ) );
  }

  public static findLoops( edges: TPatternEdge[], vertices: TPatternVertex[] ): Set<TPatternEdge>[] {
    const loops: Set<TPatternEdge>[] = [];
    const loopIdentifiers = new Set<string>();

    const visitedVertices = new Set<TPatternVertex>();
    const path: TPatternEdge[] = [];

    const recur = ( currentVertex: TPatternVertex, startVertex: TPatternVertex ) => {
      for ( const edge of currentVertex.edges ) {
        if ( edge.vertices.length < 2 ) {
          continue;
        }

        const nextVertex = edge.vertices.find( v => v !== currentVertex )!;
        assertEnabled() && assert( nextVertex );

        if ( visitedVertices.has( nextVertex ) ) {
          continue;
        }

        if ( nextVertex === startVertex ) {
          assertEnabled() && assert( path.length >= 3 );

          const loop = [ ...path, edge ];

          const loopIdentifier = loop.map( edge => edge.index ).sort().join( ',' );
          if ( !loopIdentifiers.has( loopIdentifier ) ) {
            loopIdentifiers.add( loopIdentifier );
            loops.push( new Set( loop ) );
          }
        }
        else {
          visitedVertices.add( nextVertex );

          path.push( edge );
          recur( nextVertex, startVertex );
          path.pop();

          visitedVertices.delete( nextVertex );
        }
      }
    };

    for ( const vertex of vertices ) {
      recur( vertex, vertex );
    }

    return loops;
  }
}

export class FaceFeature implements TEmbeddableFeature {

  public constructor(
    public readonly face: TPatternFace,
    public readonly value: FaceValue
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.face.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === this.value;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    if ( this.value === null ) {
      return logicTrue;
    }
    else {
      return logicExactlyN( this.face.edges.map( edge => getFormula( edge ) ), this.value );
    }
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new FaceFeature( embedding.mapFace( this.face ), this.value ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof FaceFeature && other.face === this.face && other.value === this.value;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof FaceFeature && other.face.index === this.face.index && other.value === this.value;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) );
  }
}

export class BlackEdgeFeature implements TEmbeddableFeature {
  public constructor(
    public readonly edge: TPatternEdge
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return isEdgeBlack( this.edge );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return getFormula( this.edge );
  }

  public applyEmbedding( embedding: Embedding ): BlackEdgeFeature[] {
    if ( this.edge.isExit ) {
      // WE DO NOT EMBED BLACK EXIT EDGES
      return [];
    }
    else {
      return [ new BlackEdgeFeature( embedding.mapNonExitEdge( this.edge ) ) ];
    }
  }

  public equals( other: TFeature ): boolean {
    return other instanceof BlackEdgeFeature && other.edge === this.edge;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof BlackEdgeFeature && other.edge.index === this.edge.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) );
  }
}

export class RedEdgeFeature implements TEmbeddableFeature {
  public constructor(
    public readonly edge: TPatternEdge
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return !isEdgeBlack( this.edge );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicNot( getFormula( this.edge ) );
  }

  public applyEmbedding( embedding: Embedding ): RedEdgeFeature[] {
    if ( this.edge.isExit ) {
      // NOTE: Can potentially embed to multiple red edges
      return embedding.mapExitEdges( this.edge ).map( edge => new RedEdgeFeature( edge ) );
    }
    else {
      return [ new RedEdgeFeature( embedding.mapNonExitEdge( this.edge ) ) ];
    }
  }

  public equals( other: TFeature ): boolean {
    return other instanceof RedEdgeFeature && other.edge === this.edge;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof RedEdgeFeature && other.edge.index === this.edge.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) );
  }
}

export class FaceColorDualFeature implements TEmbeddableFeature {

  public readonly allFaces: Set<TPatternFace> = new Set();

  public constructor(
    public readonly primaryFaces: TPatternFace[],
    public readonly secondaryFaces: TPatternFace[],
    public readonly sameColorPaths: TPatternEdge[][],
    public readonly oppositeColorPaths: TPatternEdge[][],
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

export class SectorOnlyOneFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === 1;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicExactlyOne( this.sector.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new SectorOnlyOneFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorOnlyOneFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorOnlyOneFeature && other.sector.index === this.sector.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    if ( otherFeatures.some( feature => this.equals( feature ) ) ) {
      return true;
    }

    let hasBlack = false;
    let hasRed = false;

    for ( const otherFeature of otherFeatures ) {
      if ( otherFeature instanceof BlackEdgeFeature && this.sector.edges.includes( otherFeature.edge ) ) {
        hasBlack = true;
      }
      else if ( otherFeature instanceof RedEdgeFeature && this.sector.edges.includes( otherFeature.edge ) ) {
        hasRed = true;
      }
    }

    return hasBlack && hasRed;
  }
}

export class SectorNotOneFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount !== 1;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicNot1( this.sector.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new SectorNotOneFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorNotOneFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorNotOneFeature && other.sector.index === this.sector.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    if ( otherFeatures.some( feature => this.equals( feature ) ) ) {
      return true;
    }

    // Track this, so we handle duplicated reds/blacks in our otherFeatures array robustly
    let firstEdgeBlack = false;
    let secondEdgeBlack = false;
    let firstEdgeRed = false;
    let secondEdgeRed = false;

    const firstEdge = this.sector.edges[ 0 ];
    const secondEdge = this.sector.edges[ 1 ];

    for ( const otherFeature of otherFeatures ) {
      if ( otherFeature instanceof BlackEdgeFeature ) {
        if ( otherFeature.edge === firstEdge ) {
          firstEdgeBlack = true;
        }
        else if ( otherFeature.edge === secondEdge ) {
          secondEdgeBlack = true;
        }
      }
      if ( otherFeature instanceof RedEdgeFeature ) {
        if ( otherFeature.edge === firstEdge ) {
          firstEdgeRed = true;
        }
        else if ( otherFeature.edge === secondEdge ) {
          secondEdgeRed = true;
        }
      }
    }

    return ( firstEdgeBlack && secondEdgeBlack ) || ( firstEdgeRed && secondEdgeRed );
  }
}

export class SectorNotZeroFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount !== 0;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicOr( this.sector.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new SectorNotZeroFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorNotZeroFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorNotZeroFeature && other.sector.index === this.sector.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => {
      return this.equals( feature ) || ( feature instanceof BlackEdgeFeature && this.sector.edges.includes( feature.edge ) );
    } );
  }
}

export class SectorNotTwoFeature implements TEmbeddableFeature {
  public constructor(
    public readonly sector: TPatternSector
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.sector.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount !== 2;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicOr( this.sector.edges.map( edge => logicNot( getFormula( edge ) ) ) );
  }


  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new SectorNotTwoFeature( embedding.mapSector( this.sector ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof SectorNotTwoFeature && other.sector === this.sector;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof SectorNotTwoFeature && other.sector.index === this.sector.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => {
      return this.equals( feature ) || ( feature instanceof RedEdgeFeature && this.sector.edges.includes( feature.edge ) );
    } );
  }
}

export class VertexNotEmptyFeature implements TEmbeddableFeature {
  public constructor(
    public readonly vertex: TPatternVertex
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return this.vertex.edges.some( edge => isEdgeBlack( edge ) );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicOr( this.vertex.edges.map( edge => getFormula( edge ) ) );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new VertexNotEmptyFeature( embedding.mapVertex( this.vertex ) ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof VertexNotEmptyFeature && other.vertex === this.vertex;
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof VertexNotEmptyFeature && other.vertex.index === this.vertex.index;
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) || ( feature instanceof BlackEdgeFeature && feature.edge.vertices.includes( this.vertex ) ) );
  }
}

export class VertexNotPairFeature implements TEmbeddableFeature {
  public constructor(
    public readonly vertex: TPatternVertex,
    public readonly edgeA: TPatternEdge,
    public readonly edgeB: TPatternEdge
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    return isEdgeBlack( this.edgeA ) || isEdgeBlack( this.edgeB );
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicNotAll( [ getFormula( this.edgeA ), getFormula( this.edgeB ) ] );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    if ( this.edgeA.isExit ) {
      const exitEdges = embedding.mapExitEdges( this.edgeA );
      return exitEdges.map( edge => new VertexNotPairFeature( embedding.mapVertex( this.vertex ), edge, embedding.mapNonExitEdge( this.edgeB ) ) );
    }
    else if ( this.edgeB.isExit ) {
      const exitEdges = embedding.mapExitEdges( this.edgeB );
      return exitEdges.map( edge => new VertexNotPairFeature( embedding.mapVertex( this.vertex ), embedding.mapNonExitEdge( this.edgeA ), edge ) );
    }
    else {
      return [ new VertexNotPairFeature( embedding.mapVertex( this.vertex ), embedding.mapNonExitEdge( this.edgeA ), embedding.mapNonExitEdge( this.edgeB ) ) ];
    }
  }

  public equals( other: TFeature ): boolean {
    return other instanceof VertexNotPairFeature && other.vertex === this.vertex && (
      ( other.edgeA === this.edgeA && other.edgeB === this.edgeB ) ||
      ( other.edgeA === this.edgeB && other.edgeB === this.edgeA )
    );
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof VertexNotPairFeature && other.vertex.index === this.vertex.index && (
      ( other.edgeA.index === this.edgeA.index && other.edgeB.index === this.edgeB.index ) ||
      ( other.edgeA.index === this.edgeB.index && other.edgeB.index === this.edgeA.index )
    );
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) || (
      feature instanceof BlackEdgeFeature && feature.edge !== this.edgeA && feature.edge !== this.edgeB
    ) || (
      feature instanceof RedEdgeFeature && ( feature.edge === this.edgeA || feature.edge === this.edgeB )
    ) );
  }
}

export class FaceNotStateFeature implements TEmbeddableFeature {
  public constructor(
    public readonly face: TPatternFace,
    public readonly blackEdges: TPatternEdge[],
    public readonly redEdges: TPatternEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    for ( const blackEdge of this.blackEdges ) {
      if ( !isEdgeBlack( blackEdge ) ) {
        return true;
      }
    }
    for ( const redEdge of this.redEdges ) {
      if ( isEdgeBlack( redEdge ) ) {
        return true;
      }
    }
    return false;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicOr( [
      ...this.blackEdges.map( edge => logicNot( getFormula( edge ) ) ),
      ...this.redEdges.map( edge => getFormula( edge ) )
    ] );
  }

  public applyEmbedding( embedding: Embedding ): TFeature[] {
    return [ new FaceNotStateFeature(
      embedding.mapFace( this.face ),
      this.blackEdges.map( edge => embedding.mapNonExitEdge( edge ) ),
      this.redEdges.map( edge => embedding.mapNonExitEdge( edge ) )
    ) ];
  }

  public equals( other: TFeature ): boolean {
    return other instanceof FaceNotStateFeature && other.face === this.face &&
      this.blackEdges.length === other.blackEdges.length &&
      this.redEdges.length === other.redEdges.length &&
      this.blackEdges.every( edge => other.blackEdges.includes( edge ) ) &&
      this.redEdges.every( edge => other.redEdges.includes( edge ) );
  }

  public indexEquals( other: TFeature ): boolean {
    return other instanceof FaceNotStateFeature && other.face.index === this.face.index &&
      this.blackEdges.length === other.blackEdges.length &&
      this.redEdges.length === other.redEdges.length &&
      this.blackEdges.every( edge => other.blackEdges.some( otherEdge => otherEdge.index === edge.index ) ) &&
      this.redEdges.every( edge => other.redEdges.some( otherEdge => otherEdge.index === edge.index ) );
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) || (
      feature instanceof BlackEdgeFeature && this.redEdges.includes( feature.edge )
    ) || (
      feature instanceof RedEdgeFeature && this.blackEdges.includes( feature.edge )
    ) );
  }
}

// export class NonzeroCrossingFeature implements TFeature {
//
//   public readonly type = 'nonzero-crossing';
//
//   public constructor(
//     public readonly faceA: NumberFace,
//     public readonly faceB: NumberFace,
//     public readonly possiblePaths: NumberEdge[][]
//   ) {}
//
//   public isPossibleWith(
//     isEdgeBlack: ( edge: NumberEdge ) => boolean
//   ): boolean {
//     for ( const path of this.possiblePaths ) {
//       if ( !path.some( edge => isEdgeBlack( edge ) ) ) {
//         return false;
//       }
//     }
//     return true;
//   }
//
//   public getPossibleFormula(
//     getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
//   ): Formula<NumberEdge> {
//     // Require at least 1 black edge for all paths
//     return logicAnd( this.possiblePaths.map( path => logicOr( path.map( edge => getFormula( edge ) ) ) ) );
//   }
// }
//