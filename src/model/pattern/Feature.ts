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

export interface TFeature {
  isPossibleWith( isEdgeBlack: ( edge: TPatternEdge ) => boolean ): boolean;
  getPossibleFormula( getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge> ): Formula<TPatternEdge>;
}

export class VertexFeature implements TFeature {

  public constructor(
    public readonly edges: TPatternEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: TPatternEdge ) => boolean
  ): boolean {
    const blackCount = this.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === 0 || blackCount === 2;
  }

  public getPossibleFormula(
    getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>
  ): Formula<TPatternEdge> {
    return logicZeroOrTwo( this.edges.map( edge => getFormula( edge ) ) );
  }
}

export class NoLoopsFeature implements TFeature {

  public readonly possibleLoops: TPatternEdge[][];

  public constructor(
    public readonly patternBoard: TPatternBoard
  ) {
    this.possibleLoops = NoLoopsFeature.findLoops( patternBoard.edges, patternBoard.vertices ).map( set => [ ...set ] );
  }

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

export class FaceFeature implements TFeature {

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
}

export class EdgeBlackFeature implements TFeature {
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
}

export class EdgeRedFeature implements TFeature {
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
}

export class FaceColorDualFeature implements TFeature {

  public readonly sameColorPaths: TPatternEdge[][] = [];
  public readonly oppositeColorPaths: TPatternEdge[][] = [];
  public readonly allFaces: Set<TPatternFace> = new Set();

  public constructor(
    public readonly primaryFaces: TPatternFace[],
    public readonly secondaryFaces: TPatternFace[],
  ) {
    assertEnabled() && assert( primaryFaces.length + secondaryFaces.length > 1 );
    assertEnabled() && assert( primaryFaces.length );

    const allFaces = new Set( [ ...primaryFaces, ...secondaryFaces ] );
    this.allFaces = allFaces;
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
              this.sameColorPaths.push( completePath );
            }
            else {
              this.oppositeColorPaths.push( completePath );
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
}

export class SectorOnlyOneFeature implements TFeature {
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
}

export class SectorNotOneFeature implements TFeature {
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
}

export class SectorNotZeroFeature implements TFeature {
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
}

export class SectorNotTwoFeature implements TFeature {
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
}

export class VertexNotEmptyFeature implements TFeature {
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
}

export class VertexNotPairFeature implements TFeature {
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
}

export class FaceNotStateFeature implements TFeature {
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