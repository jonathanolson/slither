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

const BITS_PER_NUMBER = 30;

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
 *   [ +3 ] only-one
 *
 * Face bits (per face-pair):
 *   [ +0 ] same color
 *   [ +1 ] opposite color
 */
export class SolutionSet {
  private constructor(
    private readonly patternBoard: TPatternBoard,
    private readonly numSolutions: number,
    private readonly bitData: number[],
    private readonly shape: SolutionSetShape,
    private readonly vertexConnections: VertexConnection[][] | null, // sorted
    private readonly vertexConnectionsKeys: string[] | null = null
  ) {}

  public hasSolutionEdge( solutionIndex: number, edge: TPatternEdge ): boolean {
    const offset = solutionIndex * this.shape.numNumbersPerSolution;

    const originalBlackIndex = 3 * edge.index + 2;
    return ( this.bitData[ offset + Math.floor( originalBlackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( originalBlackIndex % BITS_PER_NUMBER ) ) ) !== 0;
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
      return this.withFilter( i => {
        const offset = i * this.shape.numNumbersPerSolution;

        let blackCount = 0;
        for ( const edge of face.edges ) {
          const originalBlackIndex = 3 * edge.index + 2;
          if ( this.bitData[ offset + Math.floor( originalBlackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( originalBlackIndex % BITS_PER_NUMBER ) ) ) {
            blackCount++;
          }
        }

        return blackCount === value;
      } );
    }
  }

  public nonExitEdgePartitioned( edge: TPatternEdge ): { black: SolutionSet | null; red: SolutionSet | null } {
    assertEnabled() && assert( !edge.isExit );

    const partition = this.partitioned( i => {
      const offset = i * this.shape.numNumbersPerSolution;
      const originalBlackIndex = 3 * edge.index + 2;
      return ( this.bitData[ offset + Math.floor( originalBlackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( originalBlackIndex % BITS_PER_NUMBER ) ) ) !== 0;
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
      return ( this.bitData[ offset + Math.floor( originalBlackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( originalBlackIndex % BITS_PER_NUMBER ) ) ) === 0;
    } );
  }

  public withFaceColorDual( faceColorDual: FaceColorDualFeature ): SolutionSet | null {
    return this.withFilter( i => {
      // NOTE: We probably won't look up edges "many times", so this might be acceptable.
      return faceColorDual.isPossibleWith( edge => this.hasSolutionEdge( i, edge ) );
    } );
  }

  public withFaceColorDuals( faceColorDuals: FaceColorDualFeature[] ): SolutionSet | null {
    return this.withFilter( i => {
      // NOTE: We probably won't look up edges "many times", so this might be acceptable.
      return faceColorDuals.every( faceColorDual => faceColorDual.isPossibleWith( edge => this.hasSolutionEdge( i, edge ) ) );
    } );
  }

  public addToFeatureSet( featureSet: FeatureSet = FeatureSet.empty( this.patternBoard ) ): FeatureSet {
    assertEnabled() && assert( featureSet.patternBoard === this.patternBoard );
    assertEnabled() && assert( this.numSolutions > 0 );

    const numNumbersPerSolution = this.shape.numNumbersPerSolution;
    const scratchNumbers = new Array<number>( numNumbersPerSolution ).fill( 2 ** BITS_PER_NUMBER - 1 );

    // console.log( scratchNumbers );

    // AND everything together
    for ( let i = 0; i < this.numSolutions; i++ ) {
      const offset = i * numNumbersPerSolution;
      for ( let j = 0; j < numNumbersPerSolution; j++ ) {
        scratchNumbers[ j ] &= this.bitData[ offset + j ];
      }
    }

    // console.log( scratchNumbers );

    for ( let edgeIndex = 0; edgeIndex < this.shape.numEdges; edgeIndex++ ) {
      const blackIndex = 3 * edgeIndex;
      const redIndex = blackIndex + 1;

      const canBeBlack = scratchNumbers[ Math.floor( blackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( blackIndex % BITS_PER_NUMBER ) );
      const canBeRed = scratchNumbers[ Math.floor( redIndex / BITS_PER_NUMBER ) ] & ( 1 << ( redIndex % BITS_PER_NUMBER ) );

      const edge = this.patternBoard.edges[ edgeIndex ];

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
    for ( let sectorIndex = 0; sectorIndex < this.shape.numSectors; sectorIndex++ ) {
      const sectorBaseIndex = this.shape.sectorOffset + 4 * sectorIndex;
      const notZeroBitIndex = sectorBaseIndex;
      const notOneBitIndex = sectorBaseIndex + 1;
      const notTwoBitIndex = sectorBaseIndex + 2;
      const onlyOneBitIndex = sectorBaseIndex + 3;

      const isNotZero = scratchNumbers[ Math.floor( notZeroBitIndex / BITS_PER_NUMBER ) ] & ( 1 << ( notZeroBitIndex % BITS_PER_NUMBER ) );
      const isNotOne = scratchNumbers[ Math.floor( notOneBitIndex / BITS_PER_NUMBER ) ] & ( 1 << ( notOneBitIndex % BITS_PER_NUMBER ) );
      const isNotTwo = scratchNumbers[ Math.floor( notTwoBitIndex / BITS_PER_NUMBER ) ] & ( 1 << ( notTwoBitIndex % BITS_PER_NUMBER ) );
      const isOnlyOne = scratchNumbers[ Math.floor( onlyOneBitIndex / BITS_PER_NUMBER ) ] & ( 1 << ( onlyOneBitIndex % BITS_PER_NUMBER ) );

      if ( isOnlyOne && !isNotOne ) {
        featureSet.addSectorOnlyOne( this.patternBoard.sectors[ sectorIndex ] );
      }
      else if ( isNotOne && !isNotZero && !isNotTwo ) {
        featureSet.addSectorNotOne( this.patternBoard.sectors[ sectorIndex ] );
      }
      else if ( isNotZero && !isNotOne && !isNotTwo ) {
        featureSet.addSectorNotZero( this.patternBoard.sectors[ sectorIndex ] );
      }
      else if ( isNotTwo && !isNotZero && !isNotOne ) {
        featureSet.addSectorNotTwo( this.patternBoard.sectors[ sectorIndex ] );
      }
    }

    if ( this.shape.numFacePairs ) {
      const faceConnectivity = FaceConnectivity.get( this.patternBoard );

      for ( let pairIndex = 0; pairIndex < this.shape.numFacePairs; pairIndex++ ) {
        const samePairIndex = this.shape.faceOffset + 2 * pairIndex;
        const oppositePairIndex = samePairIndex + 1;
        const isSame = scratchNumbers[ Math.floor( samePairIndex / BITS_PER_NUMBER ) ] & ( 1 << ( samePairIndex % BITS_PER_NUMBER ) );
        const isOpposite = scratchNumbers[ Math.floor( oppositePairIndex / BITS_PER_NUMBER ) ] & ( 1 << ( oppositePairIndex % BITS_PER_NUMBER ) );

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

    return featureSet;
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

        const isBlack = this.bitData[ offset + Math.floor( originalBlackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( originalBlackIndex % BITS_PER_NUMBER ) );
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

        if ( this.bitData[ offset + Math.floor( originalBlackIndex / BITS_PER_NUMBER ) ] & ( 1 << ( originalBlackIndex % BITS_PER_NUMBER ) ) ) {
          solution.push( this.patternBoard.edges[ j ] );
        }
      }

      solutions.push( solution );
    }

    return solutions;
  }

  // TODO: don't use this, just directly "add" features to it by splitting/filtering(!)
  // TODO: partition( func ) => { with: SolutionSet | null, without: SolutionSet | null }
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
    const faceOffset = sectorOffset + 4 * numSectors;
    const bitsPerSolution = faceOffset + 2 * numFacePairs;
    const numNumbersPerSolution = Math.ceil( bitsPerSolution / BITS_PER_NUMBER );

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
          scratchNumbers[ Math.floor( blackBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( blackBitIndex % BITS_PER_NUMBER );

          const originalBlackBitIndex = 3 * edge.index + 2;
          scratchNumbers[ Math.floor( originalBlackBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( originalBlackBitIndex % BITS_PER_NUMBER );
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
            scratchNumbers[ Math.floor( redBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( redBitIndex % BITS_PER_NUMBER );
            assertEnabled() && assert( scratchNumbers[ Math.floor( redBitIndex / BITS_PER_NUMBER ) ] >= 0 );
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

          const sectorBaseIndex = sectorOffset + 4 * j;

          if ( count !== 0 ) {
            const notZeroBitIndex = sectorBaseIndex;
            scratchNumbers[ Math.floor( notZeroBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( notZeroBitIndex % BITS_PER_NUMBER );
            assertEnabled() && assert( scratchNumbers[ Math.floor( notZeroBitIndex / BITS_PER_NUMBER ) ] >= 0 );
          }

          if ( count !== 1 ) {
            const notOneBitIndex = sectorBaseIndex + 1;
            scratchNumbers[ Math.floor( notOneBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( notOneBitIndex % BITS_PER_NUMBER );
            assertEnabled() && assert( scratchNumbers[ Math.floor( notOneBitIndex / BITS_PER_NUMBER ) ] >= 0 );
          }

          if ( count !== 2 ) {
            const notTwoBitIndex = sectorBaseIndex + 2;
            scratchNumbers[ Math.floor( notTwoBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( notTwoBitIndex % BITS_PER_NUMBER );
            assertEnabled() && assert( scratchNumbers[ Math.floor( notTwoBitIndex / BITS_PER_NUMBER ) ] >= 0 );
          }

          if ( count === 1 ) {
            const onlyOneBitIndex = sectorBaseIndex + 3;
            scratchNumbers[ Math.floor( onlyOneBitIndex / BITS_PER_NUMBER ) ] |= 1 << ( onlyOneBitIndex % BITS_PER_NUMBER );
            assertEnabled() && assert( scratchNumbers[ Math.floor( onlyOneBitIndex / BITS_PER_NUMBER ) ] >= 0 );
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

          scratchNumbers[ Math.floor( facePairIndex / BITS_PER_NUMBER ) ] |= 1 << ( facePairIndex % BITS_PER_NUMBER );
          assertEnabled() && assert( scratchNumbers[ Math.floor( facePairIndex / BITS_PER_NUMBER ) ] >= 0 );
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