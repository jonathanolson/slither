import { Embedding } from '../embedding/Embedding.ts';
import { getEmbeddings } from '../embedding/getEmbeddings.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import FeatureSetMatchState from '../feature/FeatureSetMatchState.ts';
import { TBoardFeatureData } from '../feature/TBoardFeatureData.ts';
import { getBinaryFeatureMapping } from '../generation/BinaryFeatureMapping.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { deserializePatternBoard } from '../pattern-board/deserializePatternBoard.ts';
import { serializePatternBoard } from '../pattern-board/serializePatternBoard.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';
import PatternRuleMatchState from '../pattern-rule/PatternRuleMatchState.ts';
import { isPatternRuleValid } from '../pattern-rule/isPatternRuleValid.ts';
import { ActionableRuleEmbedding } from './ActionableRuleEmbedding.ts';

import { compressByteArray, decompressByteArray } from '../../../util/compression.ts';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class BinaryRuleCollection {
  // TODO: note that BinaryMixedRuleCollection... extends this(!)
  private constructor(
    public readonly patternBoards: TPatternBoard[],
    public data: Uint8Array,
    public readonly ruleIndices: number[],
    public nextRuleIndex: number,
    public highlander: boolean,
  ) {
    if (assertEnabled()) {
      for (let i = 0; i < ruleIndices.length; i++) {
        assert(data[ruleIndices[i]] < patternBoards.length, 'pattern board index');
      }
    }
  }

  public clone(): BinaryRuleCollection {
    return new BinaryRuleCollection(
      this.patternBoards.slice(),
      new Uint8Array(this.data),
      this.ruleIndices.slice(),
      this.nextRuleIndex,
      this.highlander,
    );
  }

  public addRule(rule: PatternRule): void {
    if (!this.patternBoards.includes(rule.patternBoard)) {
      this.patternBoards.push(rule.patternBoard);
    }
    const addedBytes = rule.getBinary(this.patternBoards);

    if (this.nextRuleIndex + addedBytes.length > this.data.length) {
      this.allocateMoreSpace(addedBytes.length);
    }

    this.highlander ||= rule.highlander;
    this.data.set(addedBytes, this.nextRuleIndex);
    this.ruleIndices.push(this.nextRuleIndex);
    this.nextRuleIndex += addedBytes.length;
  }

  // TODO: factor out shared code above?!?
  public addRuleSuffixBytes(
    patternBoard: TPatternBoard,
    bytesSuffix: number[], // NOT including the patternBoard byte
    isHighlander: boolean,
  ): void {
    if (!this.patternBoards.includes(patternBoard)) {
      this.patternBoards.push(patternBoard);
    }

    const addedBytes = [this.patternBoards.indexOf(patternBoard), ...bytesSuffix];

    if (this.nextRuleIndex + addedBytes.length > this.data.length) {
      this.allocateMoreSpace(addedBytes.length);
    }

    this.highlander ||= isHighlander;
    this.data.set(addedBytes, this.nextRuleIndex);
    this.ruleIndices.push(this.nextRuleIndex);
    this.nextRuleIndex += addedBytes.length;
  }

  public getRules(): PatternRule[] {
    const rules: PatternRule[] = [];

    this.forEachRule((rule) => rules.push(rule));

    return rules;
  }

  public get size(): number {
    return this.ruleIndices.length;
  }

  private allocateMoreSpace(neededBytes: number) {
    const newSize = Math.max(this.data.length * 2, this.data.length + neededBytes);

    const newData = new Uint8Array(newSize);
    newData.set(this.data, 0);
    this.data = newData;
  }

  // Gets the rule at a specific index (e.g. 0 for rule 0, 1 for rule 1, etc.)
  public getRule(ruleIndex: number, highlanderOverride?: boolean): PatternRule {
    return PatternRule.fromBinary(
      this.patternBoards,
      this.data,
      this.ruleIndices[ruleIndex],
      highlanderOverride === undefined ? this.highlander : highlanderOverride,
    );
  }

  // Gets the bytes for a rule at a specific index (e.g. 0 for rule 0, 1 for rule 1, etc.)
  // First byte includes pattern board info, and may not be desired for some approaches
  public getRuleBytes(ruleIndex: number, includeFirstByte: boolean): number[] {
    const startIndex = this.ruleIndices[ruleIndex];
    const endIndex = ruleIndex + 1 < this.ruleIndices.length ? this.ruleIndices[ruleIndex + 1] : this.nextRuleIndex;

    const bytes: number[] = [];
    for (let i = includeFirstByte ? startIndex : startIndex + 1; i < endIndex; i++) {
      bytes.push(this.data[i]);
    }

    return bytes;
  }

  // Gets the pattern board for a rule at a specific index.
  public getRulePatternBoard(ruleIndex: number): TPatternBoard {
    return this.patternBoards[this.data[this.ruleIndices[ruleIndex]]];
  }

  public forEachRule(callback: (rule: PatternRule) => void): void {
    for (let i = 0; i < this.ruleIndices.length; i++) {
      callback(this.getRule(i));
    }
  }

  public withPatternBoardFilter(patternBoardFilter: (patternBoard: TPatternBoard) => boolean): BinaryRuleCollection {
    const includedMap = this.patternBoards.map(patternBoardFilter);
    const filteredPatternBoards = this.patternBoards.filter((_, i) => includedMap[i]);

    const bytes: number[] = [];
    const ruleIndices: number[] = [];
    let nextRuleIndex = 0;

    for (let i = 0; i < this.ruleIndices.length; i++) {
      const startIndex = this.ruleIndices[i];
      const patternBoardIndex = this.data[startIndex];
      assertEnabled() && assert(patternBoardIndex < this.patternBoards.length, 'pattern board index');

      if (includedMap[patternBoardIndex]) {
        const newPatternBoardIndex = filteredPatternBoards.indexOf(this.patternBoards[patternBoardIndex]);
        assertEnabled() && assert(newPatternBoardIndex !== -1, 'pattern board index');

        const endIndex = i + 1 < this.ruleIndices.length ? this.ruleIndices[i + 1] : this.data.length;

        // Replace the first byte with the new pattern board index
        bytes.push(newPatternBoardIndex, ...this.data.slice(startIndex + 1, endIndex));

        ruleIndices.push(nextRuleIndex);
        assertEnabled() && assert(bytes[nextRuleIndex] === newPatternBoardIndex, 'pattern board index');
        nextRuleIndex = bytes.length;
      }
    }

    return new BinaryRuleCollection(
      filteredPatternBoards,
      new Uint8Array(bytes),
      ruleIndices,
      nextRuleIndex,
      this.highlander,
    );
  }

  public withRules(rules: PatternRule[]): BinaryRuleCollection {
    const isHighlander = this.highlander || rules.some((rule) => rule.highlander);
    const patternBoards = _.uniq([...this.patternBoards, ...rules.map((rule) => rule.patternBoard)]);

    const bytes: number[] = [...this.data];
    const ruleIndices = [...this.ruleIndices];
    let nextRuleIndex = this.nextRuleIndex;

    for (const rule of rules) {
      bytes.push(...rule.getBinary(patternBoards));
      ruleIndices.push(nextRuleIndex);
      nextRuleIndex = bytes.length;
    }

    return new BinaryRuleCollection(patternBoards, new Uint8Array(bytes), ruleIndices, nextRuleIndex, isHighlander);
  }

  public withCollection(ruleCollection: BinaryRuleCollection): BinaryRuleCollection {
    const combinedCollection = this.clone();

    ruleCollection.forEachRule((rule) => {
      combinedCollection.addRule(rule);
    });

    return combinedCollection;
  }

  public withCollectionNonequal(ruleCollection: BinaryRuleCollection): BinaryRuleCollection {
    const combinedCollection = this.clone();

    let count = 0;

    const ourRules = this.getRules();

    ruleCollection.forEachRule((rule) => {
      if (count % 100 === 0) {
        console.log(count, `${this.size} + ${ruleCollection.size}`);
      }
      count++;

      // Handle "exact" duplicate rule removal
      if (ourRules.every((ourRule) => !rule.equals(ourRule))) {
        combinedCollection.addRule(rule);
      }
    });

    return combinedCollection;
  }

  public withCollectionNonredundant(ruleCollection: BinaryRuleCollection): BinaryRuleCollection {
    const combinedCollection = this.clone();

    let count = 0;

    ruleCollection.forEachRule((rule) => {
      if (count % 100 === 0) {
        console.log(count, `${this.size} + ${ruleCollection.size}`);
      }
      count++;

      if (!combinedCollection.isRuleRedundant(rule)) {
        combinedCollection.addRule(rule);
      }
    });

    return combinedCollection;
  }

  public withoutCollectionNonequal(ruleCollection: BinaryRuleCollection): BinaryRuleCollection {
    const subtractedCollection = BinaryRuleCollection.empty();

    let count = 0;

    const theirRules = ruleCollection.getRules();

    this.forEachRule((rule) => {
      if (count % 100 === 0) {
        console.log(count, `${this.size} - ${ruleCollection.size}`);
      }
      count++;

      if (theirRules.every((theirRule) => !rule.equals(theirRule))) {
        subtractedCollection.addRule(rule);
      }
    });

    return subtractedCollection;
  }

  // Kind of opposite of above. Returns rules in THIS collection that are not redundant with the other collection
  // Meant to be called on a highlander collection, with the corresponding non-highlander collection as parameter.
  public withoutCollectionNonredundant(ruleCollection: BinaryRuleCollection): BinaryRuleCollection {
    const subtractedCollection = BinaryRuleCollection.empty();

    let count = 0;

    this.forEachRule((rule) => {
      if (count % 100 === 0) {
        console.log(count, `${this.size} - ${ruleCollection.size}`);
      }
      count++;

      if (!ruleCollection.isRuleRedundant(rule)) {
        subtractedCollection.addRule(rule);
      }
    });

    return subtractedCollection;
  }

  public withRulesApplied(
    initialFeatureSet: FeatureSet,
    canStopEarly: (currentFeatureSet: FeatureSet) => boolean = () => false,
  ): FeatureSet {
    // TODO: do full rule matching(?) but it seems like subsetting would be more difficult...? This is more about memory optimization, no? Otherwise just use PatternRule version

    const featureState = initialFeatureSet.clone();

    // const debugApplied: { rule: PatternRule; embedding: Embedding; embeddedRule: PatternRule; ruleIndex: number }[] = [];

    while (true) {
      const initialState = featureState.clone();

      // isActionableEmbeddingFromFeatureSet( featureSet: FeatureSet, ruleIndex: number, embedding: Embedding )
      // TODO: see if we can share embeddings from previous rules?

      let lastPatternBoard: TPatternBoard | null = null;
      let lastEmbeddings: Embedding[] = [];

      for (let ruleIndex = 0; ruleIndex < this.ruleIndices.length; ruleIndex++) {
        const byteIndex = this.ruleIndices[ruleIndex];
        const patternBoardIndex = this.data[byteIndex];
        const patternBoard = this.patternBoards[patternBoardIndex];

        if (patternBoard !== lastPatternBoard) {
          lastPatternBoard = patternBoard;
          lastEmbeddings = getEmbeddings(patternBoard, initialFeatureSet.patternBoard);
        }

        const embeddings = lastEmbeddings;

        for (const embedding of embeddings) {
          if (this.isActionableEmbeddingFromFeatureSet(featureState, ruleIndex, embedding)) {
            const rule = this.getRule(ruleIndex);
            const embeddedRule = rule.embedded(featureState.patternBoard, embedding)!;

            if (assertEnabled()) {
              // @ts-expect-error
              window.isPatternRuleValid = isPatternRuleValid;

              // TODO: WHY are we potentially getting INCONSEQUENTIAL? Buggy?

              const matchState = embeddedRule.getMatchState(featureState);
              if (matchState === PatternRuleMatchState.INCOMPATIBLE || matchState === PatternRuleMatchState.DORMANT) {
                debugger;
                throw new Error('Why would this happen');
              }
            }

            // debugApplied.push( { rule, embedding, embeddedRule, ruleIndex } );

            embeddedRule.apply(featureState);
          }
        }
      }

      if (canStopEarly(featureState)) {
        break;
      }

      if (initialState.equals(featureState)) {
        break;
      }
    }

    return featureState;
  }

  public isRuleRedundant(rule: PatternRule): boolean {
    if (rule.isTrivial()) {
      return true;
    }

    return rule.outputFeatureSet.isSubsetOf(
      this.withRulesApplied(rule.inputFeatureSet, (currentFeatureSet) =>
        rule.outputFeatureSet.isSubsetOf(currentFeatureSet),
      ),
    );
  }

  // TODO: see which is faster, isActionableEmbeddingFromData or getActionableEmbeddingsFromData
  public findNextActionableEmbeddedRuleFromData(
    targetPatternBoard: TPatternBoard,
    boardData: TBoardFeatureData,
    initialRuleIndex = 0,
    initialEmbeddingIndex = 0,
    highlanderOverride?: (ruleIndex: number) => boolean,
    maxRules = this.size,
  ): ActionableRuleEmbedding | null {
    let count = 0;
    for (let ruleIndex = initialRuleIndex; ruleIndex < maxRules; ruleIndex++) {
      if (count % 1000 === 0) {
        console.log('search', count);
      }
      count++;

      const byteIndex = this.ruleIndices[ruleIndex];
      const patternBoardIndex = this.data[byteIndex];
      const patternBoard = this.patternBoards[patternBoardIndex];

      // TODO: don't memory leak this!
      const embeddings = getEmbeddings(patternBoard, targetPatternBoard);

      let embeddingIndex = initialEmbeddingIndex;
      initialEmbeddingIndex = 0;

      for (; embeddingIndex < embeddings.length; embeddingIndex++) {
        const embedding = embeddings[embeddingIndex];

        if (this.isActionableEmbeddingFromData(targetPatternBoard, boardData, ruleIndex, embedding)) {
          // TODO: in what cases will this NOT return a rule???
          const rule =
            highlanderOverride ? this.getRule(ruleIndex, highlanderOverride(ruleIndex)) : this.getRule(ruleIndex);
          const embeddedRule = rule.embedded(targetPatternBoard, embedding);

          if (assertEnabled()) {
            // if ( !( rule.inputFeatureSet.getBoardMatchState( boardData, embedding, true ) === FeatureSetMatchState.MATCH ) ) {
            //   debugger;
            //   const tmp = this.isActionableEmbeddingFromData( targetPatternBoard, boardData, ruleIndex, embedding );
            // }
            assert(rule.inputFeatureSet.getBoardMatchState(boardData, embedding, true) === FeatureSetMatchState.MATCH);

            // Is our output not fully satisfied!
            assert(rule.outputFeatureSet.getBoardMatchState(boardData, embedding, true) !== FeatureSetMatchState.MATCH);

            assert(!embeddedRule || !!rule.inputFeatureSet.embedded(patternBoard, embedding));
          }

          if (embeddedRule) {
            return new ActionableRuleEmbedding(ruleIndex, embeddingIndex, rule, embeddedRule, embedding);
          } else {
            // Looks like this is happening in some degenerate 2x2 cases
            return null;
          }
        }
      }
    }

    return null;
  }

  public isActionableEmbeddingFromData(
    targetPatternBoard: TPatternBoard,
    boardData: TBoardFeatureData,
    ruleIndex: number,
    embedding: Embedding,
  ): boolean {
    let byteIndex = this.ruleIndices[ruleIndex];
    const patternBoardIndex = this.data[byteIndex++];
    const patternBoard = this.patternBoards[patternBoardIndex];
    assertEnabled() && assert(patternBoard, 'pattern board');

    const binaryMapping = getBinaryFeatureMapping(patternBoard);

    // Input features, filter by the "input" of the pattern
    while (true) {
      const firstByte = this.data[byteIndex++];

      if (firstByte === 0xff) {
        break;
      } else if (firstByte === 0xfe) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[byteIndex++];
        assertEnabled() && assert(mainPrimaryFaceIndex < 0x80);

        while (true) {
          const nextByte = this.data[byteIndex++];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if (nextByte === 0xff || nextByte === 0xfe) {
            byteIndex--;
            break;
          }

          if (nextByte & 0x80) {
            const secondaryFaceIndex = nextByte & 0x7f;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const secondaryColorFromFirstPrimary =
              boardData.oppositeFaceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
            const secondaryColorDirect =
              boardData.faceColors[embedding.mapFace(patternBoard.faces[secondaryFaceIndex]).index];

            if (secondaryColorFromFirstPrimary !== secondaryColorDirect) {
              return false;
            }
          } else {
            const primaryFaceIndex = nextByte;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const primaryColorFromFirstPrimary =
              boardData.faceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
            const primaryColorDirect =
              boardData.faceColors[embedding.mapFace(patternBoard.faces[primaryFaceIndex]).index];

            if (primaryColorFromFirstPrimary !== primaryColorDirect) {
              return false;
            }
          }
        }
      } else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[firstByte];

        if (featureMatcher(boardData, embedding) !== FeatureSetMatchState.MATCH) {
          return false;
        }
      }
    }

    // Output features, see which embedded rules are actionable (would change the state)
    while (true) {
      const firstByte = this.data[byteIndex++];

      if (firstByte === 0xff) {
        break;
      } else if (firstByte === 0xfe) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[byteIndex++];
        assertEnabled() && assert(mainPrimaryFaceIndex < 0x80);

        while (true) {
          const nextByte = this.data[byteIndex++];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if (nextByte === 0xff || nextByte === 0xfe) {
            byteIndex--;
            break;
          }

          if (nextByte & 0x80) {
            const secondaryFaceIndex = nextByte & 0x7f;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const secondaryColorFromFirstPrimary =
              boardData.oppositeFaceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
            const secondaryColorDirect =
              boardData.faceColors[embedding.mapFace(patternBoard.faces[secondaryFaceIndex]).index];

            if (secondaryColorFromFirstPrimary !== secondaryColorDirect) {
              return true;
            }
          } else {
            const primaryFaceIndex = nextByte;

            // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
            const primaryColorFromFirstPrimary =
              boardData.faceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
            const primaryColorDirect =
              boardData.faceColors[embedding.mapFace(patternBoard.faces[primaryFaceIndex]).index];

            if (primaryColorFromFirstPrimary !== primaryColorDirect) {
              return true;
            }
          }
        }
      } else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[firstByte];

        if (featureMatcher(boardData, embedding) !== FeatureSetMatchState.MATCH) {
          return true;
        }
      }
    }

    // this is "inconsequential", state already contains the rule input and output
    return false;
  }

  public isActionableEmbeddingFromFeatureSet(featureSet: FeatureSet, ruleIndex: number, embedding: Embedding): boolean {
    let byteIndex = this.ruleIndices[ruleIndex];
    const patternBoardIndex = this.data[byteIndex++];
    const patternBoard = this.patternBoards[patternBoardIndex];
    assertEnabled() && assert(patternBoard, 'pattern board');

    const binaryMapping = getBinaryFeatureMapping(patternBoard);

    // Input features, filter by the "input" of the pattern
    while (true) {
      const firstByte = this.data[byteIndex++];

      if (firstByte === 0xff) {
        break;
      } else if (firstByte === 0xfe) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[byteIndex++];
        assertEnabled() && assert(mainPrimaryFaceIndex < 0x80);

        // TODO: reduce duplication? NOTE IT IS SUBTLY DIFFERENT!!!
        const targetMainPrimaryFace = embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]);
        const candidateFaceColorDual = featureSet.getFaceColorDualFromFace(targetMainPrimaryFace);
        if (!candidateFaceColorDual) {
          return false;
        }
        const isReversed = candidateFaceColorDual.secondaryFaces.includes(targetMainPrimaryFace);
        assertEnabled() && assert(isReversed || candidateFaceColorDual.primaryFaces.includes(targetMainPrimaryFace));

        const candidatePrimaryFaces =
          isReversed ? candidateFaceColorDual.secondaryFaces : candidateFaceColorDual.primaryFaces;
        const candidateSecondaryFaces =
          isReversed ? candidateFaceColorDual.primaryFaces : candidateFaceColorDual.secondaryFaces;

        while (true) {
          const nextByte = this.data[byteIndex++];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if (nextByte === 0xff || nextByte === 0xfe) {
            byteIndex--;
            break;
          }

          if (nextByte & 0x80) {
            const secondaryFaceIndex = nextByte & 0x7f;

            const targetSecondaryFace = embedding.mapFace(patternBoard.faces[secondaryFaceIndex]);
            if (!candidateSecondaryFaces.includes(targetSecondaryFace)) {
              return false;
            }
          } else {
            const primaryFaceIndex = nextByte;

            const targetPrimaryFace = embedding.mapFace(patternBoard.faces[primaryFaceIndex]);
            if (!candidatePrimaryFaces.includes(targetPrimaryFace)) {
              return false;
            }
          }
        }
      } else {
        // binary mapped feature
        const featureSetMatcher = binaryMapping.featureSetMatchers[firstByte];

        if (featureSetMatcher(featureSet, embedding) !== FeatureSetMatchState.MATCH) {
          return false;
        }
      }
    }

    // Output features, see which embedded rules are actionable (would change the state)
    while (true) {
      const firstByte = this.data[byteIndex++];

      if (firstByte === 0xff) {
        break;
      } else if (firstByte === 0xfe) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[byteIndex++];
        assertEnabled() && assert(mainPrimaryFaceIndex < 0x80);

        const targetMainPrimaryFace = embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]);
        const candidateFaceColorDual = featureSet.getFaceColorDualFromFace(targetMainPrimaryFace);
        if (!candidateFaceColorDual) {
          return true; // success now that it is the output
        }
        const isReversed = candidateFaceColorDual.secondaryFaces.includes(targetMainPrimaryFace);
        assertEnabled() && assert(isReversed || candidateFaceColorDual.primaryFaces.includes(targetMainPrimaryFace));

        const candidatePrimaryFaces =
          isReversed ? candidateFaceColorDual.secondaryFaces : candidateFaceColorDual.primaryFaces;
        const candidateSecondaryFaces =
          isReversed ? candidateFaceColorDual.primaryFaces : candidateFaceColorDual.secondaryFaces;

        while (true) {
          const nextByte = this.data[byteIndex++];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if (nextByte === 0xff || nextByte === 0xfe) {
            byteIndex--;
            break;
          }

          if (nextByte & 0x80) {
            const secondaryFaceIndex = nextByte & 0x7f;

            const targetSecondaryFace = embedding.mapFace(patternBoard.faces[secondaryFaceIndex]);
            if (!candidateSecondaryFaces.includes(targetSecondaryFace)) {
              return true;
            }
          } else {
            const primaryFaceIndex = nextByte;

            const targetPrimaryFace = embedding.mapFace(patternBoard.faces[primaryFaceIndex]);
            if (!candidatePrimaryFaces.includes(targetPrimaryFace)) {
              return true;
            }
          }
        }
      } else {
        // binary mapped feature
        const featureSetMatcher = binaryMapping.featureSetMatchers[firstByte];

        if (featureSetMatcher(featureSet, embedding) !== FeatureSetMatchState.MATCH) {
          return true;
        }
      }
    }

    // this is "inconsequential", state already contains the rule input and output
    return false;
  }

  // TODO: Or just take BoardPatternBoard right now?
  public getActionableEmbeddingsFromData(
    targetPatternBoard: TPatternBoard,
    boardData: TBoardFeatureData,
    ruleIndex: number,
  ): Embedding[] {
    let byteIndex = this.ruleIndices[ruleIndex];
    const patternBoardIndex = this.data[byteIndex++];
    const patternBoard = this.patternBoards[patternBoardIndex];
    assertEnabled() && assert(patternBoard, 'pattern board');

    const binaryMapping = getBinaryFeatureMapping(patternBoard);

    // ping-pong back-and-forth between the two
    let embeddings = getEmbeddings(patternBoard, targetPatternBoard);
    let nextEmbeddings = embeddings.slice();

    // Input features, filter by the "input" of the pattern
    while (true) {
      const firstByte = this.data[byteIndex++];
      let nextEmbeddingIndex = 0;

      if (firstByte === 0xff) {
        break;
      } else if (firstByte === 0xfe) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[byteIndex++];
        assertEnabled() && assert(mainPrimaryFaceIndex < 0x80);

        while (true) {
          const nextByte = this.data[byteIndex++];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if (nextByte === 0xff || nextByte === 0xfe) {
            byteIndex--;
            break;
          }

          if (nextByte & 0x80) {
            const secondaryFaceIndex = nextByte & 0x7f;

            for (let i = 0; i < embeddings.length; i++) {
              const embedding = embeddings[i];

              // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
              const secondaryColorFromFirstPrimary =
                boardData.oppositeFaceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
              const secondaryColorDirect =
                boardData.faceColors[embedding.mapFace(patternBoard.faces[secondaryFaceIndex]).index];

              if (secondaryColorFromFirstPrimary === secondaryColorDirect) {
                nextEmbeddings[nextEmbeddingIndex++] = embedding;
              }
            }
          } else {
            const primaryFaceIndex = nextByte;

            for (let i = 0; i < embeddings.length; i++) {
              const embedding = embeddings[i];

              // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
              const primaryColorFromFirstPrimary =
                boardData.faceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
              const primaryColorDirect =
                boardData.faceColors[embedding.mapFace(patternBoard.faces[primaryFaceIndex]).index];

              if (primaryColorFromFirstPrimary === primaryColorDirect) {
                nextEmbeddings[nextEmbeddingIndex++] = embedding;
              }
            }
          }

          /////////////////////

          // Trim the next embeddings array
          nextEmbeddings.length = nextEmbeddingIndex;

          // Early-abort check (if no more embeddings are possible, abort)
          if (nextEmbeddingIndex === 0) {
            return nextEmbeddings;
          }

          // Swap embeddings
          const temp = embeddings;
          embeddings = nextEmbeddings;
          nextEmbeddings = temp;
          nextEmbeddingIndex = 0;
          /////////////////////
        }
      } else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[firstByte];

        for (let i = 0; i < embeddings.length; i++) {
          const embedding = embeddings[i];

          if (featureMatcher(boardData, embedding) === FeatureSetMatchState.MATCH) {
            nextEmbeddings[nextEmbeddingIndex++] = embedding;
          }
        }

        /////////////////////

        // Trim the next embeddings array
        nextEmbeddings.length = nextEmbeddingIndex;

        // Early-abort check (if no more embeddings are possible, abort)
        if (nextEmbeddingIndex === 0) {
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
    const isActionable = embeddings.map(() => false);
    let actionableCount = 0;
    while (true) {
      const firstByte = this.data[byteIndex++];

      if (firstByte === 0xff) {
        break;
      } else if (firstByte === 0xfe) {
        // First "next byte" should always be a primary face
        const mainPrimaryFaceIndex = this.data[byteIndex++];
        assertEnabled() && assert(mainPrimaryFaceIndex < 0x80);

        while (true) {
          const nextByte = this.data[byteIndex++];

          // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
          if (nextByte === 0xff || nextByte === 0xfe) {
            byteIndex--;
            break;
          }

          if (nextByte & 0x80) {
            const secondaryFaceIndex = nextByte & 0x7f;

            for (let i = 0; i < embeddings.length; i++) {
              if (!isActionable[i]) {
                const embedding = embeddings[i];

                // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
                const secondaryColorFromFirstPrimary =
                  boardData.oppositeFaceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
                const secondaryColorDirect =
                  boardData.faceColors[embedding.mapFace(patternBoard.faces[secondaryFaceIndex]).index];

                if (secondaryColorFromFirstPrimary !== secondaryColorDirect) {
                  isActionable[i] = true;
                  actionableCount++;
                }
              }
            }
          } else {
            const primaryFaceIndex = nextByte;

            for (let i = 0; i < embeddings.length; i++) {
              if (!isActionable[i]) {
                const embedding = embeddings[i];

                // TODO: have embeddings with a DIRECT index map, instead of this. We do not need such complex lookups
                const primaryColorFromFirstPrimary =
                  boardData.faceColors[embedding.mapFace(patternBoard.faces[mainPrimaryFaceIndex]).index];
                const primaryColorDirect =
                  boardData.faceColors[embedding.mapFace(patternBoard.faces[primaryFaceIndex]).index];

                if (primaryColorFromFirstPrimary !== primaryColorDirect) {
                  isActionable[i] = true;
                  actionableCount++;
                }
              }
            }
          }
        }
      } else {
        // binary mapped feature
        const featureMatcher = binaryMapping.featureMatchers[firstByte];

        for (let i = 0; i < embeddings.length; i++) {
          if (!isActionable[i]) {
            const embedding = embeddings[i];

            if (featureMatcher(boardData, embedding) !== FeatureSetMatchState.MATCH) {
              isActionable[i] = true;
              actionableCount++;
            }
          }
        }
      }
    }

    if (actionableCount) {
      return embeddings.filter((_, i) => isActionable[i]);
    } else {
      return []; // TODO: see if we should reduce the size of an array and return that instead for GC
    }
  }

  public serialize(): SerializedBinaryRuleCollection {
    return {
      patternBoards: this.patternBoards.map(serializePatternBoard),
      rules: compressByteArray(this.data.subarray(0, this.nextRuleIndex)),
      highlander: this.highlander,
    };
  }

  // NOTE: Assumes that the typed array is "full but exact length", as we clip it during serialization.
  public static deserialize(serialized: SerializedBinaryRuleCollection): BinaryRuleCollection {
    const data = decompressByteArray(serialized.rules);
    if (!data) {
      throw new Error('Failed to decompress rules!');
    }

    let index = 0;
    const ruleIndices: number[] = [];
    while (index < data.length) {
      ruleIndices.push(index);

      assertEnabled() && assert(data[index] !== 0xfe);

      let patternEndCount = 0;
      while (patternEndCount < 2) {
        assertEnabled() && assert(index < data.length, 'Unexpected end of data');

        if (data[index++] === 0xff) {
          patternEndCount++;
        }
      }
    }

    return new BinaryRuleCollection(
      serialized.patternBoards.map(deserializePatternBoard),
      data,
      ruleIndices,
      data.length,
      serialized.highlander,
    );
  }

  public static empty(): BinaryRuleCollection {
    return new BinaryRuleCollection([], new Uint8Array(0), [], 0, false);
  }

  public static fromRules(rules: PatternRule[]): BinaryRuleCollection {
    const isHighlander = rules.some((rule) => rule.highlander);
    const patternBoards = _.uniq(rules.map((rule) => rule.patternBoard));

    const bytes: number[] = [];
    let nextRuleIndex = 0;
    const ruleIndices: number[] = [];

    for (const rule of rules) {
      bytes.push(...rule.getBinary(patternBoards));
      ruleIndices.push(nextRuleIndex);
      nextRuleIndex = bytes.length;
    }

    return new BinaryRuleCollection(patternBoards, new Uint8Array(bytes), ruleIndices, nextRuleIndex, isHighlander);
  }
}

export type SerializedBinaryRuleCollection = {
  patternBoards: string[]; // serializePatternBoard / deserializePatternBoard, hopefully the board name often
  rules: string; // base64? compressed?
  highlander: boolean;
};
