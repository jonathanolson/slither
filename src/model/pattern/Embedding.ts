import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternBoard } from './TPatternBoard.ts';

export class Embedding {

  public readonly isAutomorphism: boolean;
  public readonly isIdentityAutomorphism: boolean;

  // Defined if it is an automorphism
  public readonly vertexInverseMap?: Map<TPatternVertex, TPatternVertex>;
  public readonly edgeInverseMap?: Map<TPatternEdge, TPatternEdge>;
  public readonly sectorInverseMap?: Map<TPatternSector, TPatternSector>;
  public readonly faceInverseMap?: Map<TPatternFace, TPatternFace>;

  public constructor(
    public readonly sourcePatternBoard: TPatternBoard,
    public readonly targetPatternBoard: TPatternBoard,
    // TODO: consider alternate implementation with fewer objects?
    public readonly vertexMap: Map<TPatternVertex, TPatternVertex>,
    public readonly nonExitEdgeMap: Map<TPatternEdge, TPatternEdge>,
    public readonly exitEdgeMap: Map<TPatternEdge, TPatternEdge[]>,
    public readonly sectorMap: Map<TPatternSector, TPatternSector>,
    public readonly faceMap: Map<TPatternFace, TPatternFace>,
  ) {
    this.isAutomorphism = sourcePatternBoard === targetPatternBoard;

    if ( this.isAutomorphism ) {
      this.vertexInverseMap = new Map( Array.from( vertexMap ).map( ( [ key, value ] ) => [ value, key ] ) );
      this.sectorInverseMap = new Map( Array.from( sectorMap ).map( ( [ key, value ] ) => [ value, key ] ) );
      this.faceInverseMap = new Map( Array.from( faceMap ).map( ( [ key, value ] ) => [ value, key ] ) );

      this.edgeInverseMap = new Map( [
        ...Array.from( nonExitEdgeMap ).map( ( [ key, value ] ) => [ value, key ] ) as [ TPatternEdge, TPatternEdge ][],
        ...Array.from( exitEdgeMap ).map( ( [ key, value ] ) => {
          assertEnabled() && assert( value.length === 1 );

          return [ value[ 0 ], key ];
        } ) as [ TPatternEdge, TPatternEdge ][]
      ] );
    }

    this.isIdentityAutomorphism = this.computeIsIdentityAutomorphism();
  }

  public mapVertex( vertex: TPatternVertex ): TPatternVertex {
    const result = this.vertexMap.get( vertex )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapNonExitEdge( edge: TPatternEdge ): TPatternEdge {
    const result = this.nonExitEdgeMap.get( edge )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapExitEdges( edge: TPatternEdge ): TPatternEdge[] {
    const result = this.exitEdgeMap.get( edge )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapSector( sector: TPatternSector ): TPatternSector {
    const result = this.sectorMap.get( sector )!;
    assertEnabled() && assert( result );

    return result;
  }

  public mapFace( face: TPatternFace ): TPatternFace {
    const result = this.faceMap.get( face )!;
    assertEnabled() && assert( result );

    return result;
  }

  public equals( embedding: Embedding ): boolean {
    return (
      this.vertexMap.size === embedding.vertexMap.size &&
      this.nonExitEdgeMap.size === embedding.nonExitEdgeMap.size &&
      this.exitEdgeMap.size === embedding.exitEdgeMap.size &&
      this.sectorMap.size === embedding.sectorMap.size &&
      this.faceMap.size === embedding.faceMap.size &&
      Array.from( this.vertexMap ).every( ( [ vertex, mappedVertex ] ) => embedding.vertexMap.get( vertex ) === mappedVertex ) &&
      Array.from( this.nonExitEdgeMap ).every( ( [ edge, mappedEdge ] ) => embedding.nonExitEdgeMap.get( edge ) === mappedEdge ) &&
      Array.from( this.exitEdgeMap ).every( ( [ edge, mappedEdges ] ) => embedding.exitEdgeMap.get( edge ) === mappedEdges ) &&
      Array.from( this.sectorMap ).every( ( [ sector, mappedSector ] ) => embedding.sectorMap.get( sector ) === mappedSector ) &&
      Array.from( this.faceMap ).every( ( [ face, mappedFace ] ) => embedding.faceMap.get( face ) === mappedFace )
    );
  }

  public toString(): string {
    return `Embedding(\n` +
      `  vertexMap: ${[ ...this.vertexMap ].map( pair => `${pair[ 0 ].index} ${pair[ 0 ].isExit ? '->' : '=>' } ${pair[ 1 ].index}` ).join( ', ' )}\n` +
      `  nonExitEdgeMap: ${[ ...this.nonExitEdgeMap ].map( pair => `${pair[ 0 ].index} => ${pair[ 1 ].index}` ).join( ', ' )}\n` +
      `  exitEdgeMap: ${[ ...this.exitEdgeMap ].map( pair => `${pair[ 0 ].index} => [${pair[ 1 ].map( edge => edge.index ).join( ', ' )}]` ).join( ', ' )}\n` +
      `  sectorMap: ${[ ...this.sectorMap ].map( pair => `${pair[ 0 ].index} => ${pair[ 1 ].index}` ).join( ', ' )}\n` +
      `  faceMap: ${[ ...this.faceMap ].map( pair => `${pair[ 0 ].index} ${pair[ 0 ].isExit ? '->' : '=>' } ${pair[ 1 ].index}` ).join( ', ' )}\n` +
      `)`;
  }

  private computeIsIdentityAutomorphism(): boolean {
    if ( this.sourcePatternBoard !== this.targetPatternBoard ) {
      return false;
    }

    for ( const vertex of this.vertexMap.keys() ) {
      if ( this.vertexMap.get( vertex ) !== vertex ) {
        return false;
      }
    }

    for ( const edge of this.nonExitEdgeMap.keys() ) {
      if ( this.nonExitEdgeMap.get( edge ) !== edge ) {
        return false;
      }
    }

    for ( const edge of this.exitEdgeMap.keys() ) {
      if ( this.exitEdgeMap.get( edge )!.length !== 1 || this.exitEdgeMap.get( edge )![ 0 ] !== edge ) {
        return false;
      }
    }

    for ( const sector of this.sectorMap.keys() ) {
      if ( this.sectorMap.get( sector ) !== sector ) {
        return false;
      }
    }

    for ( const face of this.faceMap.keys() ) {
      if ( this.faceMap.get( face ) !== face ) {
        return false;
      }
    }

    return true;
  }
}