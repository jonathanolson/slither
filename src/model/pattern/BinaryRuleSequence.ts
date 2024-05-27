import { BinaryRuleCollection, SerializedBinaryRuleCollection } from './collection/BinaryRuleCollection.ts';
import { TPatternBoard } from './pattern-board/TPatternBoard.ts';
import { deserializePatternBoard } from './pattern-board/deserializePatternBoard.ts';
import { serializePatternBoard } from './pattern-board/serializePatternBoard.ts';
import { generalPatternBoardGenerations } from './generalPatternBoardGenerations.ts';
import { basicPatternBoards, edgePatternBoard, standardHexagonalBoardGenerations, standardSquareBoardGenerations, vertexExit2NoSectorsPatternBoard, vertexExit2OneSectorPatternBoard, vertexExit3TwoAdjacentSectorsPatternBoard, vertexExit4ThreeAdjacentSectorsPatternBoard, vertexExit4TwoOppositeSectorsPatternBoard, vertexNonExit2PatternBoard, vertexNonExit3PatternBoard, vertexNonExit4PatternBoard } from './pattern-board/patternBoards.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { planarPatternMaps } from './planarPatternMaps.ts';
import { getEmbeddings } from './embedding/getEmbeddings.ts';
import { getSolutionImpliedRules } from './generation/getSolutionImpliedRules.ts';

export type SequenceBoardType = 'general' | 'square' | 'hexagonal';

export class BinaryRuleSequence implements SequenceSpecifier {

  public readonly boardType: SequenceBoardType;

  public readonly solveEdges: boolean;
  public readonly solveSectors: boolean;
  public readonly solveFaceColors: boolean;
  public readonly highlander: boolean;
  public readonly vertexOrderLimit: number | null;

  public collection: BinaryRuleCollection;

  public processedBoards: TPatternBoard[];
  public currentBoards: TPatternBoard[];

  private constructor(
    serialized: SerializedBinaryRuleSequence,
  ) {
    this.boardType = serialized.boardType;

    this.solveEdges = serialized.solveEdges;
    this.solveSectors = serialized.solveSectors;
    this.solveFaceColors = serialized.solveFaceColors;
    this.highlander = serialized.highlander;
    this.vertexOrderLimit = serialized.vertexOrderLimit;

    this.collection = BinaryRuleCollection.deserialize( serialized.collection );

    this.processedBoards = serialized.processedBoards.map( deserializePatternBoard );
    this.currentBoards = serialized.currentBoards.map( deserializePatternBoard );
  }

  public getName(): string {
    return BinaryRuleSequence.getName( this );
  }

  public getGenerations(): TPatternBoard[][] {
    const generations = {
      general: [
        ...basicPatternBoards.map( board => [ board ] ), // each generation
        ...generalPatternBoardGenerations
      ],
      square: [
        // Explicitly listed boards
        [ edgePatternBoard ],
        [ vertexExit2NoSectorsPatternBoard ],
        [ vertexExit2OneSectorPatternBoard ],
        [ vertexExit3TwoAdjacentSectorsPatternBoard ],
        [ vertexExit4TwoOppositeSectorsPatternBoard ],
        [ vertexExit4ThreeAdjacentSectorsPatternBoard ],
        [ vertexNonExit2PatternBoard ],
        [ vertexNonExit3PatternBoard ],
        [ vertexNonExit4PatternBoard ],
        ...standardSquareBoardGenerations
      ],
      hexagonal: [
        ...basicPatternBoards.map( board => [ board ] ), // each generation
        ...standardHexagonalBoardGenerations
      ],
    }[ this.boardType ];
    assertEnabled() && assert( generations, `Unknown board type: ${this.boardType}` );

    return generations;
  }

  public getCurrentGeneration(): TPatternBoard[] | null {
    const generations = this.getGenerations();

    return generations.find( generation => generation.some( board => !this.processedBoards.includes( board ) ) ) ?? null;
  }

  public getNextBoard(): TPatternBoard | null {
    const currentGeneration = this.getCurrentGeneration();
    if ( currentGeneration ) {
      const remainingBoards = currentGeneration.filter( board => {
        return !this.processedBoards.includes( board ) && !this.currentBoards.includes( board );
      } );

      if ( remainingBoards.length ) {
        return remainingBoards[ 0 ];
      }
      else {
        // We are waiting on things to complete before we can move to the next generation
        return null;
      }
    }
    else {
      // We are complete!!!!
      return null;
    }
  }

  public getStatusString(): string {
    const name = this.getName();
    const currentGeneration = this.getCurrentGeneration();

    if ( currentGeneration ) {
      let status = `${name}\n`;

      const processedBoards = currentGeneration.filter( board => this.processedBoards.includes( board ) );
      const currentBoards = currentGeneration.filter( board => this.currentBoards.includes( board ) );
      assertEnabled() && assert( currentBoards.length === this.currentBoards.length );

      const remainingBoards = currentGeneration.filter( board => {
        return !this.processedBoards.includes( board ) && !this.currentBoards.includes( board );
      } );

      const lengthString = ( length: number ) => {
        let percentageString = `${Math.floor( 100 * length / currentGeneration.length )}`;
        if ( percentageString.length === 1 ) {
          percentageString = ' ' + percentageString;
        }
        let lengthString = `${length}`;
        while ( lengthString.length < `${currentGeneration.length}`.length ) {
          lengthString = ' ' + lengthString;
        }
        return `${percentageString}% ${lengthString}/${currentGeneration.length}`;
      };
      const boardsString = ( boards: TPatternBoard[], name: string ) => {
        return `  ${lengthString( boards.length )} ${name} ${boards.map( board => board.name ).join( ', ' )}\n`;
      };

      status += boardsString( processedBoards, 'processed | ' );
      status += boardsString( currentBoards, 'current   | ' );
      status += boardsString( remainingBoards, 'remaining | ' );

      return status;
    }
    else {
      return `${name} (complete)`;
    }
  }

  public getCollectionForBoard( patternBoard: TPatternBoard ): BinaryRuleCollection {

    const planarPatternMap = planarPatternMaps.get( patternBoard )!;
    assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

    const filteredCollection = this.collection.withPatternBoardFilter( sourcePatternBoard => {
      return getEmbeddings( sourcePatternBoard, patternBoard ).length > 0;
    } );

    const rules = getSolutionImpliedRules( patternBoard, {
      solveEdges: this.solveEdges,
      solveSectors: this.solveSectors,
      solveFaceColors: this.solveFaceColors,
      highlander: this.highlander,
      vertexOrderLimit: this.vertexOrderLimit,
      includeFaceValueZero: patternBoard.faces.filter( face => !face.isExit ).length === 1,
      prefilterRules: filteredCollection.getRules(),
    } );

    return BinaryRuleCollection.fromRules( rules );
  }

  public addProcessingBoard( patternBoard: TPatternBoard ): void {
    this.currentBoards.push( patternBoard );
  }

  public removeProcessingBoard( patternBoard: TPatternBoard ): void {
    this.currentBoards = this.currentBoards.filter( board => board !== patternBoard );
  }

  public addProcessedBoardCollection( patternBoard: TPatternBoard, collection: BinaryRuleCollection ): void {
    // TODO: is this OK for memory? should be, right?
    this.collection = this.collection.withRules( collection.getRules() );

    this.processedBoards.push( patternBoard );
    this.removeProcessingBoard( patternBoard );
  }

  public serialize(): SerializedBinaryRuleSequence {
    return {
      boardType: this.boardType,

      solveEdges: this.solveEdges,
      solveSectors: this.solveSectors,
      solveFaceColors: this.solveFaceColors,
      highlander: this.highlander,
      vertexOrderLimit: this.vertexOrderLimit,

      collection: this.collection.serialize(),

      processedBoards: this.processedBoards.map( serializePatternBoard ),
      currentBoards: this.currentBoards.map( serializePatternBoard ),
    };
  }

  public static deserialize( serialized: SerializedBinaryRuleSequence ): BinaryRuleSequence {
    return new BinaryRuleSequence( serialized );
  }

  public static empty( sequenceSpecifier: SequenceSpecifier ): BinaryRuleSequence {
    return new BinaryRuleSequence( {
      boardType: sequenceSpecifier.boardType,

      solveEdges: sequenceSpecifier.solveEdges,
      solveSectors: sequenceSpecifier.solveSectors,
      solveFaceColors: sequenceSpecifier.solveFaceColors,
      highlander: sequenceSpecifier.highlander,
      vertexOrderLimit: sequenceSpecifier.vertexOrderLimit,

      collection: BinaryRuleCollection.empty().serialize(),

      processedBoards: [],
      currentBoards: [],
    } );
  }

  public static getName( sequenceSpecifier: SequenceSpecifier ): string {
    let name = `${sequenceSpecifier.boardType}-`;
    if ( sequenceSpecifier.vertexOrderLimit !== null ) {
      if (
        ( sequenceSpecifier.boardType === 'square' && sequenceSpecifier.vertexOrderLimit === 4 ) ||
        ( sequenceSpecifier.boardType === 'hexagonal' && sequenceSpecifier.vertexOrderLimit === 3 )
      ) {
        name += 'only-';
      }
      else {
        throw new Error( 'Specify naming convention for vertexOrderLimit' );
      }
    }
    if ( sequenceSpecifier.solveEdges && sequenceSpecifier.solveSectors && sequenceSpecifier.solveFaceColors ) {
      name += 'all';
    }
    else {
      let needsDash = false;
      if ( sequenceSpecifier.solveEdges ) {
        name += 'edge';
        needsDash = true;
      }
      if ( sequenceSpecifier.solveSectors ) {
        if ( needsDash ) {
          name += '-';
        }
        name += 'sector';
        needsDash = true;
      }
      if ( sequenceSpecifier.solveFaceColors ) {
        if ( needsDash ) {
          name += '-';
        }
        name += 'color';
        needsDash = true;
      }
    }
    if ( !sequenceSpecifier.highlander ) {
      name += '-unrestricted';
    }
    return name;
  }
}

export type SequenceSpecifier = {
  boardType: SequenceBoardType;

  // Solve parameters
  solveEdges: boolean;
  solveSectors: boolean;
  solveFaceColors: boolean;
  highlander: boolean;
  vertexOrderLimit: number | null;
};

export type SerializedBinaryRuleSequence = SequenceSpecifier & {

  // Rule collection
  // NOTE: used directly in combine-collections script so we avoid more browser stuff
  collection: SerializedBinaryRuleCollection;

  // Boards that have been completed, even if they provided no rules
  processedBoards: string[]; // serializePatternBoard

  // Boards that are currently being processed
  currentBoards: string[]; // serializePatternBoard
};