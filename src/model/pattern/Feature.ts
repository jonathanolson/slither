import { NumberEdge, NumberFace, NumberVertex } from './FaceTopology.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import _ from '../../workarounds/_.ts';
import { Formula } from '../logic/Formula.ts';
import { Term } from '../logic/Term.ts';
import { logicAnd, logicExactlyN, logicExactlyOne, logicNot, logicNot1, logicNotAll, logicOr, logicZeroOrTwo } from '../logic/operations.ts';

export type TFeature = {
  isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean;

  getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Formula<NumberEdge>
  ): Formula<NumberEdge>;
} & ( {
  type: 'vertex';
  edges: NumberEdge[];
} | {
  type: 'face';
  face: NumberFace;
  value: number;
  edges: NumberEdge[];
} | {
  type: 'no-loops';
  possibleLoops: NumberEdge[][];
} | {
  type: 'edge-black' | 'edge-red';
  edge: NumberEdge;
} | {
  type: 'faces-same-color' | 'faces-opposite-color';
  faceA: NumberFace;
  faceB: NumberFace;
} | {
  type: 'sector-zero' | 'sector-one' | 'sector-two';
  edgeA: NumberEdge;
  edgeB: NumberEdge;
} | {
  type: 'sector-only-one' | 'sector-not-one' | 'sector-not-zero' | 'sector-not-two';
  edgeA: NumberEdge;
  edgeB: NumberEdge;
} | {
  type: 'vertex-state';
  vertex: NumberVertex;
  blackEdges: NumberEdge[];
  redEdges: NumberEdge[];
} | {
  type: 'face-state';
  face: NumberFace;
  blackEdges: NumberEdge[];
  redEdges: NumberEdge[];
} | {
  type: 'nonzero-crossing';
  faceA: NumberFace;
  faceB: NumberFace;
  possiblePaths: NumberEdge[][];
} );

export class EdgeStateFeature {

  public readonly type: 'edge-black' | 'edge-red';

  public constructor(
    public readonly edge: NumberEdge,
    public readonly isEdgeBlack: boolean
  ) {
    this.type = isEdgeBlack ? 'edge-black' : 'edge-red';
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    return isEdgeBlack( this.edge ) === this.isEdgeBlack;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    const isBlackFormula = getFormula( this.edge );
    return this.isEdgeBlack ? isBlackFormula : logicNot( isBlackFormula );
  }
}

export class FaceColorFeature {

  public readonly type: 'faces-same-color' | 'faces-opposite-color';

  public constructor(
    public readonly faceA: NumberFace,
    public readonly faceB: NumberFace,
    public readonly edgesBetween: NumberEdge[],
    public readonly areFacesSameColor: boolean
  ) {
    this.type = areFacesSameColor ? 'faces-same-color' : 'faces-opposite-color';
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    let blackCount = 0;
    for ( let i = 0; i < this.edgesBetween.length; i++ ) {
      if ( isEdgeBlack( this.edgesBetween[ i ] ) ) {
        blackCount++;
      }
    }

    return ( blackCount % 2 === 0 ) === this.areFacesSameColor;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    const formulas = this.edgesBetween.map( edge => getFormula( edge ) );

    const possibleCounts = _.range( 0, formulas.length + 1 ).filter( count => ( count % 2 === 0 ) === this.areFacesSameColor );

    return logicOr( possibleCounts.map( count => {
      if ( count === 0 ) {
        return logicAnd( formulas.map( formula => logicNot( formula ) ) );
      }
      else if ( count === formulas.length ) {
        return logicAnd( formulas );
      }
      else {
        return logicExactlyN( formulas, count );
      }
    } ) );
  }
}

export class SectorStateFeature {

  public readonly type: 'sector-zero' | 'sector-one' | 'sector-two';

  public constructor(
    public readonly edgeA: NumberEdge,
    public readonly edgeB: NumberEdge,
    public readonly blackCount: number
  ) {
    assertEnabled() && assert( blackCount === 0 || blackCount === 1 || blackCount === 2 );

    this.type = `sector-${blackCount === 0 ? 'zero' : blackCount === 1 ? 'one' : 'two'}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    return ( isEdgeBlack( this.edgeA ) ? 1 : 0 ) + ( isEdgeBlack( this.edgeB ) ? 1 : 0 ) === this.blackCount;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    const isBlackA = getFormula( this.edgeA );
    const isBlackB = getFormula( this.edgeB );

    if ( this.blackCount === 0 ) {
      return logicAnd( [ logicNot( isBlackA ), logicNot( isBlackB ) ] );
    }
    else if ( this.blackCount === 1 ) {
      return logicExactlyOne( [ isBlackA, isBlackB ] );
    }
    else {
      return logicAnd( [ isBlackA, isBlackB ] );
    }
  }
}

export class SectorSimpleFeature {

  public constructor(
    public readonly edgeA: NumberEdge,
    public readonly edgeB: NumberEdge,
    public readonly type: 'sector-only-one' | 'sector-not-one' | 'sector-not-zero' | 'sector-not-two'
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    const blackCount = ( isEdgeBlack( this.edgeA ) ? 1 : 0 ) + ( isEdgeBlack( this.edgeB ) ? 1 : 0 );

    switch ( this.type ) {
      case 'sector-only-one': return blackCount === 1;
      case 'sector-not-one': return blackCount !== 1;
      case 'sector-not-zero': return blackCount !== 0;
      case 'sector-not-two': return blackCount !== 2;
      default: throw new Error( 'Invalid type' );
    }
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    const isBlackA = getFormula( this.edgeA );
    const isBlackB = getFormula( this.edgeB );

    switch ( this.type ) {
      case 'sector-only-one': return logicExactlyOne( [ isBlackA, isBlackB ] );
      case 'sector-not-one': return logicNot1( [ isBlackA, isBlackB ] );
      case 'sector-not-zero': return logicOr( [ isBlackA, isBlackB ] );
      case 'sector-not-two': return logicOr( [ logicNot( isBlackA ), logicNot( isBlackB ) ] );
      default: throw new Error( 'Invalid type' );
    }
  }
}

export class VertexStateFeature {

  public readonly type = 'vertex-state';

  public constructor(
    public readonly vertex: NumberVertex,
    public readonly blackEdges: NumberEdge[],
    public readonly redEdges: NumberEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    for ( const blackEdge of this.blackEdges ) {
      if ( !isEdgeBlack( blackEdge ) ) {
        return false;
      }
    }
    for ( const redEdge of this.redEdges ) {
      if ( isEdgeBlack( redEdge ) ) {
        return false;
      }
    }
    return true;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    return logicAnd( [
      ...this.blackEdges.map( edge => getFormula( edge ) ),
      ...this.redEdges.map( edge => logicNot( getFormula( edge ) ) )
    ] );
  }
}

export class FaceStateFeature {

  public readonly type = 'face-state';

  public constructor(
    public readonly face: NumberFace,
    public readonly blackEdges: NumberEdge[],
    public readonly redEdges: NumberEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    for ( const blackEdge of this.blackEdges ) {
      if ( !isEdgeBlack( blackEdge ) ) {
        return false;
      }
    }
    for ( const redEdge of this.redEdges ) {
      if ( isEdgeBlack( redEdge ) ) {
        return false;
      }
    }
    return true;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    return logicAnd( [
      ...this.blackEdges.map( edge => getFormula( edge ) ),
      ...this.redEdges.map( edge => logicNot( getFormula( edge ) ) )
    ] );
  }
}

export class NonzeroCrossingFeature {

  public readonly type = 'nonzero-crossing';

  public constructor(
    public readonly faceA: NumberFace,
    public readonly faceB: NumberFace,
    public readonly possiblePaths: NumberEdge[][]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    for ( const path of this.possiblePaths ) {
      if ( !path.some( edge => isEdgeBlack( edge ) ) ) {
        return false;
      }
    }
    return true;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    // Require at least 1 black edge for all paths
    return logicAnd( this.possiblePaths.map( path => logicOr( path.map( edge => getFormula( edge ) ) ) ) );
  }
}

export class VertexFeature {

  public readonly type = 'vertex';

  public constructor(
    public readonly edges: NumberEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    const blackCount = this.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === 0 || blackCount === 2;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    return logicZeroOrTwo( this.edges.map( edge => getFormula( edge ) ) );
  }
}

export class FaceFeature {

  public readonly type = 'face';

  public constructor(
    public readonly face: NumberFace,
    public readonly value: number,
    public readonly edges: NumberEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    const blackCount = this.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === this.value;
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    return logicExactlyN( this.edges.map( edge => getFormula( edge ) ), this.value );
  }
}

export class NoLoopsFeature {

  public readonly type = 'no-loops';

  public constructor(
    public readonly possibleLoops: NumberEdge[][]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: NumberEdge ) => boolean
  ): boolean {
    return this.possibleLoops.every( loop => loop.some( edge => !isEdgeBlack( edge ) ) );
  }

  public getPossibleFormula(
    getFormula: ( edge: NumberEdge ) => Term<NumberEdge>
  ): Formula<NumberEdge> {
    return logicAnd( this.possibleLoops.map( loop => logicNotAll( loop.map( edge => getFormula( edge ) ) ) ) );
  }
}
