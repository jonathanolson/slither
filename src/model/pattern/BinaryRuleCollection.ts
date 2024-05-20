import { TPatternBoard } from './TPatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { compressByteArray, decompressByteArray } from '../../util/compression.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { PatternRule } from './PatternRule.ts';
import _ from '../../workarounds/_.ts';
import { PatternBoardRuleSet } from './PatternBoardRuleSet.ts';
import { getEmbeddings } from './getEmbeddings.ts';
import { TBoardFeatureData } from './TBoardFeatureData.ts';
import { Embedding } from './Embedding.ts';
import { getBinaryFeatureMapping } from './BinaryFeatureMapping.ts';
import FeatureSetMatchState from './FeatureSetMatchState.ts';
import { TBoard } from '../board/core/TBoard.ts';

export class BinaryRuleCollection {

  private constructor(
    public readonly patternBoards: TPatternBoard[],
    public data: Uint8Array,
    public readonly ruleIndices: number[],
    public nextRuleIndex: number,
    public highlander: boolean,
  ) {}

  public addRule( rule: PatternRule ): void {
    if ( !this.patternBoards.includes( rule.patternBoard ) ) {
      this.patternBoards.push( rule.patternBoard );
    }
    const addedBytes = rule.getBinary( this.patternBoards );

    if ( this.nextRuleIndex + addedBytes.length > this.data.length ) {
      this.allocateMoreSpace( addedBytes.length );
    }

    this.highlander ||= rule.highlander;
    this.data.set( addedBytes, this.nextRuleIndex );
    this.ruleIndices.push( this.nextRuleIndex );
    this.nextRuleIndex += addedBytes.length;
  }

  public getRules(): PatternRule[] {
    const rules: PatternRule[] = [];

    this.forEachRule( rule => rules.push( rule ) );

    return rules;
  }

  public get size(): number {
    return this.ruleIndices.length;
  }

  private allocateMoreSpace( neededBytes: number ) {
    const newSize = Math.max( this.data.length * 2, this.data.length + neededBytes );

    const newData = new Uint8Array( newSize );
    newData.set( this.data, 0 );
    this.data = newData;
  }

  public getRule( index: number ): PatternRule {
    return PatternRule.fromBinary( this.patternBoards, this.data, this.ruleIndices[ index ], this.highlander );
  }

  public forEachRule( callback: ( rule: PatternRule ) => void ): void {
    for ( let i = 0; i < this.ruleIndices.length; i++ ) {
      callback( this.getRule( i ) );
    }
  }

  public withPatternBoardFilter( patternBoardFilter: ( patternBoard: TPatternBoard ) => boolean ): BinaryRuleCollection {
    const includedMap = this.patternBoards.map( patternBoardFilter );
    const filteredPatternBoards = this.patternBoards.filter( ( _, i ) => includedMap[ i ] );

    const bytes: number[] = [];
    const ruleIndices = [
      ...this.ruleIndices
    ];
    let nextRuleIndex = this.nextRuleIndex;

    for ( let i = 0; i < this.ruleIndices.length; i++ ) {
      const startIndex = this.ruleIndices[ i ];
      const patternBoardIndex = this.data[ startIndex ];

      if ( includedMap[ patternBoardIndex ] ) {
        const endIndex = i + 1 < this.ruleIndices.length ? this.ruleIndices[ i + 1 ] : this.data.length;
        bytes.push( ...this.data.slice( startIndex, endIndex ) );
        ruleIndices.push( nextRuleIndex );
        nextRuleIndex = bytes.length;
      }
    }

    return new BinaryRuleCollection( filteredPatternBoards, new Uint8Array( bytes ), ruleIndices, nextRuleIndex, this.highlander );
  }

  public withRules( rules: PatternRule[] ): BinaryRuleCollection {
    const isHighlander = this.highlander || rules.some( rule => rule.highlander );
    const patternBoards = _.uniq( [
      ...this.patternBoards,
      ...rules.map( rule => rule.patternBoard ),
    ] );

    const bytes: number[] = [
      ...this.data
    ];
    const ruleIndices = [
      ...this.ruleIndices
    ];
    let nextRuleIndex = this.nextRuleIndex;

    for ( const rule of rules ) {
      bytes.push( ...rule.getBinary( patternBoards ) );
      ruleIndices.push( nextRuleIndex );
      nextRuleIndex = bytes.length;
    }

    return new BinaryRuleCollection( patternBoards, new Uint8Array( bytes ), ruleIndices, nextRuleIndex, isHighlander );
  }

  public withNonredundantRuleSet( ruleSet: PatternBoardRuleSet, maxScore = Number.POSITIVE_INFINITY ): BinaryRuleCollection {
    const currentEmbeddedRules = this.getRules().flatMap( currentRule => currentRule.getEmbeddedRules( getEmbeddings( currentRule.patternBoard, ruleSet.patternBoard ) ) );
    console.log( 'embedded', currentEmbeddedRules.length );

    let totalScoreSum = 0;
    let count = 0;
    let skipCount = 0;
    let maxEncounteredScore = 0;

    const addedRules: PatternRule[] = [];

    for ( const rule of ruleSet.rules ) {
      const score = rule.getInputDifficultyScoreA();

      maxEncounteredScore = Math.max( maxEncounteredScore, score );

      if ( ruleSet.patternBoard.faces.length > 1 && score > maxScore ) {
        skipCount++;
        continue;
      }

      if ( !rule.isRedundant( currentEmbeddedRules ) ) {
        addedRules.push( rule );

        totalScoreSum += score;
        count++;

        currentEmbeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, ruleSet.patternBoard ) ) );
        if ( addedRules.length % 100 === 0 ) {
          console.log( 'embedded X', currentEmbeddedRules.length );
        }
      }
    }

    console.log( `added ${count}, skipped ${skipCount} with average score ${Math.round( totalScoreSum / count )}, maxEncounteredScore ${maxEncounteredScore}` );

    return this.withRules( addedRules );
  }

  public withCollection( ruleCollection: BinaryRuleCollection ): BinaryRuleCollection {
    const theirRules = ruleCollection.getRules();

    let lastPatternBoard: TPatternBoard | null = null;
    let embeddedRules: PatternRule[] = [];

    const addedRules: PatternRule[] = [];

    for ( let i = 0; i < theirRules.length; i++ ) {
      if ( i % 100 === 0 ) {
        console.log( i, theirRules.length );
      }
      const rule = theirRules[ i ];

      const targetPatternBoard = rule.patternBoard;

      if ( targetPatternBoard !== lastPatternBoard ) {
        embeddedRules = this.getRules().flatMap( currentRule => currentRule.getEmbeddedRules( getEmbeddings( currentRule.patternBoard, targetPatternBoard ) ) );
        lastPatternBoard = targetPatternBoard;
      }

      if ( !rule.isRedundant( embeddedRules ) ) {
        addedRules.push( rule );
        embeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, targetPatternBoard ) ) );
      }
    }

    return this.withRules( addedRules );
  }

  // TODO: see which is faster, isActionableEmbeddingFromData or getActionableEmbeddingsFromData
  public findNextActionableEmbeddedRuleFromData(
    targetPatternBoard: TPatternBoard,
    boardData: TBoardFeatureData,
    initialRuleIndex = 0
  ): { rule: PatternRule; embeddedRule: PatternRule; embedding: Embedding; ruleIndex: number } | null {
    for ( let ruleIndex = initialRuleIndex; ruleIndex < this.ruleIndices.length; ruleIndex++ ) {

      const byteIndex = this.ruleIndices[ ruleIndex ];
      const patternBoardIndex = this.data[ byteIndex ];
      const patternBoard = this.patternBoards[ patternBoardIndex ];

      // TODO: don't memory leak this!
      const embeddings = getEmbeddings( patternBoard, targetPatternBoard );

      for ( const embedding of embeddings ) {
        if ( this.isActionableEmbeddingFromData( targetPatternBoard, boardData, ruleIndex, embedding ) ) {
          // TODO: in what cases will this NOT return a rule???
          const rule = this.getRule( ruleIndex );
          const embeddedRule = rule.embedded( targetPatternBoard, embedding );

          if ( assertEnabled() ) {
            // if ( !( rule.inputFeatureSet.getBoardMatchState( boardData, embedding, true ) === FeatureSetMatchState.MATCH ) ) {
            //   debugger;
            //   const tmp = this.isActionableEmbeddingFromData( targetPatternBoard, boardData, ruleIndex, embedding );
            // }
            assert( rule.inputFeatureSet.getBoardMatchState( boardData, embedding, true ) === FeatureSetMatchState.MATCH );


            // Is our output not fully satisfied!
            assert( rule.outputFeatureSet.getBoardMatchState( boardData, embedding, true ) !== FeatureSetMatchState.MATCH );

            assert( !!rule.inputFeatureSet.embedded( patternBoard, embedding ) );
          }

          if ( embeddedRule ) {
            return {
              rule,
              embeddedRule,
              embedding,
              ruleIndex
            };
          }
          else {
            throw new Error( 'Why would this happen' );
          }
        }
      }
    }

    return null;
  }

  public isActionableEmbeddingFromData( targetPatternBoard: TPatternBoard, boardData: TBoardFeatureData, ruleIndex: number, embedding: Embedding ): boolean {
    let byteIndex = this.ruleIndices[ ruleIndex ];
    const patternBoardIndex = this.data[ byteIndex++ ];
    const patternBoard = this.patternBoards[ patternBoardIndex ];
    assertEnabled() && assert( patternBoard, 'pattern board' );

    const binaryMapping = getBinaryFeatureMapping( patternBoard );

    // Input features, filter by the "input" of the pattern
    while ( true ) {
      const firstByte = this.data[ byteIndex++ ];

      if ( firstByte === 0xff ) {
        break;
      }
      else if ( firstByte === 0xfe ) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[ byteIndex++ ];
        assertEnabled() && assert( mainPrimaryFaceIndex < 0x80 );

        while ( true ) {
          const nextByte = this.data[ byteIndex++ ];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if ( nextByte === 0xff || nextByte === 0xfe ) {
            byteIndex--;
            break;
          }

          if ( nextByte & 0x80 ) {
            const secondaryFaceIndex = nextByte & 0x7f;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const secondaryColorFromFirstPrimary = boardData.oppositeFaceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
            const secondaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ secondaryFaceIndex ] ).index ];

            if ( secondaryColorFromFirstPrimary !== secondaryColorDirect ) {
              return false;
            }
          }
          else {
            const primaryFaceIndex = nextByte;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const primaryColorFromFirstPrimary = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
            const primaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ primaryFaceIndex ] ).index ];

            if ( primaryColorFromFirstPrimary !== primaryColorDirect ) {
              return false;
            }
          }
        }
      }
      else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[ firstByte ];

        if ( featureMatcher( boardData, embedding ) !== FeatureSetMatchState.MATCH ) {
          return false;
        }
      }
    }

    // Output features, see which embedded rules are actionable (would change the state)
    while ( true ) {
      const firstByte = this.data[ byteIndex++ ];

      if ( firstByte === 0xff ) {
        break;
      }
      else if ( firstByte === 0xfe ) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[ byteIndex++ ];
        assertEnabled() && assert( mainPrimaryFaceIndex < 0x80 );

        while ( true ) {
          const nextByte = this.data[ byteIndex++ ];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if ( nextByte === 0xff || nextByte === 0xfe ) {
            byteIndex--;
            break;
          }

          if ( nextByte & 0x80 ) {
            const secondaryFaceIndex = nextByte & 0x7f;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const secondaryColorFromFirstPrimary = boardData.oppositeFaceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
            const secondaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ secondaryFaceIndex ] ).index ];

            if ( secondaryColorFromFirstPrimary !== secondaryColorDirect ) {
              return true;
            }
          }
          else {
            const primaryFaceIndex = nextByte;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const primaryColorFromFirstPrimary = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
            const primaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ primaryFaceIndex ] ).index ];

            if ( primaryColorFromFirstPrimary !== primaryColorDirect ) {
              return true;
            }
          }
        }
      }
      else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[ firstByte ];

        if ( featureMatcher( boardData, embedding ) !== FeatureSetMatchState.MATCH ) {
          return true;
        }
      }
    }

    // this is "inconsequential", state already contains the rule input and output
    return false;
  }

  // TODO: Or just take BoardPatternBoard right now?
  public getActionableEmbeddingsFromData( targetPatternBoard: TPatternBoard, boardData: TBoardFeatureData, ruleIndex: number ): Embedding[] {
    let byteIndex = this.ruleIndices[ ruleIndex ];
    const patternBoardIndex = this.data[ byteIndex++ ];
    const patternBoard = this.patternBoards[ patternBoardIndex ];
    assertEnabled() && assert( patternBoard, 'pattern board' );

    const binaryMapping = getBinaryFeatureMapping( patternBoard );

    // ping-pong back-and-forth between the two
    let embeddings = getEmbeddings( patternBoard, targetPatternBoard );
    let nextEmbeddings = embeddings.slice();

    // Input features, filter by the "input" of the pattern
    while ( true ) {
      const firstByte = this.data[ byteIndex++ ];
      let nextEmbeddingIndex = 0;

      if ( firstByte === 0xff ) {
        break;
      }
      else if ( firstByte === 0xfe ) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[ byteIndex++ ];
        assertEnabled() && assert( mainPrimaryFaceIndex < 0x80 );

        while ( true ) {
          const nextByte = this.data[ byteIndex++ ];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if ( nextByte === 0xff || nextByte === 0xfe ) {
            byteIndex--;
            break;
          }

          if ( nextByte & 0x80 ) {
            const secondaryFaceIndex = nextByte & 0x7f;

            for ( let i = 0; i < embeddings.length; i++ ) {
              const embedding = embeddings[ i ];

              // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
              const secondaryColorFromFirstPrimary = boardData.oppositeFaceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
              const secondaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ secondaryFaceIndex ] ).index ];

              if ( secondaryColorFromFirstPrimary === secondaryColorDirect ) {
                nextEmbeddings[ nextEmbeddingIndex++ ] = embedding;
              }
            }

          }
          else {
            const primaryFaceIndex = nextByte;

            for ( let i = 0; i < embeddings.length; i++ ) {
              const embedding = embeddings[ i ];

              // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
              const primaryColorFromFirstPrimary = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
              const primaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ primaryFaceIndex ] ).index ];

              if ( primaryColorFromFirstPrimary === primaryColorDirect ) {
                nextEmbeddings[ nextEmbeddingIndex++ ] = embedding;
              }
            }
          }

          /////////////////////

          // Trim the next embeddings array
          nextEmbeddings.length = nextEmbeddingIndex;

          // Early-abort check (if no more embeddings are possible, abort)
          if ( nextEmbeddingIndex === 0 ) {
            return nextEmbeddings;
          }

          // Swap embeddings
          const temp = embeddings;
          embeddings = nextEmbeddings;
          nextEmbeddings = temp;
          nextEmbeddingIndex = 0;
          /////////////////////
        }
      }
      else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[ firstByte ];

        for ( let i = 0; i < embeddings.length; i++ ) {
          const embedding = embeddings[ i ];

          if ( featureMatcher( boardData, embedding ) === FeatureSetMatchState.MATCH ) {
            nextEmbeddings[ nextEmbeddingIndex++ ] = embedding;
          }
        }

        /////////////////////

        // Trim the next embeddings array
        nextEmbeddings.length = nextEmbeddingIndex;

        // Early-abort check (if no more embeddings are possible, abort)
        if ( nextEmbeddingIndex === 0 ) {
          return nextEmbeddings;
        }

        // Swap embeddings
        const temp = embeddings;
        embeddings = nextEmbeddings;
        nextEmbeddings = temp;
        nextEmbeddingIndex = 0;
        /////////////////////
      }
    }

    // Output features, see which embedded rules are actionable (would change the state)
    const isActionable = embeddings.map( () => false );
    let actionableCount = 0;
    while ( true ) {
      const firstByte = this.data[ byteIndex++ ];

      if ( firstByte === 0xff ) {
        break;
      }
      else if ( firstByte === 0xfe ) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[ byteIndex++ ];
        assertEnabled() && assert( mainPrimaryFaceIndex < 0x80 );

        while ( true ) {
          const nextByte = this.data[ byteIndex++ ];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if ( nextByte === 0xff || nextByte === 0xfe ) {
            byteIndex--;
            break;
          }

          if ( nextByte & 0x80 ) {
            const secondaryFaceIndex = nextByte & 0x7f;

            for ( let i = 0; i < embeddings.length; i++ ) {
              if ( !isActionable[ i ] ) {
                const embedding = embeddings[ i ];

                // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
                const secondaryColorFromFirstPrimary = boardData.oppositeFaceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
                const secondaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ secondaryFaceIndex ] ).index ];

                if ( secondaryColorFromFirstPrimary !== secondaryColorDirect ) {
                  isActionable[ i ] = true;
                  actionableCount++;
                }
              }
            }

          }
          else {
            const primaryFaceIndex = nextByte;

            for ( let i = 0; i < embeddings.length; i++ ) {
              if ( !isActionable[ i ] ) {
                const embedding = embeddings[ i ];

                // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
                const primaryColorFromFirstPrimary = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ mainPrimaryFaceIndex ] ).index ];
                const primaryColorDirect = boardData.faceColors[ embedding.mapFace( patternBoard.faces[ primaryFaceIndex ] ).index ];

                if ( primaryColorFromFirstPrimary !== primaryColorDirect ) {
                  isActionable[ i ] = true;
                  actionableCount++;
                }
              }
            }
          }
        }
      }
      else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[ firstByte ];

        for ( let i = 0; i < embeddings.length; i++ ) {
          if ( !isActionable[ i ] ) {
            const embedding = embeddings[ i ];

            if ( featureMatcher( boardData, embedding ) !== FeatureSetMatchState.MATCH ) {
              isActionable[ i ] = true;
              actionableCount++;
            }
          }
        }
      }
    }

    if ( actionableCount ) {
      return embeddings.filter( ( _, i ) => isActionable[ i ] );
    }
    else {
      return []; // TODO: see if we should reduce the size of an array and return that instead for GC
    }
  }

  public serialize(): SerializedBinaryRuleCollection {
    return {
      patternBoards: this.patternBoards.map( serializePatternBoard ),
      rules: compressByteArray( this.data.subarray( 0, this.nextRuleIndex ) ),
      highlander: this.highlander,
    };
  }

  // NOTE: Assumes that the typed array is "full but exact length", as we clip it during serialization.
  public static deserialize( serialized: SerializedBinaryRuleCollection ): BinaryRuleCollection {
    const data = decompressByteArray( serialized.rules );
    if ( !data ) {
      throw new Error( 'Failed to decompress rules!' );
    }

    let index = 0;
    const ruleIndices: number[] = [];
    while ( index < data.length ) {
      ruleIndices.push( index );

      let patternEndCount = 0;
      while ( patternEndCount < 2 ) {
        assertEnabled() && assert( index < data.length, 'Unexpected end of data' );

        if ( data[ index++ ] === 0xff ) {
          patternEndCount++;
        }
      }
    }

    return new BinaryRuleCollection(
      serialized.patternBoards.map( deserializePatternBoard ),
      data,
      ruleIndices,
      data.length,
      serialized.highlander,
    );
  }

  public static empty(): BinaryRuleCollection {
    return new BinaryRuleCollection( [], new Uint8Array( 0 ), [], 0, false );
  }

  public static fromRules( rules: PatternRule[] ): BinaryRuleCollection {
    const isHighlander = rules.some( rule => rule.highlander );
    const patternBoards = _.uniq( rules.map( rule => rule.patternBoard ) );

    const bytes: number[] = [];
    let nextRuleIndex = 0;
    const ruleIndices: number[] = [];

    for ( const rule of rules ) {
      bytes.push( ...rule.getBinary( patternBoards ) );
      ruleIndices.push( nextRuleIndex );
      nextRuleIndex = bytes.length;
    }

    return new BinaryRuleCollection( patternBoards, new Uint8Array( bytes ), ruleIndices, nextRuleIndex, isHighlander );
  }
}

export type SerializedBinaryRuleCollection = {
  patternBoards: string[]; // serializePatternBoard / deserializePatternBoard, hopefully the board name often
  rules: string; // base64? compressed?
  highlander: boolean;
};