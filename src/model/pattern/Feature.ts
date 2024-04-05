import { FlexiEdge, FlexiFace, FlexiVertex } from './Flexiboard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import _ from '../../workarounds/_.ts';
import { Formula } from '../logic/Formula.ts';
import { Term } from '../logic/Term.ts';
import { logicAnd, logicExactlyN, logicNot, logicNotAll, logicOr, logicZeroOrTwo } from '../logic/operations.ts';

export type TFeature = {
  isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean;

  getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Formula<FlexiEdge>
  ): Formula<FlexiEdge>;
} & ( {
  type: 'vertex';
  edges: FlexiEdge[];
} | {
  type: 'face';
  face: FlexiFace;
  value: number;
  edges: FlexiEdge[];
} | {
  type: 'no-loops';
  possibleLoops: FlexiEdge[][];
} | {
  type: 'edge-black' | 'edge-red';
  edge: FlexiEdge;
} | {
  type: 'faces-same-color' | 'faces-opposite-color';
  faceA: FlexiFace;
  faceB: FlexiFace;
} | {
  type: 'sector-zero' | 'sector-one' | 'sector-two';
  edgeA: FlexiEdge;
  edgeB: FlexiEdge;
} | {
  type: 'vertex-state';
  vertex: FlexiVertex;
  blackEdges: FlexiEdge[];
  redEdges: FlexiEdge[];
} | {
  type: 'face-state';
  face: FlexiFace;
  blackEdges: FlexiEdge[];
  redEdges: FlexiEdge[];
} | {
  type: 'nonzero-crossing';
  faceA: FlexiFace;
  faceB: FlexiFace;
  possiblePaths: FlexiEdge[][];
} );

export class EdgeStateFeature {

  public readonly type: 'edge-black' | 'edge-red';

  public constructor(
    public readonly edge: FlexiEdge,
    public readonly isEdgeBlack: boolean
  ) {
    this.type = isEdgeBlack ? 'edge-black' : 'edge-red';
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean {
    return isEdgeBlack( this.edge ) === this.isEdgeBlack;
  }

  public getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    const isBlackFormula = getFormula( this.edge );
    return this.isEdgeBlack ? isBlackFormula : logicNot( isBlackFormula );
  }
}

export class FaceColorFeature {

  public readonly type: 'faces-same-color' | 'faces-opposite-color';

  public constructor(
    public readonly faceA: FlexiFace,
    public readonly faceB: FlexiFace,
    public readonly edgesBetween: FlexiEdge[],
    public readonly areFacesSameColor: boolean
  ) {
    this.type = areFacesSameColor ? 'faces-same-color' : 'faces-opposite-color';
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
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
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
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
    public readonly edgeA: FlexiEdge,
    public readonly edgeB: FlexiEdge,
    public readonly blackCount: number
  ) {
    assertEnabled() && assert( blackCount === 0 || blackCount === 1 || blackCount === 2 );

    this.type = `sector-${blackCount === 0 ? 'zero' : blackCount === 1 ? 'one' : 'two'}`;
  }

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean {
    return ( isEdgeBlack( this.edgeA ) ? 1 : 0 ) + ( isEdgeBlack( this.edgeB ) ? 1 : 0 ) === this.blackCount;
  }

  public getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    const isBlackA = getFormula( this.edgeA );
    const isBlackB = getFormula( this.edgeB );

    if ( this.blackCount === 0 ) {
      return logicAnd( [ logicNot( isBlackA ), logicNot( isBlackB ) ] );
    }
    else if ( this.blackCount === 1 ) {
      return logicExactlyN( [ isBlackA, isBlackB ], 1 );
    }
    else {
      return logicAnd( [ isBlackA, isBlackB ] );
    }
  }
}

export class VertexStateFeature {

  public readonly type = 'vertex-state';

  public constructor(
    public readonly vertex: FlexiVertex,
    public readonly blackEdges: FlexiEdge[],
    public readonly redEdges: FlexiEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
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
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    return logicAnd( [
      ...this.blackEdges.map( edge => getFormula( edge ) ),
      ...this.redEdges.map( edge => logicNot( getFormula( edge ) ) )
    ] );
  }
}

export class FaceStateFeature {

  public readonly type = 'face-state';

  public constructor(
    public readonly face: FlexiFace,
    public readonly blackEdges: FlexiEdge[],
    public readonly redEdges: FlexiEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
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
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    return logicAnd( [
      ...this.blackEdges.map( edge => getFormula( edge ) ),
      ...this.redEdges.map( edge => logicNot( getFormula( edge ) ) )
    ] );
  }
}

export class NonzeroCrossingFeature {

  public readonly type = 'nonzero-crossing';

  public constructor(
    public readonly faceA: FlexiFace,
    public readonly faceB: FlexiFace,
    public readonly possiblePaths: FlexiEdge[][]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean {
    for ( const path of this.possiblePaths ) {
      if ( !path.some( edge => isEdgeBlack( edge ) ) ) {
        return false;
      }
    }
    return true;
  }

  public getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    // Require at least 1 black edge for all paths
    return logicAnd( this.possiblePaths.map( path => logicOr( path.map( edge => getFormula( edge ) ) ) ) );
  }
}

export class VertexFeature {

  public readonly type = 'vertex';

  public constructor(
    public readonly edges: FlexiEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean {
    const blackCount = this.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === 0 || blackCount === 2;
  }

  public getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    return logicZeroOrTwo( this.edges.map( edge => getFormula( edge ) ) );
  }
}

export class FaceFeature {

  public readonly type = 'face';

  public constructor(
    public readonly face: FlexiFace,
    public readonly value: number,
    public readonly edges: FlexiEdge[]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean {
    const blackCount = this.edges.filter( edge => isEdgeBlack( edge ) ).length;
    return blackCount === this.value;
  }

  public getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    return logicExactlyN( this.edges.map( edge => getFormula( edge ) ), this.value );
  }
}

export class NoLoopsFeature {

  public readonly type = 'no-loops';

  public constructor(
    public readonly possibleLoops: FlexiEdge[][]
  ) {}

  public isPossibleWith(
    isEdgeBlack: ( edge: FlexiEdge ) => boolean
  ): boolean {
    return this.possibleLoops.every( loop => loop.some( edge => !isEdgeBlack( edge ) ) );
  }

  public getPossibleFormula(
    getFormula: ( edge: FlexiEdge ) => Term<FlexiEdge>
  ): Formula<FlexiEdge> {
    return logicAnd( this.possibleLoops.map( loop => logicNotAll( loop.map( edge => getFormula( edge ) ) ) ) );
  }
}
