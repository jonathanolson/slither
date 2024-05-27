import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TPatternFace } from '../pattern-board/TPatternFace.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicNot, logicOr } from '../../logic/operations.ts';
import { Embedding } from '../embedding/Embedding.ts';
import { TFeature } from './TFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import _ from '../../../workarounds/_.ts';

export class FaceNotStateFeature implements TEmbeddableFeature {
  public constructor(
    public readonly face: TPatternFace,
    public readonly blackEdges: TPatternEdge[],
    public readonly redEdges: TPatternEdge[]
  ) {}

  public toCanonicalString(): string {
    return `face-not-state-${this.face.index}-${_.sortBy( this.blackEdges.map( edge => edge.index ) ).join( ',' )}-${_.sortBy( this.redEdges.map( edge => edge.index ) ).join( ',' )}`;
  }

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

  public embedded( embedding: Embedding ): FaceNotStateFeature[] {
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

  public isSubsetOf( other: TFeature ): boolean {
    return this.equals( other );
  }

  public isRedundant( otherFeatures: TFeature[] ): boolean {
    return otherFeatures.some( feature => this.equals( feature ) || (
      feature instanceof BlackEdgeFeature && this.redEdges.includes( feature.edge )
    ) || (
                                            feature instanceof RedEdgeFeature && this.blackEdges.includes( feature.edge )
                                          ) );
  }

  public serialize(): TSerializedEmbeddableFeature {
    return {
      type: 'face-not-state',
      face: this.face.index,
      blackEdges: this.blackEdges.map( edge => edge.index ),
      redEdges: this.redEdges.map( edge => edge.index )
    };
  }

  public static deserialize( serialized: TSerializedEmbeddableFeature & { type: 'face-not-state' }, patternBoard: TPatternBoard ): FaceNotStateFeature {
    return new FaceNotStateFeature(
      patternBoard.faces[ serialized.face ],
      serialized.blackEdges.map( index => patternBoard.edges[ index ] ),
      serialized.redEdges.map( index => patternBoard.edges[ index ] )
    );
  }
}