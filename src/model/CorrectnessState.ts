import { TEdge } from './board/core/TEdge.ts';
import { TFace } from './board/core/TFace.ts';

export class CorrectnessState {
  public constructor(
    public readonly incorrectEdges: Set<TEdge>,
    public readonly incorrectFaces: Set<TFace>,
  ) {}

  public isCorrect(): boolean {
    return this.incorrectEdges.size === 0 && this.incorrectFaces.size === 0;
  }

  public with(correctness: CorrectnessState): CorrectnessState {
    if (this.isCorrect()) {
      return correctness;
    }
    if (correctness.isCorrect()) {
      return this;
    } else {
      return new CorrectnessState(
        new Set([...this.incorrectEdges, ...correctness.incorrectEdges]),
        new Set([...this.incorrectFaces, ...correctness.incorrectFaces]),
      );
    }
  }

  public static with(correctnesses: CorrectnessState[]): CorrectnessState {
    return correctnesses.reduce((acc, correctness) => acc.with(correctness), CorrectnessState.CORRECT);
  }

  public static CORRECT = new CorrectnessState(new Set(), new Set());
}
