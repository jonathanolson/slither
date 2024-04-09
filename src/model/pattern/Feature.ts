import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { Formula } from '../logic/Formula.ts';
import { Term } from '../logic/Term.ts';
import { logicExactlyN, logicExactlyOne, logicNot, logicNot1, logicOr, logicTrue } from '../logic/operations.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternSector } from './TPatternSector.ts';
import FaceValue from '../data/face-value/FaceValue.ts';

export class FaceFeature {

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

export class EdgeBlackFeature {
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

export class EdgeRedFeature {
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

export class FaceColorDualFeature {

  public readonly sameColorPaths: TPatternEdge[][] = [];
  public readonly oppositeColorPaths: TPatternEdge[][] = [];

  public constructor(
    public readonly primaryFaces: TPatternFace[],
    public readonly secondaryFaces: TPatternFace[],
  ) {
    assertEnabled() && assert( primaryFaces.length + secondaryFaces.length > 1 );
    assertEnabled() && assert( primaryFaces.length );

    const allFaces = new Set( [ ...primaryFaces, ...secondaryFaces ] );
    const firstFace = primaryFaces[ 0 ];
    const visitedFaces = new Set( [ firstFace ] );

    while ( visitedFaces.size < allFaces.size ) {

    }
  }
  //
  // public isPossibleWith(
  //   isEdgeBlack: ( edge: NumberEdge ) => boolean
  // ): boolean {
  //   let blackCount = 0;
  //   for ( let i = 0; i < this.edgesBetween.length; i++ ) {
  //     if ( isEdgeBlack( this.edgesBetween[ i ] ) ) {
  //       blackCount++;
  //     }
  //   }
  //
  //   return ( blackCount % 2 === 0 ) === this.areFacesSameColor;
  // }
  //
  // public getPossibleFormula(
  //   getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  // ): Formula<NumberEdge> {
  //   const formulas = this.edgesBetween.map( edge => getFormula( edge ) );
  //
  //   const possibleCounts = _.range( 0, formulas.length + 1 ).filter( count => ( count % 2 === 0 ) === this.areFacesSameColor );
  //
  //   return logicOr( possibleCounts.map( count => {
  //     if ( count === 0 ) {
  //       return logicAnd( formulas.map( formula => logicNot( formula ) ) );
  //     }
  //     else if ( count === formulas.length ) {
  //       return logicAnd( formulas );
  //     }
  //     else {
  //       return logicExactlyN( formulas, count );
  //     }
  //   } ) );
  // }
}

export class SectorOnlyOneFeature {
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

export class SectorNotOneFeature {
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

export class SectorNotZeroFeature {
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

export class SectorNotTwoFeature {
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

// export class VertexStateFeature {
//
//   public readonly type = 'vertex-state';
//
//   public constructor(
//     public readonly vertex: NumberVertex,
//     public readonly blackEdges: NumberEdge[],
//     public readonly redEdges: NumberEdge[]
//   ) {}
//
//   public isPossibleWith(
//     isEdgeBlack: ( edge: NumberEdge ) => boolean
//   ): boolean {
//     for ( const blackEdge of this.blackEdges ) {
//       if ( !isEdgeBlack( blackEdge ) ) {
//         return false;
//       }
//     }
//     for ( const redEdge of this.redEdges ) {
//       if ( isEdgeBlack( redEdge ) ) {
//         return false;
//       }
//     }
//     return true;
//   }
//
//   public getPossibleFormula(
//     getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
//   ): Formula<NumberEdge> {
//     return logicAnd( [
//       ...this.blackEdges.map( edge => getFormula( edge ) ),
//       ...this.redEdges.map( edge => logicNot( getFormula( edge ) ) )
//     ] );
//   }
// }
//
// export class FaceStateFeature {
//
//   public readonly type = 'face-state';
//
//   public constructor(
//     public readonly face: NumberFace,
//     public readonly blackEdges: NumberEdge[],
//     public readonly redEdges: NumberEdge[]
//   ) {}
//
//   public isPossibleWith(
//     isEdgeBlack: ( edge: NumberEdge ) => boolean
//   ): boolean {
//     for ( const blackEdge of this.blackEdges ) {
//       if ( !isEdgeBlack( blackEdge ) ) {
//         return false;
//       }
//     }
//     for ( const redEdge of this.redEdges ) {
//       if ( isEdgeBlack( redEdge ) ) {
//         return false;
//       }
//     }
//     return true;
//   }
//
//   public getPossibleFormula(
//     getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
//   ): Formula<NumberEdge> {
//     return logicAnd( [
//       ...this.blackEdges.map( edge => getFormula( edge ) ),
//       ...this.redEdges.map( edge => logicNot( getFormula( edge ) ) )
//     ] );
//   }
// }
//
// export class NonzeroCrossingFeature {
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
// export class VertexFeature {
//
//   public readonly type = 'vertex';
//
//   public constructor(
//     public readonly edges: NumberEdge[]
//   ) {}
//
//   public isPossibleWith(
//     isEdgeBlack: ( edge: NumberEdge ) => boolean
//   ): boolean {
//     const blackCount = this.edges.filter( edge => isEdgeBlack( edge ) ).length;
//     return blackCount === 0 || blackCount === 2;
//   }
//
//   public getPossibleFormula(
//     getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
//   ): Formula<NumberEdge> {
//     return logicZeroOrTwo( this.edges.map( edge => getFormula( edge ) ) );
//   }
// }
//
// export class NoLoopsFeature {
//
//   public readonly type = 'no-loops';
//
//   public constructor(
//     public readonly possibleLoops: NumberEdge[][]
//   ) {}
//
//   public isPossibleWith(
//     isEdgeBlack: ( edge: NumberEdge ) => boolean
//   ): boolean {
//     return this.possibleLoops.every( loop => loop.some( edge => !isEdgeBlack( edge ) ) );
//   }
//
//   public getPossibleFormula(
//     getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
//   ): Formula<NumberEdge> {
//     return logicAnd( this.possibleLoops.map( loop => logicNotAll( loop.map( edge => getFormula( edge ) ) ) ) );
//   }
// }

// export type TFeature = {
//   isPossibleWith(
//     isEdgeBlack: ( edge: TPatternEdge ) => boolean
//   ): boolean;
//
//   getPossibleFormula(
//     getFormula: ( edge: TPatternEdge ) => Formula<TPatternEdge>
//   ): Formula<TPatternEdge>;
// } & ( {
//   type: 'vertex';
//   edges: TPatternEdge[];
// } | {
//   type: 'face';
//   face: TPatternFace;
//   value: number; // NOTE! TODO! We need a way of specifying a "blank" face for highlander rules
//   edges: TPatternEdge[];
// } | {
//   type: 'no-loops';
//   possibleLoops: TPatternEdge[][];
// } | {
//   type: 'edge-black' | 'edge-red';
//   edge: TPatternEdge;
// } | {
//   type: 'faces-same-color' | 'faces-opposite-color';
//   faceA: TPatternFace;
//   faceB: TPatternFace;
// } | {
//   type: 'sector-zero' | 'sector-one' | 'sector-two';
//   edgeA: TPatternEdge;
//   edgeB: TPatternEdge;
// } | {
//   type: 'sector-only-one' | 'sector-not-one' | 'sector-not-zero' | 'sector-not-two';
//   edgeA: TPatternEdge;
//   edgeB: TPatternEdge;
// } | {
//   type: 'vertex-state';
//   vertex: TPatternVertex;
//   blackEdges: TPatternEdge[];
//   redEdges: TPatternEdge[];
// } | {
//   type: 'face-state';
//   face: TPatternFace;
//   blackEdges: TPatternEdge[];
//   redEdges: TPatternEdge[];
// } | {
//   type: 'nonzero-crossing';
//   faceA: TPatternFace;
//   faceB: TPatternFace;
//   possiblePaths: TPatternEdge[][];
// } );
