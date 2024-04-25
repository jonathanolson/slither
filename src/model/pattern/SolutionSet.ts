import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FaceConnectivity } from './FaceConnectivity.ts';
import _ from '../../workarounds/_.ts';
import { arrayRemove } from 'phet-lib/phet-core';
import { FeatureSet } from './feature/FeatureSet.ts';
import { PatternBoardSolver } from './PatternBoardSolver.ts';
import { TPatternFace } from './TPatternFace.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { FaceColorDualFeature } from './feature/FaceColorDualFeature.ts';
import { BIT_NUMBERS_BITS_PER_NUMBER, bitNumbersIsBitOne, bitNumbersSetBitToOne } from '../../util/booleanPacking.ts';
import { PatternRule } from './PatternRule.ts';
import { FormalContext } from './formal-concept/FormalContext.ts';
import { AttributeSet } from './formal-concept/AttributeSet.ts';


export type SolutionSetShape = {
  numEdges: number;
  numSectors: number;
  numFacePairs: number;
  sectorOffset: number;
  faceOffset: number;
  bitsPerSolution: number;
  numNumbersPerSolution: number;
};

/**
 * Edge bits are:
 *   [ +0 ] black (exit edges will be marked black if the exit vertex has no other black edges)
 *   [ +1 ] red (exit edges will NOT be marked red if the exit vertex has no other black edges)
 *   [ +2 ] original-black (the original state from the solution)
 *
 * Sector bits are:
 *   [ +0 ] not-zero
 *   [ +1 ] not-one
 *   [ +2 ] not-two
 *
 * Face bits (per face-pair):
 *   [ +0 ] same color
 *   [ +1 ] opposite color
 */
export class SolutionSet {
  private constructor(
    // TODO: private, but we needed to export these for getImpliedRules? TREAT AS PRIVATE?
    public readonly patternBoard: TPatternBoard,
    public readonly numSolutions: number,
    public readonly bitData: number[],
    public readonly shape: SolutionSetShape,
    public readonly vertexConnections: VertexConnection[][] | null, // sorted
    public readonly vertexConnectionsKeys: string[] | null = null
  ) {}

  public toString(): string {
    let result = `SolutionSet( numSolutions=${this.numSolutions}\n`;

    for ( let solutionIndex = 0; solutionIndex < this.numSolutions; solutionIndex++ ) {
      const offset = solutionIndex * this.shape.numNumbersPerSolution;

      result += `  ${solutionIndex}:`;

      if ( this.shape.numEdges ) {
        result += ' edges: ';
        for ( let edgeIndex = 0; edgeIndex < this.shape.numEdges; edgeIndex++ ) {
          const blackIndex = 3 * edgeIndex;
          const redIndex = 3 * edgeIndex + 1;
          const originalBlackIndex = 3 * edgeIndex + 2;

          const isBlack = bitNumbersIsBitOne( this.bitData, offset, blackIndex );
          const isRed = bitNumbersIsBitOne( this.bitData, offset, redIndex );
          const isOriginalBlack = bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex );

          if ( edgeIndex > 0 ) {
            result += ', ';
          }

          if ( isBlack && isOriginalBlack && !isRed ) {
            result += `black-${edgeIndex}`;
          }
          else if ( isRed && !isBlack && !isOriginalBlack ) {
            result += `red-${edgeIndex}`;
          }
          else if ( !isBlack && !isRed ) {
            result += `empty${isOriginalBlack ? 'B' : 'R'}-${edgeIndex}`;
          }
          else {
            result += `mixed-${isBlack}:${isRed}:${isOriginalBlack}-${edgeIndex}`;
          }
        }
      }

      if ( this.shape.numSectors ) {
        result += ' sectors: ';
        for ( let sectorIndex = 0; sectorIndex < this.shape.numSectors; sectorIndex++ ) {
          const sectorBaseIndex = this.shape.sectorOffset + 3 * sectorIndex;
          const notZeroBitIndex = sectorBaseIndex;
          const notOneBitIndex = sectorBaseIndex + 1;
          const notTwoBitIndex = sectorBaseIndex + 2;

          const isNotZero = bitNumbersIsBitOne( this.bitData, offset, notZeroBitIndex );
          const isNotOne = bitNumbersIsBitOne( this.bitData, offset, notOneBitIndex );
          const isNotTwo = bitNumbersIsBitOne( this.bitData, offset, notTwoBitIndex );

          if ( sectorIndex > 0 ) {
            result += ', ';
          }

          result += `sector-${isNotZero}-${isNotOne}-${isNotTwo}-${sectorIndex}`;
        }
      }

      if ( this.shape.numFacePairs ) {
        const faceConnectivity = FaceConnectivity.get( this.patternBoard );

        result += ' facePairs: ';
        for ( let pairIndex = 0; pairIndex < this.shape.numFacePairs; pairIndex++ ) {
          const samePairIndex = this.shape.faceOffset + 2 * pairIndex;
          const oppositePairIndex = samePairIndex + 1;

          const isSame = bitNumbersIsBitOne( this.bitData, offset, samePairIndex );
          const isOpposite = bitNumbersIsBitOne( this.bitData, offset, oppositePairIndex );

          if ( pairIndex > 0 ) {
            result += ', ';
          }

          const pair = faceConnectivity.connectedFacePairs[ pairIndex ];

          const type = isSame && isOpposite ? 'both' : isSame ? 'same' : isOpposite ? 'opposite' : 'empty';

          result += `${type}-${pairIndex}(f${pair.a.index},f${pair.b.index})`;
        }
      }

      if ( this.vertexConnections ) {
        result += ' vertexConnections: ';

        const connections = this.vertexConnections[ solutionIndex ];

        for ( let i = 0; i < connections.length; i++ ) {
          if ( i > 0 ) {
            result += ', ';
          }

          const vertexConnection = connections[ i ];
          result += `(${vertexConnection.minVertexIndex},${vertexConnection.maxVertexIndex})`;
        }
      }

      if ( this.vertexConnectionsKeys ) {
        result += ` key:${this.vertexConnectionsKeys[ solutionIndex ]}`;
      }

      result += '\n';
    }

    return result + ')';
  }

  public hasSolutionEdge( solutionIndex: number, edge: TPatternEdge ): boolean {
    const offset = solutionIndex * this.shape.numNumbersPerSolution;

    const originalBlackIndex = 3 * edge.index + 2;

    return bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex );
  }

  public clone(): SolutionSet {
    return new SolutionSet(
      this.patternBoard,
      this.numSolutions,
      this.bitData.slice(),
      this.shape,
      this.vertexConnections ? this.vertexConnections.slice() : null, // the individual VertexConnections[] won't change
      this.vertexConnectionsKeys ? this.vertexConnectionsKeys.slice() : null
    );
  }

  public withFilter( predicate: ( i: number ) => boolean ): SolutionSet | null {
    let numSolutions = 0;
    const bitData: number[] = [];
    const vertexConnections: VertexConnection[][] | null = this.vertexConnections ? [] : null;
    const vertexConnectionsKeys: string[] | null = this.vertexConnections ? [] : null;

    for ( let i = 0; i < this.numSolutions; i++ ) {
      if ( predicate( i ) ) {
        numSolutions++;

        const offset = i * this.shape.numNumbersPerSolution;
        for ( let j = 0; j < this.shape.numNumbersPerSolution; j++ ) {
          bitData.push( this.bitData[ offset + j ] );
        }

        if ( vertexConnections ) {
          vertexConnections.push( this.vertexConnections![ i ] );
          vertexConnectionsKeys!.push( this.vertexConnectionsKeys![ i ] );
        }
      }
    }

    if ( numSolutions ) {
      return new SolutionSet(
        this.patternBoard,
        numSolutions,
        bitData,
        this.shape,
        vertexConnections,
        vertexConnectionsKeys
      );
    }
    else {
      return null;
    }
  }

  public partitioned( predicate: ( i: number ) => boolean ): { with: SolutionSet | null; without: SolutionSet | null } {
    let falseNumSolutions = 0;
    let trueNumSolutions = 0;

    const falseBitData: number[] = [];
    const trueBitData: number[] = [];

    const falseVertexConnections: VertexConnection[][] | null = this.vertexConnections ? [] : null;
    const trueVertexConnections: VertexConnection[][] | null = this.vertexConnections ? [] : null;

    const falseVertexConnectionsKeys: string[] | null = this.vertexConnections ? [] : null;
    const trueVertexConnectionsKeys: string[] | null = this.vertexConnections ? [] : null;

    for ( let i = 0; i < this.numSolutions; i++ ) {
      const offset = i * this.shape.numNumbersPerSolution;
      if ( predicate( i ) ) {
        trueNumSolutions++;
        for ( let j = 0; j < this.shape.numNumbersPerSolution; j++ ) {
          trueBitData.push( this.bitData[ offset + j ] );
        }
        if ( trueVertexConnections ) {
          trueVertexConnections.push( this.vertexConnections![ i ] );
          trueVertexConnectionsKeys!.push( this.vertexConnectionsKeys![ i ] );
        }
      }
      else {
        falseNumSolutions++;
        for ( let j = 0; j < this.shape.numNumbersPerSolution; j++ ) {
          falseBitData.push( this.bitData[ offset + j ] );
        }
        if ( falseVertexConnections ) {
          falseVertexConnections.push( this.vertexConnections![ i ] );
          falseVertexConnectionsKeys!.push( this.vertexConnectionsKeys![ i ] );
        }
      }
    }

    return {
      with: trueNumSolutions ? new SolutionSet(
        this.patternBoard,
        trueNumSolutions,
        trueBitData,
        this.shape,
        trueVertexConnections,
        trueVertexConnectionsKeys
      ) : null,
      without: falseNumSolutions ? new SolutionSet(
        this.patternBoard,
        falseNumSolutions,
        falseBitData,
        this.shape,
        falseVertexConnections,
        falseVertexConnectionsKeys
      ) : null
    };
  }

  // Returns a new copy
  public withFaceValue( face: TPatternFace, value: FaceValue ): SolutionSet | null {
    if ( value === null ) {
      return this.clone();
    }
    else {
      const faceConnectivity = this.shape.numFacePairs ? FaceConnectivity.get( this.patternBoard ) : null;
      return this.withFilter( i => {
        const offset = i * this.shape.numNumbersPerSolution;

        if ( this.shape.numEdges ) {
          let blackCount = 0;
          for ( const edge of face.edges ) {
            const originalBlackIndex = 3 * edge.index + 2;
            if ( bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex ) ) {
              blackCount++;
            }
          }

          if ( blackCount !== value ) {
            return false;
          }
        }

        if ( this.shape.numFacePairs ) {
          let blackCount = 0;
          for ( let pairIndex = 0; pairIndex < this.shape.numFacePairs; pairIndex++ ) {
            const pair = faceConnectivity!.connectedFacePairs[ pairIndex ];

            // TODO: don't rely on shortestPath this hard? we're relying on this for an adjacency check (essentially)
            // TODO: for larger patterns, we might have a LOT of pairs. Is there a way we can optimize this, and
            // TODO: basically just look at "direct connecting pairs"?
            if ( ( pair.a === face || pair.b === face ) && pair.shortestPath.length === 1 ) {
              const samePairIndex = this.shape.faceOffset + 2 * pairIndex;
              const isSame = bitNumbersIsBitOne( this.bitData, offset, samePairIndex );

              if ( !isSame ) {
                blackCount++;
              }
            }
          }
          if ( blackCount !== value ) {
            return false;
          }
        }

        return true;
      } );
    }
  }

  public nonExitEdgePartitioned( edge: TPatternEdge ): { black: SolutionSet | null; red: SolutionSet | null } {
    assertEnabled() && assert( !edge.isExit );

    const partition = this.partitioned( i => {
      const offset = i * this.shape.numNumbersPerSolution;
      const originalBlackIndex = 3 * edge.index + 2;

      return bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex );
    } );

    return {
      black: partition.with,
      red: partition.without
    };
  }

  public withExitEdgeRed( edge: TPatternEdge ): SolutionSet | null {
    assertEnabled() && assert( edge.isExit );

    return this.withFilter( i => {
      const offset = i * this.shape.numNumbersPerSolution;

      // If the "original" was black, then the exit edge couldn't be red.
      const originalBlackIndex = 3 * edge.index + 2;
      // TODO: reduce duplication with this logic, make it clean and readable
      return !bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex );
    } );
  }

  public withFaceColorDuals( faceColorDuals: FaceColorDualFeature[] ): SolutionSet | null {

    // Find all pair indices that we'll need to (minimally) check to ensure the features!
    const samePairIndices: number[] = [];
    const oppositePairIndices: number[] = [];

    const pairs = FaceConnectivity.get( this.patternBoard ).connectedFacePairs;

    const getPairIndex = ( a: TPatternFace, b: TPatternFace ) => {
      const pairIndex = pairs.findIndex( pair => pair.containsFacePair( a, b ) )!;
      assertEnabled() && assert( pairIndex >= 0 );

      return pairIndex;
    };

    // Add "same" for adjacent faces in the same set, and one "opposite" if we have a secondary set.
    for ( const faceColorDual of faceColorDuals ) {
      for ( let i = 1; i < faceColorDual.primaryFaces.length; i++ ) {
        samePairIndices.push( getPairIndex( faceColorDual.primaryFaces[ i - 1 ], faceColorDual.primaryFaces[ i ] ) );
      }
      if ( faceColorDual.secondaryFaces.length ) {
        oppositePairIndices.push( getPairIndex( faceColorDual.primaryFaces[ 0 ], faceColorDual.secondaryFaces[ 0 ] ) );
        for ( let i = 1; i < faceColorDual.secondaryFaces.length; i++ ) {
          samePairIndices.push( getPairIndex( faceColorDual.secondaryFaces[ i - 1 ], faceColorDual.secondaryFaces[ i ] ) );
        }
      }
    }

    return this.withFilter( i => {
      const offset = i * this.shape.numNumbersPerSolution;

      for ( let pairIndex of samePairIndices ) {
        const bitIndex = this.shape.faceOffset + 2 * pairIndex;

        const isSame = bitNumbersIsBitOne( this.bitData, offset, bitIndex );

        if ( !isSame ) {
          return false;
        }
      }

      for ( let pairIndex of oppositePairIndices ) {
        const bitIndex = this.shape.faceOffset + 2 * pairIndex + 1;

        const isOpposite = bitNumbersIsBitOne( this.bitData, offset, bitIndex );

        if ( !isOpposite ) {
          return false;
        }
      }

      return true;
    } );
  }

  public addToFeatureSet( featureSet: FeatureSet = FeatureSet.empty( this.patternBoard ) ): FeatureSet {
    assertEnabled() && assert( featureSet.patternBoard === this.patternBoard );
    assertEnabled() && assert( this.numSolutions > 0 );

    const numNumbersPerSolution = this.shape.numNumbersPerSolution;
    const scratchNumbers = new Array<number>( numNumbersPerSolution ).fill( 2 ** BIT_NUMBERS_BITS_PER_NUMBER - 1 );

    // console.log( scratchNumbers );

    // AND everything together
    for ( let i = 0; i < this.numSolutions; i++ ) {
      const offset = i * numNumbersPerSolution;
      for ( let j = 0; j < numNumbersPerSolution; j++ ) {
        scratchNumbers[ j ] &= this.bitData[ offset + j ];
      }
    }

    // console.log( scratchNumbers );

    SolutionSet.applyNumbersToFeatureSet(
      this.patternBoard,
      this.shape,
      scratchNumbers,
      featureSet
    );

    return featureSet;
  }

  public static applyNumbersToFeatureSet(
    patternBoard: TPatternBoard,
    shape: SolutionSetShape,
    numbers: number[],
    featureSet: FeatureSet
  ): void {
    for ( let edgeIndex = 0; edgeIndex < shape.numEdges; edgeIndex++ ) {
      const blackIndex = 3 * edgeIndex;
      const redIndex = blackIndex + 1;

      const canBeBlack = bitNumbersIsBitOne( numbers, 0, blackIndex );
      const canBeRed = bitNumbersIsBitOne( numbers, 0, redIndex );

      const edge = patternBoard.edges[ edgeIndex ];

      // TODO: I think these "both" cases are impossible now
      // Handle cases where our exit edge is both "black" and "red" at the same time.
      if ( canBeBlack && !canBeRed && !edge.isExit ) {
        featureSet.addBlackEdge( edge );
      }
      else if ( canBeRed && !canBeBlack ) {
        featureSet.addRedEdge( edge );
      }
    }

    // TODO: OR add excess sectors?
    for ( let sectorIndex = 0; sectorIndex < shape.numSectors; sectorIndex++ ) {
      const sectorBaseIndex = shape.sectorOffset + 3 * sectorIndex;
      const notZeroBitIndex = sectorBaseIndex;
      const notOneBitIndex = sectorBaseIndex + 1;
      const notTwoBitIndex = sectorBaseIndex + 2;

      const isNotZero = bitNumbersIsBitOne( numbers, 0, notZeroBitIndex );
      const isNotOne = bitNumbersIsBitOne( numbers, 0, notOneBitIndex );
      const isNotTwo = bitNumbersIsBitOne( numbers, 0, notTwoBitIndex );

      // NOTE: Relying on the FeatureSet to properly collapse everything together
      if ( isNotOne ) {
        featureSet.addSectorNotOne( patternBoard.sectors[ sectorIndex ] );
      }
      if ( isNotZero ) {
        featureSet.addSectorNotZero( patternBoard.sectors[ sectorIndex ] );
      }
      if ( isNotTwo ) {
        featureSet.addSectorNotTwo( patternBoard.sectors[ sectorIndex ] );
      }
    }

    if ( shape.numFacePairs ) {
      const faceConnectivity = FaceConnectivity.get( patternBoard );

      for ( let pairIndex = 0; pairIndex < shape.numFacePairs; pairIndex++ ) {
        const samePairIndex = shape.faceOffset + 2 * pairIndex;
        const oppositePairIndex = samePairIndex + 1;
        const isSame = bitNumbersIsBitOne( numbers, 0, samePairIndex );
        const isOpposite = bitNumbersIsBitOne( numbers, 0, oppositePairIndex );

        if ( isSame || isOpposite ) {
          const pair = faceConnectivity.connectedFacePairs[ pairIndex ];

          if ( isSame ) {
            // console.log( 'same', pair.a.index, pair.b.index );
            featureSet.addSameColorFaces( pair.a, pair.b );
          }
          else {
            // console.log( 'opposite', pair.a.index, pair.b.index );
            featureSet.addOppositeColorFaces( pair.a, pair.b );
          }
        }
      }
    }
  }

  // NOTE: can get indeterminateEdges from getIndeterminateEdges( this.patternBoard, features )
  public withFilteredHighlanderSolutions( indeterminateEdges: TPatternEdge[] ): SolutionSet | null {
    assertEnabled() && assert( this.vertexConnectionsKeys );

    const solutionIndexMap = new Map<string, number[]>;

    for ( let i = 0; i < this.numSolutions; i++ ) {
      let key = `${this.vertexConnectionsKeys![ i ]}`;
      const offset = i * this.shape.numNumbersPerSolution;
      for ( const edge of indeterminateEdges ) {

        // Indeterminate edges can be exits, so here we'll check the red bit
        const originalBlackIndex = 3 * edge.index + 2;

        const isBlack = bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex );
        key += isBlack ? '1' : '0';
      }

      if ( solutionIndexMap.has( key ) ) {
        solutionIndexMap.get( key )!.push( i );
      }
      else {
        solutionIndexMap.set( key, [ i ] );
      }
    }

    let numSolutions = 0;
    const bitData: number[] = [];
    const vertexConnections: VertexConnection[][] | null = this.vertexConnections ? [] : null;
    const vertexConnectionsKeys: string[] | null = this.vertexConnections ? [] : null;

    for ( const solutions of solutionIndexMap.values() ) {
      if ( solutions.length === 1 ) {
        numSolutions++;

        const solutionIndex = solutions[ 0 ];

        const offset = solutionIndex * this.shape.numNumbersPerSolution;
        for ( let j = 0; j < this.shape.numNumbersPerSolution; j++ ) {
          bitData.push( this.bitData[ offset + j ] );
        }

        if ( vertexConnections ) {
          vertexConnections.push( this.vertexConnections![ solutionIndex ] );
          vertexConnectionsKeys!.push( this.vertexConnectionsKeys![ solutionIndex ] );
        }
      }
    }

    if ( numSolutions ) {
      return new SolutionSet(
        this.patternBoard,
        numSolutions,
        bitData,
        this.shape,
        vertexConnections,
        vertexConnectionsKeys
      );
    }
    else {
      return null;
    }
  }

  // TODO: unit-tests to make sure we get this back successfully
  public getSolutions(): TPatternEdge[][] {
    const solutions: TPatternEdge[][] = [];

    for ( let i = 0; i < this.numSolutions; i++ ) {
      const solution: TPatternEdge[] = [];
      const offset = i * this.shape.numNumbersPerSolution;
      for ( let j = 0; j < this.shape.numEdges; j++ ) {
        const originalBlackIndex = 3 * j + 2;

        if ( bitNumbersIsBitOne( this.bitData, offset, originalBlackIndex ) ) {
          solution.push( this.patternBoard.edges[ j ] );
        }
      }

      solutions.push( solution );
    }

    return solutions;
  }

  public static getImpliedRules(
    featureSet: FeatureSet,
    includeEdges: boolean,
    includeSectors: boolean,
    includeFaces: boolean
  ): PatternRule[] {
    const solutionSet = SolutionSet.fromFeatureSet(
      featureSet,
      includeEdges,
      includeSectors,
      includeFaces,
      false
    )!;

    // We might have faces that have no solutions!
    if ( !solutionSet ) {
      return [];
    }

    const mapping = new PatternAttributeSetMapping( solutionSet.patternBoard, solutionSet.shape );

    const formalContext = new FormalContext( mapping.numBits, _.range( 0, solutionSet.numSolutions ).flatMap( i => {
      const attributeSets: AttributeSet[] = [];

      // TODO: factor back in?
      const baseBigint = mapping.getBigint( solutionSet.bitData, i );

      const primaryAttributeSet = AttributeSet.fromBinary( mapping.numBits, baseBigint );

      // TODO: Make it so that we don't have to include every permutation of potential red exit edges(!)
      // TODO: We will want to switch to a more manual "closure" function (both for red exit edges, and highlander)

      // TODO: use different abstractions, so we do NOT have to duplicate things for red exit edge sets
      const potentiallyRedExitEdges = featureSet.patternBoard.edges.filter( edge => {
        if ( !edge.isExit ) {
          return false;
        }

        const redSolutionEdgeIndex = 3 * edge.index + 1;
        const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );

        // TODO: map directly from solutions ideally
        if ( primaryAttributeSet.hasAttribute( redAttributeEdgeIndex ) ) {
          return false;
        }

        const hasNoBlackNonExitEdges = edge.exitVertex!.edges.every( edge => {
          return edge.isExit || !primaryAttributeSet.hasAttribute( mapping.mapBitIndex( 3 * edge.index ) );
        } );

        return hasNoBlackNonExitEdges;
      } );

      const exitRecur = ( attributeSet: AttributeSet, edgeIndex: number ) => {
        if ( edgeIndex === potentiallyRedExitEdges.length ) {
          attributeSets.push( attributeSet );
          return;
        }
        else {
          exitRecur( attributeSet, edgeIndex + 1 );

          const edge = potentiallyRedExitEdges[ edgeIndex ];
          const redSolutionEdgeIndex = 3 * edge.index + 1;
          const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );

          exitRecur( attributeSet.withAttribute( redAttributeEdgeIndex ), edgeIndex + 1 );
        }
      };
      exitRecur( primaryAttributeSet, 0 );
      // attributeSets.push( primaryAttributeSet );

      for ( const edge of featureSet.patternBoard.edges ) {
        if ( edge.isExit ) {
          const redSolutionEdgeIndex = 3 * edge.index + 1;
          const redAttributeEdgeIndex = mapping.mapBitIndex( redSolutionEdgeIndex );

          // TODO: map directly from solutions ideally
          if ( !primaryAttributeSet.hasAttribute( redAttributeEdgeIndex ) ) {
            const hasNoBlackNonExitEdges = edge.exitVertex!.edges.every( edge => {
              return edge.isExit || !primaryAttributeSet.hasAttribute( mapping.mapBitIndex( 3 * edge.index ) );
            } );

            if ( hasNoBlackNonExitEdges ) {
              attributeSets.push( primaryAttributeSet.withAttribute( redAttributeEdgeIndex ) );
            }
          }
        }
      }

      // TODO: ... really just go straight from the "solutions" to our context?

      // TODO: handle "potentially red exit edges" here

      return attributeSets;
    } ) );

    const implications = formalContext.getIntentsAndImplications().implications;

    const invalidAttributeSet = AttributeSet.getFull( mapping.numBits );

    return implications.map( implication => {
      // TODO: can we just have a filter first? (or do we need to handle exit edges separately?)
      if ( implication.consequent.equals( invalidAttributeSet ) ) {
        return null;
      }

      const inputFeatureSet = featureSet.clone();
      const inputNumbers = mapping.getNumbers( implication.antecedent.getBits() );
      SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, inputNumbers, inputFeatureSet );

      const outputFeatureSet = featureSet.clone();
      const outputNumbers = mapping.getNumbers( implication.consequent.getBits() );
      SolutionSet.applyNumbersToFeatureSet( solutionSet.patternBoard, solutionSet.shape, outputNumbers, outputFeatureSet );

      if ( assertEnabled() ) {
        for ( let i = 0; i < solutionSet.numSolutions; i++ ) {
          const offset = i * solutionSet.shape.numNumbersPerSolution;
          let inputMatches = true;
          let outputMatches = true;

          for ( let j = 0; j < solutionSet.shape.numNumbersPerSolution; j++ ) {
            if ( ( inputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== inputNumbers[ j ] ) {
              inputMatches = false;
            }
            if ( ( outputNumbers[ j ] & solutionSet.bitData[ offset + j ] ) !== outputNumbers[ j ] ) {
              outputMatches = false;
            }
          }

          // Implication
          assert( !inputMatches || outputMatches );
        }
      }

      // TODO: see if we need to re-enable this
      if ( inputFeatureSet.equals( outputFeatureSet ) ) {
        return null;
      }

      return new PatternRule( solutionSet.patternBoard, inputFeatureSet, outputFeatureSet );
    } ).filter( rule => !!rule ) as PatternRule[];
  }

  public static fromFeatureSet(
    featureSet: FeatureSet,
    includeEdges: boolean,
    includeSectors: boolean,
    includeFaces: boolean,
    includeVertexConnections: boolean, // for highlander, etc.
  ): SolutionSet | null {
    const features = featureSet.getFeaturesArray();

    return SolutionSet.fromCallbacks(
      featureSet.patternBoard,
      callback => PatternBoardSolver.forEachSolution( featureSet.patternBoard, features, callback ),
      includeEdges, includeSectors, includeFaces, includeVertexConnections );
  }

  private static fromCallbacks(
    patternBoard: TPatternBoard,
    forEachSolution: ( callback: ( solution: TPatternEdge[] ) => void ) => void,
    includeEdges: boolean,
    includeSectors: boolean,
    includeFaces: boolean,
    includeVertexConnections: boolean, // for highlander, etc.
  ): SolutionSet | null {

    let faceConnectivity: FaceConnectivity | null = null;
    if ( includeFaces ) {
      faceConnectivity = FaceConnectivity.get( patternBoard );
    }

    const numEdges = includeEdges ? patternBoard.edges.length : 0;
    const numSectors = includeSectors ? patternBoard.sectors.length : 0;
    const numFacePairs = includeFaces ? faceConnectivity!.connectedFacePairs.length : 0;
    const sectorOffset = 3 * numEdges;
    const faceOffset = sectorOffset + 3 * numSectors;
    const bitsPerSolution = faceOffset + 2 * numFacePairs;
    const numNumbersPerSolution = Math.ceil( bitsPerSolution / BIT_NUMBERS_BITS_PER_NUMBER );

    const shape: SolutionSetShape = {
      numEdges: numEdges,
      numSectors: numSectors,
      numFacePairs: numFacePairs,
      sectorOffset: sectorOffset,
      faceOffset: faceOffset,
      bitsPerSolution: bitsPerSolution,
      numNumbersPerSolution: numNumbersPerSolution
    };

    // console.log( 'starting' );

    const bitData: number[] = [];
    const scratchNumbers = new Array<number>( numNumbersPerSolution );
    const scratchEdgeIndexSet = new Set<number>();
    let vertexConnections: VertexConnection[][] | null = includeVertexConnections ? [] : null;
    let vertexConnectionsKeys: string[] | null = includeVertexConnections ? [] : null;

    let numSolutions = 0;
    forEachSolution( solution => {
      numSolutions++;

      // console.log( 'solution', solution.map( edge => edge.index ) );

      // Zero out scratch numbers, so we can do bit operations
      for ( let j = 0; j < scratchNumbers.length; j++ ) {
        scratchNumbers[ j ] = 0;
      }

      // Fill the set. NOTE: using pattern edges here, since we MAY not be checking edges (numEdges = 0)
      for ( let j = 0; j < patternBoard.edges.length; j++ ) {
        scratchEdgeIndexSet.add( j );
      }

      // console.log( [ ...scratchEdgeIndexSet ] );

      // Handle black edges, removing from set (useful to check later)
      for ( const edge of solution ) {
        scratchEdgeIndexSet.delete( edge.index );

        if ( includeEdges ) {
          // console.log( `black edge ${edge.index}` );
          const blackBitIndex = 3 * edge.index;
          bitNumbersSetBitToOne( scratchNumbers, 0, blackBitIndex );

          const originalBlackBitIndex = 3 * edge.index + 2;
          bitNumbersSetBitToOne( scratchNumbers, 0, originalBlackBitIndex );
        }
      }

      // console.log( [ ...scratchEdgeIndexSet ] );

      // Handle red edges
      if ( includeEdges ) {
        for ( const edgeIndex of scratchEdgeIndexSet ) {
          const edge = patternBoard.edges[ edgeIndex ];

          // If our exit edge is "red", but there are no "black" connecting edges, then our exit could also be black
          if ( !edge.isExit || edge.exitVertex!.edges.some( edge => !scratchEdgeIndexSet.has( edge.index ) ) ) {
            // console.log( `red edge ${edge.index}` );
            const redBitIndex = 3 * edgeIndex + 1;
            bitNumbersSetBitToOne( scratchNumbers, 0, redBitIndex );
          }
        }
      }

      if ( includeSectors ) {
        for ( let j = 0; j < numSectors; j++ ) {
          const sector = patternBoard.sectors[ j ];
          const edgeIndexA = sector.edges[ 0 ].index;
          const edgeIndexB = sector.edges[ 1 ].index;

          // Presence in the set is "it's a red edge"
          const count = ( scratchEdgeIndexSet.has( edgeIndexA ) ? 0 : 1 ) + ( scratchEdgeIndexSet.has( edgeIndexB ) ? 0 : 1 );

          assertEnabled() && assert( count <= 2 );

          const sectorBaseIndex = sectorOffset + 3 * j;

          if ( count !== 0 ) {
            const notZeroBitIndex = sectorBaseIndex;
            bitNumbersSetBitToOne( scratchNumbers, 0, notZeroBitIndex );
          }

          if ( count !== 1 ) {
            const notOneBitIndex = sectorBaseIndex + 1;
            bitNumbersSetBitToOne( scratchNumbers, 0, notOneBitIndex );
          }

          if ( count !== 2 ) {
            const notTwoBitIndex = sectorBaseIndex + 2;
            bitNumbersSetBitToOne( scratchNumbers, 0, notTwoBitIndex );
          }
        }
      }

      if ( includeFaces ) {
        const facePairs = faceConnectivity!.connectedFacePairs;

        for ( let j = 0; j < facePairs.length; j++ ) {
          const pair = facePairs[ j ];

          // console.log( j, pair.a.index, pair.b.index );

          // parity checks!
          let isSame = true;
          for ( let k = 0; k < pair.shortestPath.length; k++ ) {
            const edgeIndex = pair.shortestPath[ k ].index;

            if ( !scratchEdgeIndexSet.has( edgeIndex ) ) {
              // console.log( `toggle ${edgeIndex}` );
              isSame = !isSame;
            }
          }

          // console.log( isSame );

          const facePairIndex = faceOffset + 2 * j + ( isSame ? 0 : 1 );

          bitNumbersSetBitToOne( scratchNumbers, 0, facePairIndex );
        }
      }

      // console.log( scratchNumbers.map( number => number.toString( 2 ) ) );

      // Copy it into the section
      for ( let j = 0; j < numNumbersPerSolution; j++ ) {
        bitData.push( scratchNumbers[ j ] );
      }

      if ( includeVertexConnections ) {
        const remainingEdges = solution.slice();

        const connections: VertexConnection[] = [];

        while ( remainingEdges.length ) {
          const startExitEdge = remainingEdges.find( edge => edge.isExit )!;
          assertEnabled() && assert( startExitEdge );

          const getNextEdge = ( currentEdge: TPatternEdge ): TPatternEdge => {
            // TODO: performance?
            const potentialEdges = currentEdge.vertices.flatMap( vertex => vertex.edges ).filter( edge => remainingEdges.includes( edge ) );
            assertEnabled() && assert( potentialEdges.length === 1 );

            return potentialEdges[ 0 ];
          };

          // TODO: performance(!)
          arrayRemove( remainingEdges, startExitEdge );
          let currentEdge = startExitEdge;

          while ( currentEdge === startExitEdge || !currentEdge.isExit ) {
            const nextEdge = getNextEdge( currentEdge );
            // TODO: performance(!)
            arrayRemove( remainingEdges, nextEdge );
            currentEdge = nextEdge;
          }

          const endExitEdge = currentEdge;

          const minVertexIndex = Math.min( startExitEdge.exitVertex!.index, endExitEdge.exitVertex!.index );
          const maxVertexIndex = Math.max( startExitEdge.exitVertex!.index, endExitEdge.exitVertex!.index );

          connections.push( new VertexConnection( minVertexIndex, maxVertexIndex ) );
        }

        const sortedConnections = _.sortBy( connections, connection => connection.minVertexIndex );
        vertexConnections!.push( sortedConnections );
        vertexConnectionsKeys!.push( sortedConnections.map( connection => `c${connection.minVertexIndex}-${connection.maxVertexIndex}`).join( ',' ) );
      }
    } );

    if ( numSolutions === 0 ) {
      return null;
    }

    return new SolutionSet( patternBoard, numSolutions, bitData, shape, vertexConnections, vertexConnectionsKeys );
  }

  // TODO: should this be deprecated?
  public static fromSolutions(
    patternBoard: TPatternBoard,
    // TODO: allow streaming solutions to this (e.g. from the solver directly
    solutions: TPatternEdge[][],
    includeEdges: boolean,
    includeSectors: boolean,
    includeFaces: boolean,
    includeVertexConnections: boolean, // for highlander, etc.
  ): SolutionSet | null {

    return SolutionSet.fromCallbacks( patternBoard, callback => {
      for ( const solution of solutions ) {
        callback( solution );
      }
    }, includeEdges, includeSectors, includeFaces, includeVertexConnections );
  }
}

export class VertexConnection {
  public constructor(
    public readonly minVertexIndex: number,
    public readonly maxVertexIndex: number
  ) {}
}

export class PatternAttributeSetMapping {

  // SolutionSet bit index => Attribute Set bit index
  public readonly bitMap = new Map<number, number>();

  public readonly numBits: number;

  /**
   * Strips the "original black", reorders to (red,black), and deduplicates single-edge "face-color differences"
   */
  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly shape: SolutionSetShape
  ) {
    let bitIndex = 0;

    // NOTE: no mapping for "original black"
    if ( shape.numEdges ) {
      let hasExitEdge = false;
      for ( let edgeIndex = 0; edgeIndex < shape.numEdges; edgeIndex++ ) {
        const edge = patternBoard.edges[ edgeIndex ];

        const blackIndex = 3 * edgeIndex;
        const redIndex = 3 * edgeIndex + 1;

        if ( edge.isExit ) {
          hasExitEdge = true;

          this.bitMap.set( redIndex, bitIndex++ );
        }
        else {
          assertEnabled() && assert( !hasExitEdge, 'Assume ordering of non-exit before exit' );

          // Reverse the map here, so we are red, black
          this.bitMap.set( redIndex, bitIndex++ );
          this.bitMap.set( blackIndex, bitIndex++ );
        }
      }
    }

    if ( shape.numSectors ) {
      for ( let sectorIndex = 0; sectorIndex < shape.numSectors; sectorIndex++ ) {
        const sectorBaseIndex = shape.sectorOffset + 3 * sectorIndex;
        const notZeroBitIndex = sectorBaseIndex;
        const notOneBitIndex = sectorBaseIndex + 1;
        const notTwoBitIndex = sectorBaseIndex + 2;

        this.bitMap.set( notZeroBitIndex, bitIndex++ );
        this.bitMap.set( notOneBitIndex, bitIndex++ );
        this.bitMap.set( notTwoBitIndex, bitIndex++ );
      }
    }

    if ( shape.numFacePairs ) {
      const faceConnectivity = FaceConnectivity.get( this.patternBoard );
      const pairs = faceConnectivity.connectedFacePairs;

      for ( let pairIndex = 0; pairIndex < shape.numFacePairs; pairIndex++ ) {
        const samePairIndex = shape.faceOffset + 2 * pairIndex;
        const oppositePairIndex = samePairIndex + 1;

        const pair = pairs[ pairIndex ];

        if ( pair.shortestPath.length === 1 && shape.numEdges ) {
          // Single edge, so we are duplicating things
          const edgeIndex = patternBoard.edges.indexOf( pair.shortestPath[ 0 ] );
          assertEnabled() && assert( edgeIndex >= 0 );

          this.bitMap.set( samePairIndex, 2 * edgeIndex );
          this.bitMap.set( oppositePairIndex, 2 * edgeIndex + 1 );
        }
        else {
          this.bitMap.set( samePairIndex, bitIndex++ );
          this.bitMap.set( oppositePairIndex, bitIndex++ );
        }
      }
    }

    this.numBits = bitIndex;
  }

  public mapBitIndex( bitIndex: number ): number {
    const mapped = this.bitMap.get( bitIndex )!;
    assertEnabled() && assert( mapped !== undefined );

    return mapped;
  }

  // TODO: could reorder the SolutionSet data to be similar to this, so we can JUST COPY DIRECTLY!!!
  public getBigint( bitData: number[], solutionIndex: number ): bigint {
    const offset = solutionIndex * this.shape.numNumbersPerSolution;

    let result = BigInt( 0 );

    for ( let [ solutionBitIndex, attributeBitIndex ] of this.bitMap ) {
      if ( bitNumbersIsBitOne( bitData, offset, solutionBitIndex ) ) {
        result |= 1n << BigInt( attributeBitIndex );
      }
    }

    return result;
  }

  public getNumbers( bigint: bigint ): number[] {
    const numbers = new Array<number>( this.shape.numNumbersPerSolution ).fill( 0 );

    for ( let [ solutionBitIndex, attributeBitIndex ] of this.bitMap ) {
      if ( ( bigint & ( 1n << BigInt( attributeBitIndex ) ) ) !== 0n ) {
        bitNumbersSetBitToOne( numbers, 0, solutionBitIndex );
      }
    }

    assertEnabled() && assert( bigint === this.getBigint( numbers, 0 ) );

    return numbers;
  }
}