import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TFace } from '../../board/core/TFace.ts';
import { deserializeAction } from '../../data/core/deserializeAction.ts';
import { Embedding } from '../../pattern/embedding/Embedding.ts';
import { BoardPatternBoard } from '../../pattern/pattern-board/BoardPatternBoard.ts';
import { PatternRule } from '../../pattern/pattern-rule/PatternRule.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { FaceState, TSerializedFaceState } from '../face-state/FaceState.ts';
import FaceValue from '../face-value/FaceValue.ts';
import SectorState, { TSerializedSectorState } from '../sector-state/SectorState.ts';
import { TSector } from '../sector-state/TSector.ts';
import { TAction, TSerializedAction } from './TAction.ts';
import { AnnotatedPattern, TAnnotation } from './TAnnotation.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

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
    } else if (this.annotation.type === 'PrematureForcedLoop') {
      serializedAnnotation = {
        type: 'PrematureForcedLoop',
        a: this.board.vertices.indexOf(this.annotation.a),
        b: this.board.vertices.indexOf(this.annotation.b),
        regionEdges: [...this.annotation.regionEdges].map((edge) => this.board.edges.indexOf(edge)),
        pathEdges: [...this.annotation.pathEdges].map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'FaceColorDisconnection') {
      serializedAnnotation = {
        type: 'FaceColorDisconnection',
        disconnection: this.annotation.disconnection.map((halfEdge) => this.board.halfEdges.indexOf(halfEdge)),
        facesA: this.annotation.facesA.map((face) => this.board.faces.indexOf(face)),
        facesB: this.annotation.facesB.map((face) => this.board.faces.indexOf(face)),
      };
    } else if (this.annotation.type === 'ForcedLine') {
      serializedAnnotation = {
        type: 'ForcedLine',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        blackEdge: this.board.edges.indexOf(this.annotation.blackEdge),
        whiteEdge: this.board.edges.indexOf(this.annotation.whiteEdge),
        redEdges: this.annotation.redEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'AlmostEmptyToRed') {
      serializedAnnotation = {
        type: 'AlmostEmptyToRed',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        whiteEdge: this.board.edges.indexOf(this.annotation.whiteEdge),
        redEdges: this.annotation.redEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'JointToRed') {
      serializedAnnotation = {
        type: 'JointToRed',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        whiteEdges: this.annotation.whiteEdges.map((edge) => this.board.edges.indexOf(edge)),
        blackEdges: [
          this.board.edges.indexOf(this.annotation.blackEdges[0]),
          this.board.edges.indexOf(this.annotation.blackEdges[1]),
        ],
      };
    } else if (this.annotation.type === 'FaceSatisfied') {
      serializedAnnotation = {
        type: 'FaceSatisfied',
        face: this.board.faces.indexOf(this.annotation.face),
        whiteEdges: this.annotation.whiteEdges.map((edge) => this.board.edges.indexOf(edge)),
        blackEdges: this.annotation.blackEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'FaceAntiSatisfied') {
      serializedAnnotation = {
        type: 'FaceAntiSatisfied',
        face: this.board.faces.indexOf(this.annotation.face),
        whiteEdges: this.annotation.whiteEdges.map((edge) => this.board.edges.indexOf(edge)),
        redEdges: this.annotation.redEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'CompletingEdgesAfterSolve') {
      serializedAnnotation = {
        type: 'CompletingEdgesAfterSolve',
        whiteEdges: this.annotation.whiteEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'FaceColoringBlackEdge') {
      serializedAnnotation = {
        type: 'FaceColoringBlackEdge',
        edge: this.board.edges.indexOf(this.annotation.edge),
      };
    } else if (this.annotation.type === 'FaceColoringRedEdge') {
      serializedAnnotation = {
        type: 'FaceColoringRedEdge',
        edge: this.board.edges.indexOf(this.annotation.edge),
      };
    } else if (this.annotation.type === 'FaceColorToBlack') {
      serializedAnnotation = {
        type: 'FaceColorToBlack',
        edge: this.board.edges.indexOf(this.annotation.edge),
      };
    } else if (this.annotation.type === 'FaceColorToRed') {
      serializedAnnotation = {
        type: 'FaceColorToRed',
        edge: this.board.edges.indexOf(this.annotation.edge),
      };
    } else if (this.annotation.type === 'FaceColorNoTrivialLoop') {
      serializedAnnotation = {
        type: 'FaceColorNoTrivialLoop',
        face: this.board.faces.indexOf(this.annotation.face),
      };
    } else if (
      this.annotation.type === 'FaceColorMatchToRed' ||
      this.annotation.type === 'FaceColorMatchToBlack' ||
      this.annotation.type === 'FaceColorBalance'
    ) {
      serializedAnnotation = {
        type: this.annotation.type,
        face: this.board.faces.indexOf(this.annotation.face),
        remainingValue: this.annotation.remainingValue,
        availableSideCount: this.annotation.availableSideCount,
        balancedPairs: this.annotation.balancedPairs.map((pair) => [
          pair[0].map((edge) => this.board.edges.indexOf(edge)),
          pair[1].map((edge) => this.board.edges.indexOf(edge)),
        ]),
        matchingEdges: this.annotation.matchingEdges.map((edge) => this.board.edges.indexOf(edge)),
      };

      if (this.annotation.type === 'FaceColorBalance') {
        (serializedAnnotation as any).oppositeEdges = this.annotation.oppositeEdges.map((edge) =>
          this.board.edges.indexOf(edge),
        );
      }
    } else if (this.annotation.type === 'DoubleMinusOneFaces') {
      serializedAnnotation = {
        type: 'DoubleMinusOneFaces',
        faces: this.annotation.faces.map((face) => this.board.faces.indexOf(face)),
        toBlackEdges: this.annotation.toBlackEdges.map((edge) => this.board.edges.indexOf(edge)),
        toRedEdges: this.annotation.toRedEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'SingleEdgeToSector') {
      serializedAnnotation = {
        type: 'SingleEdgeToSector',
        sector: this.board.halfEdges.indexOf(this.annotation.sector),
        beforeState: this.annotation.beforeState.serialize(),
        afterState: this.annotation.afterState.serialize(),
      };
    } else if (this.annotation.type === 'DoubleEdgeToSector') {
      serializedAnnotation = {
        type: 'DoubleEdgeToSector',
        sector: this.board.halfEdges.indexOf(this.annotation.sector),
        beforeState: this.annotation.beforeState.serialize(),
        afterState: this.annotation.afterState.serialize(),
      };
    } else if (this.annotation.type === 'ForcedSector') {
      serializedAnnotation = {
        type: 'ForcedSector',
        sector: this.board.halfEdges.indexOf(this.annotation.sector),
        sectorState: this.annotation.sectorState.serialize(),
        toRedEdges: this.annotation.toRedEdges.map((edge) => this.board.edges.indexOf(edge)),
        toBlackEdges: this.annotation.toBlackEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'StaticFaceSectors') {
      serializedAnnotation = {
        type: 'StaticFaceSectors',
        face: this.board.faces.indexOf(this.annotation.face),
        sectors: this.annotation.sectors.map((sector) => this.board.halfEdges.indexOf(sector)),
      };
    } else if (this.annotation.type === 'VertexState') {
      serializedAnnotation = {
        type: 'VertexState',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        beforeState: this.annotation.beforeState.serialize(),
        afterState: this.annotation.afterState.serialize(),
      };
    } else if (this.annotation.type === 'VertexStateToEdge') {
      serializedAnnotation = {
        type: 'VertexStateToEdge',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        toRedEdges: this.annotation.toRedEdges.map((edge) => this.board.edges.indexOf(edge)),
        toBlackEdges: this.annotation.toBlackEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'VertexStateToSector') {
      serializedAnnotation = {
        type: 'VertexStateToSector',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        sectors: this.annotation.sectors.map((sector) => this.board.halfEdges.indexOf(sector)),
        beforeStates: this.annotation.beforeStates.map((state) => state.serialize()),
        afterStates: this.annotation.afterStates.map((state) => state.serialize()),
      };
    } else if (this.annotation.type === 'VertexStateToSameFaceColor') {
      serializedAnnotation = {
        type: 'VertexStateToSameFaceColor',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        facesA: this.annotation.facesA.map((face) => this.board.faces.indexOf(face)),
        facesB: this.annotation.facesB.map((face) => this.board.faces.indexOf(face)),
      };
    } else if (this.annotation.type === 'VertexStateToOppositeFaceColor') {
      serializedAnnotation = {
        type: 'VertexStateToOppositeFaceColor',
        vertex: this.board.vertices.indexOf(this.annotation.vertex),
        facesA: this.annotation.facesA.map((face) => this.board.faces.indexOf(face)),
        facesB: this.annotation.facesB.map((face) => this.board.faces.indexOf(face)),
      };
    } else if (this.annotation.type === 'FaceState') {
      serializedAnnotation = {
        type: 'FaceState',
        face: this.board.faces.indexOf(this.annotation.face),
        beforeState: this.annotation.beforeState.serialize(),
        afterState: this.annotation.afterState.serialize(),
      };
    } else if (this.annotation.type === 'FaceStateToEdge') {
      serializedAnnotation = {
        type: 'FaceStateToEdge',
        face: this.board.faces.indexOf(this.annotation.face),
        toRedEdges: this.annotation.toRedEdges.map((edge) => this.board.edges.indexOf(edge)),
        toBlackEdges: this.annotation.toBlackEdges.map((edge) => this.board.edges.indexOf(edge)),
      };
    } else if (this.annotation.type === 'FaceStateToSector') {
      serializedAnnotation = {
        type: 'FaceStateToSector',
        face: this.board.faces.indexOf(this.annotation.face),
        sectors: this.annotation.sectors.map((sector) => this.board.halfEdges.indexOf(sector)),
        beforeStates: this.annotation.beforeStates.map((state) => state.serialize()),
        afterStates: this.annotation.afterStates.map((state) => state.serialize()),
      };
    } else if (this.annotation.type === 'FaceStateToSameFaceColor') {
      serializedAnnotation = {
        type: 'FaceStateToSameFaceColor',
        face: this.board.faces.indexOf(this.annotation.face),
        facesA: this.annotation.facesA.map((face) => this.board.faces.indexOf(face)),
        facesB: this.annotation.facesB.map((face) => this.board.faces.indexOf(face)),
      };
    } else if (this.annotation.type === 'FaceStateToOppositeFaceColor') {
      serializedAnnotation = {
        type: 'FaceStateToOppositeFaceColor',
        face: this.board.faces.indexOf(this.annotation.face),
        facesA: this.annotation.facesA.map((face) => this.board.faces.indexOf(face)),
        facesB: this.annotation.facesB.map((face) => this.board.faces.indexOf(face)),
      };
    } else if (this.annotation.type === 'FaceStateToVertexState') {
      serializedAnnotation = {
        type: 'FaceStateToVertexState',
        face: this.board.faces.indexOf(this.annotation.face),
        vertices: this.annotation.vertices.map((vertex) => this.board.vertices.indexOf(vertex)),
        beforeStates: this.annotation.beforeStates.map((state) => state.serialize()),
        afterStates: this.annotation.afterStates.map((state) => state.serialize()),
      };
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
      const boardPatternBoard = BoardPatternBoard.get(board);
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
    } else if (annotationType === 'FaceColorDisconnection') {
      annotation = {
        type: 'FaceColorDisconnection',
        disconnection: serializedAction.annotation.disconnection.map((index: number) => board.halfEdges[index]),
        facesA: serializedAction.annotation.facesA.map((index: number) => board.faces[index]),
        facesB: serializedAction.annotation.facesB.map((index: number) => board.faces[index]),
      };
    } else if (annotationType === 'ForcedLine') {
      annotation = {
        type: 'ForcedLine',
        vertex: board.vertices[serializedAction.annotation.vertex],
        blackEdge: board.edges[serializedAction.annotation.blackEdge],
        whiteEdge: board.edges[serializedAction.annotation.whiteEdge],
        redEdges: serializedAction.annotation.redEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'AlmostEmptyToRed') {
      annotation = {
        type: 'AlmostEmptyToRed',
        vertex: board.vertices[serializedAction.annotation.vertex],
        whiteEdge: board.edges[serializedAction.annotation.whiteEdge],
        redEdges: serializedAction.annotation.redEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'JointToRed') {
      annotation = {
        type: 'JointToRed',
        vertex: board.vertices[serializedAction.annotation.vertex],
        whiteEdges: serializedAction.annotation.whiteEdges.map((index: number) => board.edges[index]),
        blackEdges: [
          board.edges[serializedAction.annotation.blackEdges[0]],
          board.edges[serializedAction.annotation.blackEdges[1]],
        ],
      };
    } else if (annotationType === 'FaceSatisfied') {
      annotation = {
        type: 'FaceSatisfied',
        face: board.faces[serializedAction.annotation.face],
        whiteEdges: serializedAction.annotation.whiteEdges.map((index: number) => board.edges[index]),
        blackEdges: serializedAction.annotation.blackEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'FaceAntiSatisfied') {
      annotation = {
        type: 'FaceAntiSatisfied',
        face: board.faces[serializedAction.annotation.face],
        whiteEdges: serializedAction.annotation.whiteEdges.map((index: number) => board.edges[index]),
        redEdges: serializedAction.annotation.redEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'CompletingEdgesAfterSolve') {
      annotation = {
        type: 'CompletingEdgesAfterSolve',
        whiteEdges: serializedAction.annotation.whiteEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'FaceColoringBlackEdge') {
      annotation = {
        type: 'FaceColoringBlackEdge',
        edge: board.edges[serializedAction.annotation.edge],
      };
    } else if (annotationType === 'FaceColoringRedEdge') {
      annotation = {
        type: 'FaceColoringRedEdge',
        edge: board.edges[serializedAction.annotation.edge],
      };
    } else if (annotationType === 'FaceColorToBlack') {
      annotation = {
        type: 'FaceColorToBlack',
        edge: board.edges[serializedAction.annotation.edge],
      };
    } else if (annotationType === 'FaceColorToRed') {
      annotation = {
        type: 'FaceColorToRed',
        edge: board.edges[serializedAction.annotation.edge],
      };
    } else if (annotationType === 'FaceColorNoTrivialLoop') {
      annotation = {
        type: 'FaceColorNoTrivialLoop',
        face: board.faces[serializedAction.annotation.face],
      };
    } else if (
      annotationType === 'FaceColorMatchToRed' ||
      annotationType === 'FaceColorMatchToBlack' ||
      annotationType === 'FaceColorBalance'
    ) {
      annotation = {
        type: annotationType,
        face: board.faces[serializedAction.annotation.face],
        remainingValue: serializedAction.annotation.remainingValue,
        availableSideCount: serializedAction.annotation.availableSideCount,
        balancedPairs: serializedAction.annotation.balancedPairs.map((pair: [number[], number[]]) => [
          pair[0].map((index: number) => board.edges[index]),
          pair[1].map((index: number) => board.edges[index]),
        ]),
        matchingEdges: serializedAction.annotation.matchingEdges.map((index: number) => board.edges[index]),
      };

      if (annotationType === 'FaceColorBalance') {
        (annotation as any).oppositeEdges = serializedAction.annotation.oppositeEdges.map(
          (index: number) => board.edges[index],
        );
      }
    } else if (annotationType === 'DoubleMinusOneFaces') {
      annotation = {
        type: 'DoubleMinusOneFaces',
        faces: serializedAction.annotation.faces.map((index: number) => board.faces[index]),
        toBlackEdges: serializedAction.annotation.toBlackEdges.map((index: number) => board.edges[index]),
        toRedEdges: serializedAction.annotation.toRedEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'SingleEdgeToSector') {
      annotation = {
        type: 'SingleEdgeToSector',
        sector: board.halfEdges[serializedAction.annotation.sector],
        beforeState: SectorState.deserialize(serializedAction.annotation.beforeState),
        afterState: SectorState.deserialize(serializedAction.annotation.afterState),
      };
    } else if (annotationType === 'DoubleEdgeToSector') {
      annotation = {
        type: 'DoubleEdgeToSector',
        sector: board.halfEdges[serializedAction.annotation.sector],
        beforeState: SectorState.deserialize(serializedAction.annotation.beforeState),
        afterState: SectorState.deserialize(serializedAction.annotation.afterState),
      };
    } else if (annotationType === 'ForcedSector') {
      annotation = {
        type: 'ForcedSector',
        sector: board.halfEdges[serializedAction.annotation.sector],
        sectorState: SectorState.deserialize(serializedAction.annotation.sectorState),
        toRedEdges: serializedAction.annotation.toRedEdges.map((index: number) => board.edges[index]),
        toBlackEdges: serializedAction.annotation.toBlackEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'StaticFaceSectors') {
      annotation = {
        type: 'StaticFaceSectors',
        face: board.faces[serializedAction.annotation.face],
        sectors: serializedAction.annotation.sectors.map((index: number) => board.halfEdges[index]),
      };
    } else if (annotationType === 'VertexState') {
      annotation = {
        type: 'VertexState',
        vertex: board.vertices[serializedAction.annotation.vertex],
        beforeState: serializedAction.annotation.beforeState,
        afterState: serializedAction.annotation.afterState,
      };
    } else if (annotationType === 'VertexStateToEdge') {
      annotation = {
        type: 'VertexStateToEdge',
        vertex: board.vertices[serializedAction.annotation.vertex],
        toRedEdges: serializedAction.annotation.toRedEdges.map((index: number) => board.edges[index]),
        toBlackEdges: serializedAction.annotation.toBlackEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'VertexStateToSector') {
      annotation = {
        type: 'VertexStateToSector',
        vertex: board.vertices[serializedAction.annotation.vertex],
        sectors: serializedAction.annotation.sectors.map((index: number) => board.halfEdges[index]),
        beforeStates: serializedAction.annotation.beforeStates.map((state: TSerializedSectorState) =>
          SectorState.deserialize(state),
        ),
        afterStates: serializedAction.annotation.afterStates.map((state: TSerializedSectorState) =>
          SectorState.deserialize(state),
        ),
      };
    } else if (annotationType === 'VertexStateToSameFaceColor') {
      annotation = {
        type: 'VertexStateToSameFaceColor',
        vertex: board.vertices[serializedAction.annotation.vertex],
        facesA: serializedAction.annotation.facesA.map((index: number) => board.faces[index]),
        facesB: serializedAction.annotation.facesB.map((index: number) => board.faces[index]),
      };
    } else if (annotationType === 'VertexStateToOppositeFaceColor') {
      annotation = {
        type: 'VertexStateToOppositeFaceColor',
        vertex: board.vertices[serializedAction.annotation.vertex],
        facesA: serializedAction.annotation.facesA.map((index: number) => board.faces[index]),
        facesB: serializedAction.annotation.facesB.map((index: number) => board.faces[index]),
      };
    } else if (annotationType === 'FaceState') {
      const face = board.faces[serializedAction.annotation.face];

      annotation = {
        type: 'FaceState',
        face: face,
        beforeState: FaceState.deserialize(face, serializedAction.annotation.beforeState as TSerializedFaceState),
        afterState: FaceState.deserialize(face, serializedAction.annotation.afterState as TSerializedFaceState),
      };
    } else if (annotationType === 'FaceStateToEdge') {
      annotation = {
        type: 'FaceStateToEdge',
        face: board.faces[serializedAction.annotation.face],
        toRedEdges: serializedAction.annotation.toRedEdges.map((index: number) => board.edges[index]),
        toBlackEdges: serializedAction.annotation.toBlackEdges.map((index: number) => board.edges[index]),
      };
    } else if (annotationType === 'FaceStateToSector') {
      annotation = {
        type: 'FaceStateToSector',
        face: board.faces[serializedAction.annotation.face],
        sectors: serializedAction.annotation.sectors.map((index: number) => board.halfEdges[index]),
        beforeStates: serializedAction.annotation.beforeStates.map((state: TSerializedSectorState) =>
          SectorState.deserialize(state),
        ),
        afterStates: serializedAction.annotation.afterStates.map((state: TSerializedSectorState) =>
          SectorState.deserialize(state),
        ),
      };
    } else if (annotationType === 'FaceStateToSameFaceColor') {
      annotation = {
        type: 'FaceStateToSameFaceColor',
        face: board.faces[serializedAction.annotation.face],
        facesA: serializedAction.annotation.facesA.map((index: number) => board.faces[index]),
        facesB: serializedAction.annotation.facesB.map((index: number) => board.faces[index]),
      };
    } else if (annotationType === 'FaceStateToOppositeFaceColor') {
      annotation = {
        type: 'FaceStateToOppositeFaceColor',
        face: board.faces[serializedAction.annotation.face],
        facesA: serializedAction.annotation.facesA.map((index: number) => board.faces[index]),
        facesB: serializedAction.annotation.facesB.map((index: number) => board.faces[index]),
      };
    } else if (annotationType === 'FaceStateToVertexState') {
      annotation = {
        type: 'FaceStateToVertexState',
        face: board.faces[serializedAction.annotation.face],
        vertices: serializedAction.annotation.vertices.map((index: number) => board.vertices[index]),
        beforeStates: serializedAction.annotation.beforeStates.map((state: TSerializedSectorState) =>
          SectorState.deserialize(state),
        ),
        afterStates: serializedAction.annotation.afterStates.map((state: TSerializedSectorState) =>
          SectorState.deserialize(state),
        ),
      };
    }

    if (annotation !== null) {
      return new AnnotatedAction<TCompleteData>(action, annotation, board);
    } else {
      throw new Error('unimplemented deserializeAction on AnnotatedAction');
    }
  }
}
