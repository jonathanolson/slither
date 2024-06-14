import { TFace } from '../../board/core/TFace.ts';
import _ from '../../../workarounds/_.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { packBooleanArray, unpackBooleanArray } from '../../../util/booleanPacking.ts';
import FaceValue from '../face-value/FaceValue.ts';
import {
  getBinaryIndex,
  getBinaryQuantity,
  getCombinationIndex,
  getCombinationQuantity,
} from '../../../util/booleanIndexing.ts';
import { TVertexStateData } from '../vertex-state/TVertexStateData.ts';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { TFaceValueData } from '../face-value/TFaceValueData.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export class FaceState {
  public readonly order: number;
  public readonly possibilityCount: number;

  private readonly matrix: boolean[]; // TODO: bitpacking?

  public constructor(
    public readonly face: TFace,
    public readonly faceValue: FaceValue,
    matrix?: boolean[],
    possibilityCount?: number,
  ) {
    this.order = face.edges.length;

    if (matrix) {
      this.matrix = matrix;
    } else {
      this.matrix = _.range(0, FaceState.getMatrixSize(this.order, this.faceValue)).map(() => true);
    }

    if (possibilityCount !== undefined) {
      this.possibilityCount = possibilityCount;
    } else {
      this.possibilityCount = this.matrix.filter((x) => x).length;
    }

    assertEnabled() && assert(this.matrix.length === FaceState.getMatrixSize(this.order, this.faceValue));
    assertEnabled() && assert(this.possibilityCount === this.matrix.filter((x) => x).length);
  }

  public isAny(): boolean {
    return this.possibilityCount === FaceState.getMatrixSize(this.order, this.faceValue);
  }

  public isForced(): boolean {
    return this.possibilityCount === 1;
  }

  public allowsEmpty(): boolean {
    return this.allowsBlackEdges([]);
  }

  public allowsBlackEdges(blackEdges: TEdge[]): boolean {
    return this.matrix[this.getBlackEdgesIndex(blackEdges)];
  }

  public getAllowedCombinations(): TEdge[][] {
    const allowedCombinations: TEdge[][] = [];

    FaceState.forEachEdgeCombination(this.face.edges, this.faceValue, (indices: number[], edges: TEdge[]) => {
      if (this.matrix[this.getIndexFromIndices(indices)]) {
        allowedCombinations.push(edges.slice());
      }
    });

    assertEnabled() && assert(allowedCombinations.length === this.possibilityCount);

    return allowedCombinations;
  }

  public getFinalStatesOfEdge(edge: TEdge): Set<EdgeState> {
    const result = new Set<EdgeState>();

    for (const blackEdges of this.getAllowedCombinations()) {
      const hasEdge = blackEdges.includes(edge);

      if (hasEdge) {
        result.add(EdgeState.BLACK);
      } else {
        result.add(EdgeState.RED);
      }
    }
    if (this.allowsEmpty()) {
      result.add(EdgeState.RED);
    }

    return result;
  }

  public getBlackEdgesIndex(blackEdges: TEdge[]): number {
    const indices = blackEdges.map((edge) => this.face.edges.indexOf(edge));
    assertEnabled() && assert(indices.every((index) => index >= 0));

    return this.getIndexFromIndices(indices);
  }

  public getIndexFromIndices(indices: number[]): number {
    return this.faceValue === null ? getBinaryIndex(indices, this.order) : getCombinationIndex(indices, this.order);
  }

  public equals(other: FaceState): boolean {
    return this.face === other.face && this.matrix.every((x, i) => x === other.matrix[i]);
  }

  public and(other: FaceState): FaceState {
    assertEnabled() && assert(this.face === other.face);

    return new FaceState(
      this.face,
      this.faceValue,
      this.matrix.map((x, i) => x && other.matrix[i]),
    );
  }

  public or(other: FaceState): FaceState {
    assertEnabled() && assert(this.face === other.face);

    return new FaceState(
      this.face,
      this.faceValue,
      this.matrix.map((x, i) => x || other.matrix[i]),
    );
  }

  public isSubsetOf(other: FaceState): boolean {
    return this.matrix.every((x, i) => !x || other.matrix[i]);
  }

  public withBlackEdges(blackEdges: TEdge[], included: boolean): FaceState {
    const index = this.getBlackEdgesIndex(blackEdges);

    // TODO: should we copy it and then modify?
    return new FaceState(
      this.face,
      this.faceValue,
      this.matrix.slice(0, index).concat(included, this.matrix.slice(index + 1)),
    );
  }

  public serialize(): TSerializedFaceState {
    if (this.isAny()) {
      return {
        faceValue: this.faceValue,
        matrix: '',
        isAny: true,
      };
    }

    const result: TSerializedFaceState = {
      faceValue: this.faceValue,
      matrix: packBooleanArray(this.matrix),
      isAny: false,
    };

    assertEnabled() && assert(this.equals(FaceState.deserialize(this.face, result)));

    return result;
  }

  public static getMatrixSize(order: number, faceValue: FaceValue): number {
    if (faceValue === null) {
      return getBinaryQuantity(order);
    } else {
      return getCombinationQuantity(order, faceValue);
    }
  }

  // NOTE: don't mutate the callback result, ALSO model other faster patterns on this
  public static forEachIndexCombination(
    order: number,
    faceValue: FaceValue,
    callback: (indices: number[]) => void,
  ): void {
    let stack: number[] = [];

    const recur = () => {
      if (faceValue !== null) {
        if (stack.length === faceValue) {
          callback(stack);
          return;
        }
      } else {
        callback(stack);
      }

      const start = stack.length > 0 ? stack[stack.length - 1] + 1 : 0;
      for (let i = start; i < order; i++) {
        stack.push(i);
        recur();
        stack.pop();
      }
    };
    recur();
  }

  public static forEachEdgeCombination(
    edges: TEdge[],
    faceValue: FaceValue,
    callback: (indices: number[], edges: TEdge[]) => void,
  ): void {
    let indexStack: number[] = [];
    let valueStack: TEdge[] = [];

    const recur = () => {
      if (faceValue !== null) {
        if (indexStack.length === faceValue) {
          callback(indexStack, valueStack);
          return;
        }
      } else {
        callback(indexStack, valueStack);
      }

      const start = indexStack.length > 0 ? indexStack[indexStack.length - 1] + 1 : 0;
      for (let i = start; i < edges.length; i++) {
        indexStack.push(i);
        valueStack.push(edges[i]);
        recur();
        indexStack.pop();
        valueStack.pop();
      }
    };
    recur();
  }

  public static fromLookup(face: TFace, faceValue: FaceValue, lookup: (blackEdges: TEdge[]) => boolean): FaceState {
    const order = face.edges.length;
    const matrix: boolean[] = new Array(FaceState.getMatrixSize(order, faceValue)).fill(false);

    FaceState.forEachEdgeCombination(face.edges, faceValue, (indices, edges) => {
      const value = lookup(edges);

      if (value) {
        const index = faceValue === null ? getBinaryIndex(indices, order) : getCombinationIndex(indices, order);
        matrix[index] = true;
      }
    });

    return new FaceState(face, faceValue, matrix);
  }

  public static none(face: TFace, faceValue: FaceValue): FaceState {
    const size = FaceState.getMatrixSize(face.edges.length, faceValue);
    const matrix = new Array(size).fill(false);
    return new FaceState(face, faceValue, matrix, 0);
  }

  public static any(face: TFace, faceValue: FaceValue): FaceState {
    const size = FaceState.getMatrixSize(face.edges.length, faceValue);
    const matrix = new Array(size).fill(true);
    return new FaceState(face, faceValue, matrix, size);
  }

  public static withOnlyBlackEdges(face: TFace, faceValue: FaceValue, blackEdges: TEdge[]): FaceState {
    const size = FaceState.getMatrixSize(face.edges.length, faceValue);
    const matrix = new Array(size).fill(false);
    const indices = blackEdges.map((edge) => face.edges.indexOf(edge));
    const index =
      faceValue === null ? getBinaryIndex(indices, face.edges.length) : getCombinationIndex(indices, face.edges.length);
    matrix[index] = true;
    return new FaceState(face, faceValue, matrix, 1);
  }

  public static withoutBlackEdges(face: TFace, faceValue: FaceValue, blackEdges: TEdge[]): FaceState {
    const size = FaceState.getMatrixSize(face.edges.length, faceValue);
    const matrix = new Array(size).fill(true);
    const indices = blackEdges.map((edge) => face.edges.indexOf(edge));
    const index =
      faceValue === null ? getBinaryIndex(indices, face.edges.length) : getCombinationIndex(indices, face.edges.length);
    matrix[index] = false;
    return new FaceState(face, faceValue, matrix, size - 1);
  }

  public static fromVertexAndColorData(
    face: TFace,
    board: TBoard,
    data: TFaceValueData & TVertexStateData & TFaceColorData,
  ): FaceState {
    const vertexStates = face.vertices.map((vertex) => data.getVertexState(vertex));
    const binaryCombinations: TaggedBinaryCombinations[] = vertexStates.map((vertexState) => {
      const edges = vertexState.vertex.edges.filter((edge) => edge.faces.includes(face));
      assertEnabled() && assert(edges.length === 2);

      return {
        edgeA: edges[0],
        edgeB: edges[1],
        ...vertexState.getBinaryCombinationsAllowed(edges[0], edges[1]),
      };
    });

    const faceColorMap = new Map(
      face.edges.map((edge) => {
        const otherFace = edge.getOtherFace(face);
        return [edge, otherFace ? data.getFaceColor(otherFace) : data.getOutsideColor()];
      }),
    );
    const selfColor = data.getFaceColor(face);

    const uniqueFaceColors = new Set([...faceColorMap.values(), selfColor]);
    const oppositeMap = new Map([...uniqueFaceColors].map((color) => [color, data.getOppositeFaceColor(color)]));

    return FaceState.fromLookup(face, data.getFaceValue(face), (blackEdgesArray) => {
      const blackEdges = new Set(blackEdgesArray);

      for (const binaryCombination of binaryCombinations) {
        const hasA = blackEdges.has(binaryCombination.edgeA);
        const hasB = blackEdges.has(binaryCombination.edgeB);

        if (hasA && hasB && !binaryCombination.allowsBoth) {
          return false;
        }
        if (hasA && !hasB && !binaryCombination.allowsAOnly) {
          return false;
        }
        if (!hasA && hasB && !binaryCombination.allowsBOnly) {
          return false;
        }
        if (!hasA && !hasB && !binaryCombination.allowsNone) {
          return false;
        }
      }

      const redSet = new Set<TFaceColor>([selfColor]);
      const blackSet = new Set<TFaceColor>();

      for (const edge of face.edges) {
        const color = faceColorMap.get(edge)!;
        assertEnabled() && assert(color);

        if (blackEdges.has(edge)) {
          blackSet.add(color);
        } else {
          redSet.add(color);
        }
      }

      for (const color of redSet) {
        // no same colors are on both sides
        if (blackSet.has(color)) {
          return false;
        }

        // no opposites are together on a side
        const opposite = oppositeMap.get(color);
        if (opposite && redSet.has(opposite)) {
          return false;
        }
      }

      for (const color of blackSet) {
        // no opposites are together on a side
        const opposite = oppositeMap.get(color);
        if (opposite && blackSet.has(opposite)) {
          return false;
        }
      }

      // Prevent simple face-only loops (if there is a non-adjacent face Face-based check to prevent loops
      if (blackEdges.size === face.edges.length) {
        for (const otherFace of board.faces) {
          if (data.getFaceValue(otherFace) !== null) {
            for (const edge of otherFace.edges) {
              if (!blackEdges.has(edge)) {
                return false;
              }
            }
          }
        }
      }

      return true;
    });
  }

  public static deserialize(face: TFace, serialized: TSerializedFaceState): FaceState {
    if (serialized.isAny) {
      return FaceState.any(face, serialized.faceValue);
    } else {
      return new FaceState(
        face,
        serialized.faceValue,
        unpackBooleanArray(serialized.matrix, FaceState.getMatrixSize(face.edges.length, serialized.faceValue)),
      );
    }
  }
}

type TaggedBinaryCombinations = {
  edgeA: TEdge;
  edgeB: TEdge;
  allowsNone: boolean;
  allowsBoth: boolean;
  allowsAOnly: boolean;
  allowsBOnly: boolean;
};

export type TSerializedFaceState = {
  faceValue: FaceValue;
  matrix: string;
  isAny: boolean;
};
