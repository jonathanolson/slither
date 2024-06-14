import { TAction, TSerializedAction } from './TAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { AnnotatedPattern, TAnnotation } from './TAnnotation.ts';
import { PatternRule } from '../../pattern/pattern-rule/PatternRule.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { BoardPatternBoard } from '../../pattern/pattern-board/BoardPatternBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { deserializeAction } from '../../data/core/deserializeAction.ts';
import { TSector } from '../sector-state/TSector.ts';
import FaceValue from '../face-value/FaceValue.ts';
import { Embedding } from '../../pattern/embedding/Embedding.ts';

export class AnnotatedAction<Data> implements TAction<Data> {
  public constructor(
    public readonly action: TAction<Data>,
    public readonly annotation: TAnnotation,
    public readonly board: TBoard,
  ) {}

  public apply(state: Data): void {
    this.action.apply(state);
  }

  public getUndo(state: Data): TAction<Data> {
    return new AnnotatedAction(this.action.getUndo(state), this.annotation, this.board);
  }

  public isEmpty(): boolean {
    return this.action.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    let serializedAnnotation: unknown | null = null;
    if (this.annotation.type === 'Pattern') {
      const serializePattern = (pattern: AnnotatedPattern) => {
        return {
          faceValues: pattern.faceValues.map((faceValue) => ({
            face: faceValue.face === null ? null : board.faces.indexOf(faceValue.face),
            value: faceValue.value,
          })),
          blackEdges: pattern.blackEdges.map((edge) => board.edges.indexOf(edge)),
          redEdges: pattern.redEdges.map((edge) => board.edges.indexOf(edge)),
          sectorsNotZero: pattern.sectorsNotZero.map((sector) => board.halfEdges.indexOf(sector)),
          sectorsNotOne: pattern.sectorsNotOne.map((sector) => board.halfEdges.indexOf(sector)),
          sectorsNotTwo: pattern.sectorsNotTwo.map((sector) => board.halfEdges.indexOf(sector)),
          sectorsOnlyOne: pattern.sectorsOnlyOne.map((sector) => board.halfEdges.indexOf(sector)),
          faceColorDuals: pattern.faceColorDuals.map((faceColorDual) => {
            return {
              primaryFaces: faceColorDual.primaryFaces.map((face) =>
                face === null ? null : board.faces.indexOf(face),
              ),
              secondaryFaces: faceColorDual.secondaryFaces.map((face) =>
                face === null ? null : board.faces.indexOf(face),
              ),
            };
          }),
        };
      };

      const board = this.annotation.boardPatternBoard.board;

      serializedAnnotation = {
        type: 'Pattern',
        rule: this.annotation.rule.serialize(),
        embedding: this.annotation.embedding.serialize(),
        input: serializePattern(this.annotation.input),
        output: serializePattern(this.annotation.output),
        affectedEdges: [...this.annotation.affectedEdges].map((edge) => board.edges.indexOf(edge)),
        affectedSectors: [...this.annotation.affectedSectors].map((sector) => board.halfEdges.indexOf(sector)),
        affectedFaces: [...this.annotation.affectedFaces].map((face) => board.faces.indexOf(face)),
      };
    } else if (this.annotation.type === 'ForcedSolveLoop') {
      serializedAnnotation = {
        type: 'ForcedSolveLoop',
        a: this.board.vertices.indexOf(this.annotation.a),
        b: this.board.vertices.indexOf(this.annotation.b),
        regionEdges: [...this.annotation.regionEdges].map((edge) => this.board.edges.indexOf(edge)),
        pathEdges: [...this.annotation.pathEdges].map((edge) => this.board.edges.indexOf(edge)),
      };

      /*
export type ForcedSolveLoopAnnotation = {
type: 'ForcedSolveLoop';
a: TVertex;
b: TVertex;
regionEdges: TEdge[];
pathEdges: TEdge[];
};
 */
    } else if (this.annotation.type === 'PrematureForcedLoop') {
      /*
export type PrematureForcedLoopAnnotation = {
type: 'PrematureForcedLoop';
a: TVertex;
b: TVertex;
regionEdges: TEdge[];
pathEdges: TEdge[];
};
 */
    }

    if (serializedAnnotation !== null) {
      return {
        type: 'AnnotatedAction',
        action: this.action.serializeAction(),
        annotation: serializedAnnotation,
      };
    } else {
      throw new Error('unimplemented');
    }
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): AnnotatedAction<TCompleteData> {
    assertEnabled() && assert(serializedAction.type === 'AnnotatedAction');

    const annotationType = serializedAction.annotation.type;

    const action = deserializeAction(board, serializedAction.action);

    let annotation: TAnnotation | null = null;

    if (annotationType === 'Pattern') {
      const deserializePattern = (serializedPattern: any): AnnotatedPattern => {
        return {
          faceValues: serializedPattern.faceValues.map(
            (serializedFaceValue: { face: number | null; value: FaceValue }) => ({
              face: serializedFaceValue.face === null ? null : board.faces[serializedFaceValue.face],
              value: serializedFaceValue.value,
            }),
          ),
          blackEdges: serializedPattern.blackEdges.map((index: number) => board.edges[index]),
          redEdges: serializedPattern.redEdges.map((index: number) => board.edges[index]),
          sectorsNotZero: serializedPattern.sectorsNotZero.map((index: number) => board.halfEdges[index]),
          sectorsNotOne: serializedPattern.sectorsNotOne.map((index: number) => board.halfEdges[index]),
          sectorsNotTwo: serializedPattern.sectorsNotTwo.map((index: number) => board.halfEdges[index]),
          sectorsOnlyOne: serializedPattern.sectorsOnlyOne.map((index: number) => board.halfEdges[index]),
          faceColorDuals: serializedPattern.faceColorDuals.map(
            (serializedFaceColorDual: { primaryFaces: (number | null)[]; secondaryFaces: (number | null)[] }) => {
              return {
                primaryFaces: serializedFaceColorDual.primaryFaces.map((face: number | null) =>
                  face === null ? null : board.faces[face],
                ),
                secondaryFaces: serializedFaceColorDual.secondaryFaces.map((face: number | null) =>
                  face === null ? null : board.faces[face],
                ),
              };
            },
          ),
        };
      };

      const rule = PatternRule.deserialize(serializedAction.annotation.rule);
      const boardPatternBoard = new BoardPatternBoard(board);
      const embedding = Embedding.deserialize(
        rule.patternBoard,
        boardPatternBoard,
        serializedAction.annotation.embedding,
      );

      const input = deserializePattern(serializedAction.annotation.input);
      const output = deserializePattern(serializedAction.annotation.output);
      const affectedEdges = new Set(
        serializedAction.annotation.affectedEdges.map((index: number) => board.edges[index]) as Set<TEdge>,
      );
      const affectedSectors = new Set(
        serializedAction.annotation.affectedSectors.map((index: number) => board.halfEdges[index]) as Set<TSector>,
      );
      const affectedFaces = new Set(
        serializedAction.annotation.affectedFaces.map((index: number) => board.faces[index]) as Set<TFace>,
      );

      annotation = {
        type: 'Pattern',
        rule: rule,
        boardPatternBoard: boardPatternBoard,
        embedding: embedding,
        input: input,
        output: output,
        affectedEdges: affectedEdges,
        affectedSectors: affectedSectors,
        affectedFaces: affectedFaces,
      };
    } else if (annotationType === 'ForcedSolveLoop') {
      annotation = {
        type: 'ForcedSolveLoop',
        a: board.vertices[serializedAction.annotation.a],
        b: board.vertices[serializedAction.annotation.b],
        regionEdges: serializedAction.annotation.regionEdges.map((index: number) => board.edges[index]),
        pathEdges: serializedAction.annotation.pathEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'PrematureForcedLoop') {
      annotation = {
        type: 'PrematureForcedLoop',
        a: board.vertices[serializedAction.annotation.a],
        b: board.vertices[serializedAction.annotation.b],
        regionEdges: serializedAction.annotation.regionEdges.map((index: number) => board.edges[index]),
        pathEdges: serializedAction.annotation.pathEdges.map((index: number) => board.edges[index]),
      };
    }

    if (annotation !== null) {
      return new AnnotatedAction<TCompleteData>(action, annotation, board);
    } else {
      throw new Error('unimplemented deserializeAction on AnnotatedAction');
    }
  }
}
