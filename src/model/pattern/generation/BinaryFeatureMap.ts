import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { ConnectedFacePair, FaceConnectivity } from '../FaceConnectivity.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { TPatternSector } from '../pattern-board/TPatternSector.ts';
import { TEmbeddableFeature } from '../feature/TEmbeddableFeature.ts';
import { RedEdgeFeature } from '../feature/RedEdgeFeature.ts';
import { BlackEdgeFeature } from '../feature/BlackEdgeFeature.ts';
import { SectorNotZeroFeature } from '../feature/SectorNotZeroFeature.ts';
import { SectorNotOneFeature } from '../feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../feature/SectorNotTwoFeature.ts';
import { FaceColorDualFeature } from '../feature/FaceColorDualFeature.ts';
import _ from '../../../workarounds/_.ts';
import { IncompatibleFeatureError } from '../feature/IncompatibleFeatureError.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';

export type BinaryFeatureMapOptions = {
  solveEdges: boolean;
  solveFaceColors: boolean;
  solveSectors: boolean;
};

export class BinaryFeatureMap {

  public readonly numAttributes: number;

  public readonly numNonExitEdges: number;

  public readonly sectorBaseIndex: number;
  public readonly facePairBaseIndex: number;

  public readonly extraPairs: ConnectedFacePair[] = [];

  // Ordered by the bit index
  public readonly primaryFeatures: TEmbeddableFeature[] = [];
  public readonly allFeatures: TEmbeddableFeature[][] = [];

  public readonly empty = 0n;
  public readonly full: bigint;

  public constructor(
    public readonly patternBoard: TPatternBoard,
    options: BinaryFeatureMapOptions,
  ) {
    const faceConnectivity = FaceConnectivity.get( patternBoard );

    let numNonExitEdges = 0;

    let bitIndex = 0;
    if ( options.solveEdges ) {
      for ( const edge of patternBoard.edges ) {
        if ( edge.isExit ) {
          assertEnabled() && assert( bitIndex === edge.index + numNonExitEdges ); // because non-exit edges get two bits

          bitIndex++;

          const redFeature = new RedEdgeFeature( edge );
          this.primaryFeatures.push( redFeature );
          this.allFeatures.push( [ redFeature ] );
        }
        else {
          assertEnabled() && assert( bitIndex === 2 * edge.index );

          numNonExitEdges++;
          bitIndex += 2;

          const redFeature = new RedEdgeFeature( edge );
          const blackFeature = new BlackEdgeFeature( edge );
          this.primaryFeatures.push( redFeature );
          this.primaryFeatures.push( blackFeature );
          this.allFeatures.push( [ redFeature ] );
          this.allFeatures.push( [ blackFeature ] );
        }
      }
    }
    this.sectorBaseIndex = bitIndex;
    if ( options.solveSectors ) {
      for ( const sector of patternBoard.sectors ) {
        assertEnabled() && assert( bitIndex === 3 * sector.index + this.sectorBaseIndex );

        bitIndex += 3;

        const notZeroFeature = new SectorNotZeroFeature( sector );
        const notOneFeature = new SectorNotOneFeature( sector );
        const notTwoFeature = new SectorNotTwoFeature( sector );
        this.primaryFeatures.push( notZeroFeature );
        this.primaryFeatures.push( notOneFeature );
        this.primaryFeatures.push( notTwoFeature );
        this.allFeatures.push( [ notZeroFeature ] );
        this.allFeatures.push( [ notOneFeature ] );
        this.allFeatures.push( [ notTwoFeature ] );
      }
    }
    this.facePairBaseIndex = bitIndex;
    if ( options.solveFaceColors ) {
      for ( const pair of faceConnectivity.connectedFacePairs ) {
        // TODO: create FaceColorDualFeature directly (since we have the path info)
        const sameFeature = FaceColorDualFeature.fromPrimarySecondaryFaces( [ pair.a, pair.b ], [] );
        const oppositeFeature = FaceColorDualFeature.fromPrimarySecondaryFaces( [ pair.a ], [ pair.b ] );

        if ( options.solveEdges && pair.shortestPath.length === 1 ) {
          // Reuse the edge bits, since we have them
          this.allFeatures[ this.getNonExitRedIndex( pair.shortestPath[ 0 ] ) ].push( sameFeature );
          this.allFeatures[ this.getNonExitBlackIndex( pair.shortestPath[ 0 ] ) ].push( oppositeFeature );
        }
        else {
          // TODO: how do we, in the future, look these up in reverse?
          this.extraPairs.push( pair );

          bitIndex += 2;

          this.primaryFeatures.push( sameFeature );
          this.primaryFeatures.push( oppositeFeature );
          this.allFeatures.push( [ sameFeature ] );
          this.allFeatures.push( [ oppositeFeature ] );
        }
      }
    }

    this.numNonExitEdges = numNonExitEdges;
    this.numAttributes = bitIndex;
    this.full = ( 1n << BigInt( this.numAttributes ) ) - 1n;
  }

  public getSolutionAttributeSet( setSolution: Set<TPatternEdge> ): SolutionAttributeSet {
    let data = 0n;
    let optionalData = 0n;

    const isEdgeBlack = ( edge: TPatternEdge ) => setSolution.has( edge );

    for ( let i = 0; i < this.numAttributes; i++ ) {
      const feature = this.primaryFeatures[ i ];

      if ( feature instanceof RedEdgeFeature && feature.edge.isExit ) {
        if ( feature.edge.exitVertex!.edges.every( edge => !isEdgeBlack( edge ) ) ) {
          optionalData |= 1n << BigInt( i );
        }
        else if ( !isEdgeBlack( feature.edge ) ) {
          data |= 1n << BigInt( i );
        }
      }
      else if ( feature.isPossibleWith( isEdgeBlack ) ) {
        data |= 1n << BigInt( i );
      }
    }

    return SolutionAttributeSet.fromSolutionBinary(
      this.numAttributes,
      data,
      optionalData,
    );
  }

  public getFeatureSetBits( featureSet: FeatureSet ): bigint {
    let bits = 0n;

    for ( let i = 0; i < this.numAttributes; i++ ) {
      const feature = this.primaryFeatures[ i ];

      if ( featureSet.impliesFeature( feature ) ) {
        bits |= 1n << BigInt( i );
      }
    }

    return bits;
  }

  public bitsHaveIndex( bits: bigint, index: number ): boolean {
    return ( bits & ( 1n << BigInt( index ) ) ) !== 0n;
  }

  public getBitsIndices( bits: bigint ): number[] {
    const attributes: number[] = [];

    for ( let i = 0; i < this.numAttributes; i++ ) {
      if ( this.bitsHaveIndex( bits, i ) ) {
        attributes.push( i );
      }
    }

    return attributes;
  }

  public getBitsPrimaryFeatures( bits: bigint ): TEmbeddableFeature[] {
    const features: TEmbeddableFeature[] = [];

    for ( let i = 0; i < this.numAttributes; i++ ) {
      if ( this.bitsHaveIndex( bits, i ) ) {
        features.push( this.primaryFeatures[ i ] );
      }
    }

    return features;
  }

  public getBitsFeatureSet( bits: bigint ): FeatureSet | null {
    // If all bits are set, we will be contradictory, and can shortcut to no feature set.
    if ( bits === this.full ) {
      return null;
    }

    const featureSet = FeatureSet.empty( this.patternBoard );

    // TODO: improve efficiency in the future (for face color duals)
    for ( let i = 0; i < this.numAttributes; i++ ) {
      if ( this.bitsHaveIndex( bits, i ) ) {
        const feature = this.primaryFeatures[ i ];

        try {
          featureSet.addFeature( feature );
        }
        catch ( e ) {
          if ( e instanceof IncompatibleFeatureError ) {
            return null;
          }
          else {
            throw e;
          }
        }
      }
    }

    return featureSet;
  }

  public getBinaryString( bits: bigint ): string {
    return _.range( 0, this.numAttributes ).map( i => this.bitsHaveIndex( bits, i ) ? '1' : '0' ).join( '' );
  }

  public getIndicesString( bits: bigint ): string {
    return this.getBitsIndices( bits ).join( ',' );
  }

  public getFeaturesString( bits: bigint ): string {
    return this.getBitsPrimaryFeatures( bits ).map( feature => feature.toCanonicalString() ).join( ', ' );
  }

  public getFeaturesSetString( bits: bigint ): string {
    const featureSet = this.getBitsFeatureSet( bits );
    return featureSet ? featureSet.toCanonicalString() : 'null';
  }

  // indices

  public getNonExitRedIndex( edge: TPatternEdge ): number {
    return 2 * edge.index;
  }

  public getNonExitBlackIndex( edge: TPatternEdge ): number {
    return 2 * edge.index + 1;
  }

  public getExitIndex( edge: TPatternEdge ): number {
    return this.numNonExitEdges + edge.index;
  }

  public getSectorNotZeroIndex( sector: TPatternSector ): number {
    return 3 * sector.index + this.sectorBaseIndex;
  }

  public getSectorNotOneIndex( sector: TPatternSector ): number {
    return 3 * sector.index + this.sectorBaseIndex + 1;
  }

  public getSectorNotTwoIndex( sector: TPatternSector ): number {
    return 3 * sector.index + this.sectorBaseIndex + 2;
  }

  // masks

  public getNonExitEdgeRedMask( edge: TPatternEdge ): bigint {
    return 1n << BigInt( 2 * edge.index );
  }

  public getNonExitEdgeBlackMask( edge: TPatternEdge ): bigint {
    return 1n << BigInt( 2 * edge.index + 1 );
  }

  public getNonExitEdgeMask( edge: TPatternEdge ): bigint {
    return 3n << BigInt( 2 * edge.index );
  }

  public getExitEdgeMask( edge: TPatternEdge ): bigint {
    return 1n << BigInt( this.numNonExitEdges + edge.index );
  }

  public getEdgeMask( edge: TPatternEdge ): bigint {
    return edge.isExit ? this.getExitEdgeMask( edge ) : this.getNonExitEdgeMask( edge );
  }

  public getSectorNotZeroMask( sector: TPatternSector ): bigint {
    return 1n << BigInt( 3 * sector.index + this.sectorBaseIndex );
  }

  public getSectorNotOneMask( sector: TPatternSector ): bigint {
    return 1n << BigInt( 3 * sector.index + this.sectorBaseIndex + 1 );
  }

  public getSectorNotTwoMask( sector: TPatternSector ): bigint {
    return 1n << BigInt( 3 * sector.index + this.sectorBaseIndex + 2 );
  }

  public getSectorMask( sector: TPatternSector ): bigint {
    return 7n << BigInt( 3 * sector.index + this.sectorBaseIndex );
  }
}