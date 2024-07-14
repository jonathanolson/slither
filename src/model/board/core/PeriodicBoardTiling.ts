import { Vector2 } from 'phet-lib/dot';

export interface PeriodicBoardTiling {
  name: string;
  urlName: string;
  basisA: Vector2;
  basisB: Vector2;
  polygons: Vector2[][];
  translation: Vector2;
  scale?: number;
}

export const squareTiling: PeriodicBoardTiling = {
  name: 'Square Tiling',
  urlName: 'square',
  basisA: new Vector2(1, 0),
  basisB: new Vector2(0, 1),
  polygons: [[new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)]],
  translation: new Vector2(1, 1),
};
export const hexagonalTiling: PeriodicBoardTiling = {
  name: 'Hexagonal Tiling',
  urlName: 'hexagonal',
  basisA: new Vector2(1, 0),
  basisB: new Vector2(0.5, Math.sqrt(3) / 2),
  polygons: [
    [
      new Vector2(0, 1 / Math.sqrt(3)),
      new Vector2(0.5, Math.sqrt(3) / 2),
      new Vector2(1, 1 / Math.sqrt(3)),
      new Vector2(1, 0),
      new Vector2(0.5, -(1 / (2 * Math.sqrt(3)))),
      new Vector2(0, 0),
    ],
  ],
  translation: new Vector2(3 / 2, Math.sqrt(3) / 2),
};
export const triangularTiling: PeriodicBoardTiling = {
  name: 'Triangular',
  urlName: 'triangular',
  basisA: new Vector2(1, 0),
  basisB: new Vector2(0.5, Math.sqrt(3) / 2),
  polygons: [
    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0.5, Math.sqrt(3) / 2)],
    [new Vector2(0.5, Math.sqrt(3) / 2), new Vector2(3 / 2, Math.sqrt(3) / 2), new Vector2(1, 0)],
  ],
  translation: new Vector2(3 / 2, Math.sqrt(3) / 2),
};
export const trihexagonalTiling: PeriodicBoardTiling = {
  name: 'Trihexagonal',
  urlName: 'trihexagonal',
  basisA: new Vector2(2, 0),
  basisB: new Vector2(1, Math.sqrt(3)),
  polygons: [
    [
      new Vector2(1 / 2, Math.sqrt(3) / 2),
      new Vector2(1, 0),
      new Vector2(1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(-1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(-1, 0),
      new Vector2(-1 / 2, Math.sqrt(3) / 2),
    ],
    [new Vector2(1 / 2, Math.sqrt(3) / 2), new Vector2(1, 0), new Vector2(3 / 2, Math.sqrt(3) / 2)],
    [new Vector2(1 / 2, -(Math.sqrt(3) / 2)), new Vector2(1, 0), new Vector2(3 / 2, -(Math.sqrt(3) / 2))],
  ],
  translation: new Vector2(3, Math.sqrt(3)),
};
export const smallRhombitrihexagonalTiling: PeriodicBoardTiling = {
  name: 'Rhombitrihexagonal',
  urlName: 'rhombitrihexagonal',
  basisA: new Vector2(0.5 * (3 + Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
  basisB: new Vector2(0.5 * (3 + Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
  polygons: [
    [
      new Vector2(1 / 2, Math.sqrt(3) / 2),
      new Vector2(1, 0),
      new Vector2(1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(-1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(-1, 0),
      new Vector2(-1 / 2, Math.sqrt(3) / 2),
    ],
    [
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2(1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(1, 0),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), -1 / 2),
    ],
    [new Vector2(1 + Math.sqrt(3) / 2, 1 / 2), new Vector2(1, 0), new Vector2(1 + Math.sqrt(3) / 2, -1 / 2)],
    [
      new Vector2(1 + Math.sqrt(3) / 2, 1 / 2),
      new Vector2(1, 0),
      new Vector2(1 / 2, Math.sqrt(3) / 2),
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
    ],
    [
      new Vector2(1 / 2, (1 / 2) * (2 + Math.sqrt(3))),
      new Vector2(1 / 2, Math.sqrt(3) / 2),
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
    ],
    [
      new Vector2(1 / 2, (1 / 2) * (2 + Math.sqrt(3))),
      new Vector2(1 / 2, Math.sqrt(3) / 2),
      new Vector2(-1 / 2, Math.sqrt(3) / 2),
      new Vector2(-1 / 2, (1 / 2) * (2 + Math.sqrt(3))),
    ],
  ],
  translation: new Vector2(3 + Math.sqrt(3), 0.5 * (-1 - Math.sqrt(3)) + 0.5 * (1 + Math.sqrt(3))),
};
export const truncatedSquareTiling: PeriodicBoardTiling = {
  name: 'Truncated Square',
  urlName: 'truncated-square',
  basisA: new Vector2(2 + Math.sqrt(2), 0),
  basisB: new Vector2(0.5 * (2 + Math.sqrt(2)), 1 + 1 / Math.sqrt(2)),
  polygons: [
    [
      new Vector2(0.5, 0.5 * (1 + Math.sqrt(2))),
      new Vector2(0.5 * (1 + Math.sqrt(2)), 0.5),
      new Vector2(0.5 * (1 + Math.sqrt(2)), -0.5),
      new Vector2(0.5, 0.5 * (-1 - Math.sqrt(2))),
      new Vector2(-0.5, 0.5 * (-1 - Math.sqrt(2))),
      new Vector2(0.5 * (-1 - Math.sqrt(2)), -0.5),
      new Vector2(0.5 * (-1 - Math.sqrt(2)), 0.5),
      new Vector2(-0.5, 0.5 * (1 + Math.sqrt(2))),
    ],
    [
      new Vector2(0.5 * (1 + Math.sqrt(2)), 0.5),
      new Vector2(0.5 * (1 + Math.sqrt(2)), -0.5),
      new Vector2(3 / 2 + 1 / Math.sqrt(2), -0.5),
      new Vector2(3 / 2 + 1 / Math.sqrt(2), 0.5),
    ],
  ],
  translation: new Vector2(2 + Math.sqrt(2) + 0.5 * (2 + Math.sqrt(2)), 1 + 1 / Math.sqrt(2)),
};
export const snubSquareTiling: PeriodicBoardTiling = {
  name: 'Snub Square',
  urlName: 'snub-square',
  basisA: new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
  basisB: new Vector2((1 / 2) * (-1 - Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
  polygons: [
    [new Vector2(1 / 2, 0), new Vector2(0, -(Math.sqrt(3) / 2)), new Vector2(-(1 / 2), 0)],
    [new Vector2(1 / 2, 0), new Vector2(0, Math.sqrt(3) / 2), new Vector2(-(1 / 2), 0)],
    [
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), 1 / 2),
      new Vector2(1 / 2, 0),
      new Vector2(0, Math.sqrt(3) / 2),
      new Vector2(Math.sqrt(3) / 2, (1 / 2) * (1 + Math.sqrt(3))),
    ],
    [
      new Vector2(Math.sqrt(3) / 2, (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2(0, Math.sqrt(3) / 2),
      new Vector2(0, (1 / 2) * (2 + Math.sqrt(3))),
    ],
    [
      new Vector2(-(Math.sqrt(3) / 2), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2(0, Math.sqrt(3) / 2),
      new Vector2(0, (1 / 2) * (2 + Math.sqrt(3))),
    ],
    [
      new Vector2((1 / 2) * (-1 - Math.sqrt(3)), 1 / 2),
      new Vector2(-(1 / 2), 0),
      new Vector2(0, Math.sqrt(3) / 2),
      new Vector2(-(Math.sqrt(3) / 2), (1 / 2) * (1 + Math.sqrt(3))),
    ],
  ],
  translation: new Vector2((1 / 2) * (-1 - Math.sqrt(3)) + (1 / 2) * (1 + Math.sqrt(3)), -1 - Math.sqrt(3)),
};
export const truncatedHexagonalTiling: PeriodicBoardTiling = {
  name: 'Truncated Hexagonal',
  urlName: 'truncated-hexagonal',
  basisA: new Vector2(2 + Math.sqrt(3), 0),
  basisB: new Vector2(0.5 * (2 + Math.sqrt(3)), 3 / 2 + Math.sqrt(3)),
  polygons: [
    [
      new Vector2(1 / 2, (1 / 2) * (2 + Math.sqrt(3))),
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), 1 / 2),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), -(1 / 2)),
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2(1 / 2, (1 / 2) * (-2 - Math.sqrt(3))),
      new Vector2(-(1 / 2), (1 / 2) * (-2 - Math.sqrt(3))),
      new Vector2((1 / 2) * (-1 - Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2((1 / 2) * (-2 - Math.sqrt(3)), -(1 / 2)),
      new Vector2((1 / 2) * (-2 - Math.sqrt(3)), 1 / 2),
      new Vector2((1 / 2) * (-1 - Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2(-(1 / 2), (1 / 2) * (2 + Math.sqrt(3))),
    ],
    [
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2((1 / 2) * (3 + Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), 1 / 2),
    ],
    [
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2((1 / 2) * (3 + Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), -(1 / 2)),
    ],
  ],
  translation: new Vector2(2 + Math.sqrt(3) + 0.5 * (2 + Math.sqrt(3)), 3 / 2 + Math.sqrt(3)),
};
export const elongatedTriangularTiling: PeriodicBoardTiling = {
  name: 'Elongated Triangular',
  urlName: 'elongated-triangular',
  basisA: new Vector2(1, 0),
  basisB: new Vector2(0.5, 0.5 * (2 + Math.sqrt(3))),
  polygons: [
    [
      new Vector2(-(1 / 2), -(1 / 2)),
      new Vector2(-(1 / 2), 1 / 2),
      new Vector2(1 / 2, 1 / 2),
      new Vector2(1 / 2, -(1 / 2)),
    ],
    [new Vector2(1 / 2, 1 / 2), new Vector2(0, (1 / 2) * (1 + Math.sqrt(3))), new Vector2(-(1 / 2), 1 / 2)],
    [new Vector2(1 / 2, -(1 / 2)), new Vector2(0, (1 / 2) * (-1 - Math.sqrt(3))), new Vector2(-(1 / 2), -(1 / 2))],
  ],
  translation: new Vector2(3 / 2, 0.5 * (2 + Math.sqrt(3))),
};
export const greatRhombitrihexagonalTiling: PeriodicBoardTiling = {
  name: 'Great Rhombitrihexagonal',
  urlName: 'great-rhombitrihexagonal',
  basisA: new Vector2(3 + Math.sqrt(3), 0),
  basisB: new Vector2(0.5 * (3 + Math.sqrt(3)), 1.5 * (1 + Math.sqrt(3))),
  polygons: [
    [
      new Vector2(1 / 2, (1 / 2) * (2 + Math.sqrt(3))),
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), 1 / 2),
      new Vector2((1 / 2) * (2 + Math.sqrt(3)), -(1 / 2)),
      new Vector2((1 / 2) * (1 + Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2(1 / 2, (1 / 2) * (-2 - Math.sqrt(3))),
      new Vector2(-(1 / 2), (1 / 2) * (-2 - Math.sqrt(3))),
      new Vector2((1 / 2) * (-1 - Math.sqrt(3)), (1 / 2) * (-1 - Math.sqrt(3))),
      new Vector2((1 / 2) * (-2 - Math.sqrt(3)), -(1 / 2)),
      new Vector2((1 / 2) * (-2 - Math.sqrt(3)), 1 / 2),
      new Vector2((1 / 2) * (-1 - Math.sqrt(3)), (1 / 2) * (1 + Math.sqrt(3))),
      new Vector2(-(1 / 2), (1 / 2) * (2 + Math.sqrt(3))),
    ],
    [
      new Vector2(1, 1 + Math.sqrt(3)),
      new Vector2(0.5 * (2 + Math.sqrt(3)), 0.5 * (1 + 2 * Math.sqrt(3))),
      new Vector2(0.5 * (1 + Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
      new Vector2(0.5, 0.5 * (2 + Math.sqrt(3))),
    ],
    [
      new Vector2(0.5 * (1 + Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
      new Vector2(0.5 * (2 + Math.sqrt(3)), 0.5),
      new Vector2(1 + 0.5 * (2 + Math.sqrt(3)), 0.5),
      new Vector2(0.5 * (5 + Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
      new Vector2(0.5 * (4 + Math.sqrt(3)), 0.5 * (1 + 2 * Math.sqrt(3))),
      new Vector2(0.5 * (2 + Math.sqrt(3)), 0.5 * (1 + 2 * Math.sqrt(3))),
    ],
    [
      new Vector2(1 + 0.5 * (2 + Math.sqrt(3)), 0.5),
      new Vector2(1 + 0.5 * (2 + Math.sqrt(3)), -(1 / 2)),
      new Vector2(0.5 * (2 + Math.sqrt(3)), -(1 / 2)),
      new Vector2(0.5 * (2 + Math.sqrt(3)), 0.5),
    ],
    [
      new Vector2(0.5 * (1 + Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
      new Vector2(0.5 * (2 + Math.sqrt(3)), -(1 / 2)),
      new Vector2(1 + 0.5 * (2 + Math.sqrt(3)), -(1 / 2)),
      new Vector2(0.5 * (5 + Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
      new Vector2(0.5 * (4 + Math.sqrt(3)), 0.5 * (-1 - 2 * Math.sqrt(3))),
      new Vector2(0.5 * (2 + Math.sqrt(3)), 0.5 * (-1 - 2 * Math.sqrt(3))),
    ],
    [
      new Vector2(0.5 * (2 + Math.sqrt(3)), 0.5 * (-1 - 2 * Math.sqrt(3))),
      new Vector2(1, -1 - Math.sqrt(3)),
      new Vector2(0.5, 0.5 * (-2 - Math.sqrt(3))),
      new Vector2(0.5 * (1 + Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
    ],
  ],
  translation: new Vector2(3 + Math.sqrt(3) + 0.5 * (3 + Math.sqrt(3)), 1.5 * (1 + Math.sqrt(3))),
};
export const snubHexagonalTiling: PeriodicBoardTiling = {
  name: 'Snub Hexagonal',
  urlName: 'snub-hexagonal',
  basisA: new Vector2(5 / 2, -Math.sqrt(3) / 2),
  basisB: new Vector2(-1 / 2, (3 * Math.sqrt(3)) / 2),
  polygons: [
    [
      new Vector2(1 / 2, Math.sqrt(3) / 2),
      new Vector2(1, 0),
      new Vector2(1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(-(1 / 2), -(Math.sqrt(3) / 2)),
      new Vector2(-1, 0),
      new Vector2(-(1 / 2), Math.sqrt(3) / 2),
    ],
    [new Vector2(-1, 0), new Vector2(-3 / 2, -(Math.sqrt(3) / 2)), new Vector2(-2, 0)],
    [new Vector2(-(1 / 2), -(Math.sqrt(3) / 2)), new Vector2(-1, 0), new Vector2(-3 / 2, -(Math.sqrt(3) / 2))],
    [new Vector2(1 / 2, Math.sqrt(3) / 2), new Vector2(1, 0), new Vector2(3 / 2, Math.sqrt(3) / 2)],
    [new Vector2(1, 0), new Vector2(3 / 2, Math.sqrt(3) / 2), new Vector2(2, 0)],
    [new Vector2(-1, 0), new Vector2(-(1 / 2), Math.sqrt(3) / 2), new Vector2(-(3 / 2), Math.sqrt(3) / 2)],
    [
      new Vector2(1 / 2, -(Math.sqrt(3) / 2)),
      new Vector2(-(1 / 2), -(Math.sqrt(3) / 2)),
      new Vector2(0, -Math.sqrt(3)),
    ],
    [new Vector2(1, 0), new Vector2(1 / 2, -(Math.sqrt(3) / 2)), new Vector2(3 / 2, -(Math.sqrt(3) / 2))],
    [new Vector2(-(1 / 2), Math.sqrt(3) / 2), new Vector2(1 / 2, Math.sqrt(3) / 2), new Vector2(0, Math.sqrt(3))],
  ],
  translation: new Vector2(2, Math.sqrt(3)),
};
export const rhombilleTiling: PeriodicBoardTiling = {
  name: 'Rhombille',
  urlName: 'rhombille',
  basisA: new Vector2(2, 0),
  basisB: new Vector2(1, Math.sqrt(3)),
  polygons: [
    [
      new Vector2(5, 5 / Math.sqrt(3)),
      new Vector2(4, 2 * Math.sqrt(3)),
      new Vector2(5, 7 / Math.sqrt(3)),
      new Vector2(6, 2 * Math.sqrt(3)),
    ],
    [
      new Vector2(5, 5 / Math.sqrt(3)),
      new Vector2(6, 2 * Math.sqrt(3)),
      new Vector2(6, 4 / Math.sqrt(3)),
      new Vector2(5, Math.sqrt(3)),
    ],
    [
      new Vector2(5, 5 / Math.sqrt(3)),
      new Vector2(5, Math.sqrt(3)),
      new Vector2(4, 4 / Math.sqrt(3)),
      new Vector2(4, 2 * Math.sqrt(3)),
    ],
  ],
  translation: new Vector2(3, Math.sqrt(3)),
};
export const deltoidalTrihexagonalTiling: PeriodicBoardTiling = {
  name: 'Deltoidal Trihexagonal',
  urlName: 'deltoidal-trihexagonal',
  basisA: new Vector2(0.5 * (3 + Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
  basisB: new Vector2(0.5 * (3 + Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
  polygons: [
    [
      new Vector2((1 / 3) * (12 + 4 * Math.sqrt(3)), 0),
      new Vector2((1 / 4) * (15 + 5 * Math.sqrt(3)), 0.25 * (-1 - Math.sqrt(3))),
      new Vector2(3 + Math.sqrt(3), 0),
      new Vector2((1 / 4) * (15 + 5 * Math.sqrt(3)), 0.25 * (1 + Math.sqrt(3))),
    ],
    [
      new Vector2((1 / 3) * (12 + 4 * Math.sqrt(3)), 0),
      new Vector2((1 / 4) * (15 + 5 * Math.sqrt(3)), 0.25 * (1 + Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0),
    ],
    [
      new Vector2((1 / 3) * (12 + 4 * Math.sqrt(3)), 0),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
      new Vector2((1 / 4) * (15 + 5 * Math.sqrt(3)), 0.25 * (-1 - Math.sqrt(3))),
    ],
    [
      new Vector2((1 / 3) * (15 + 5 * Math.sqrt(3)), 0),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (1 + Math.sqrt(3))),
      new Vector2((1 / 4) * (21 + 7 * Math.sqrt(3)), 0.25 * (1 + Math.sqrt(3))),
    ],
    [
      new Vector2((1 / 3) * (15 + 5 * Math.sqrt(3)), 0),
      new Vector2((1 / 4) * (21 + 7 * Math.sqrt(3)), 0.25 * (1 + Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 0),
      new Vector2((1 / 4) * (21 + 7 * Math.sqrt(3)), 0.25 * (-1 - Math.sqrt(3))),
    ],
    [
      new Vector2((1 / 3) * (15 + 5 * Math.sqrt(3)), 0),
      new Vector2((1 / 4) * (21 + 7 * Math.sqrt(3)), 0.25 * (-1 - Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0),
    ],
  ],
  translation: new Vector2(3 + Math.sqrt(3), 0.5 * (-1 - Math.sqrt(3)) + 0.5 * (1 + Math.sqrt(3))),
};
export const tetrakisSquareTiling: PeriodicBoardTiling = {
  name: 'Tetrakis Square',
  urlName: 'tetrakis-square',
  basisA: new Vector2(2 + Math.sqrt(2), 0),
  basisB: new Vector2(0.5 * (2 + Math.sqrt(2)), 1 + 1 / Math.sqrt(2)),
  polygons: [
    [
      new Vector2(4 + 2 * Math.sqrt(2), 0.5 * (2 + Math.sqrt(2))),
      new Vector2(4 + 2 * Math.sqrt(2), 2 + Math.sqrt(2)),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(2)), 0.5 * (2 + Math.sqrt(2))),
    ],
    [
      new Vector2(0.5 * (10 + 5 * Math.sqrt(2)), 2 + Math.sqrt(2)),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(2)), 0.5 * (2 + Math.sqrt(2))),
      new Vector2(4 + 2 * Math.sqrt(2), 2 + Math.sqrt(2)),
    ],
    [
      new Vector2(0.5 * (10 + 5 * Math.sqrt(2)), 2 + Math.sqrt(2)),
      new Vector2(6 + 3 * Math.sqrt(2), 2 + Math.sqrt(2)),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(2)), 0.5 * (2 + Math.sqrt(2))),
    ],
    [
      new Vector2(6 + 3 * Math.sqrt(2), 2 + Math.sqrt(2)),
      new Vector2(6 + 3 * Math.sqrt(2), 0.5 * (2 + Math.sqrt(2))),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(2)), 0.5 * (2 + Math.sqrt(2))),
    ],
  ],
  translation: new Vector2(2 + Math.sqrt(2) + 0.5 * (2 + Math.sqrt(2)), 1 + 1 / Math.sqrt(2)),
};
export const cairoPentagonalTiling: PeriodicBoardTiling = {
  name: 'Cairo Pentagonal',
  urlName: 'cairo-pentagonal',
  basisA: new Vector2(0.5 * (1 + Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
  basisB: new Vector2(0.5 * (-1 - Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
  polygons: [
    [
      new Vector2(0, (1 / 6) * (-6 - 5 * Math.sqrt(3))),
      new Vector2(0.25 * (-1 - Math.sqrt(3)), 0.25 * (-3 - 3 * Math.sqrt(3))),
      new Vector2(-1 / (2 * Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
      new Vector2(1 / (2 * Math.sqrt(3)), 0.5 * (-1 - Math.sqrt(3))),
      new Vector2(0.25 * (1 + Math.sqrt(3)), 0.25 * (-3 - 3 * Math.sqrt(3))),
    ],
    [
      new Vector2(0, (1 / 6) * (-6 - 5 * Math.sqrt(3))),
      new Vector2(0.25 * (1 + Math.sqrt(3)), 0.25 * (-3 - 3 * Math.sqrt(3))),
      new Vector2((1 / 6) * (3 + 2 * Math.sqrt(3)), -1 - Math.sqrt(3)),
      new Vector2(0.25 * (1 + Math.sqrt(3)), 0.25 * (-5 - 5 * Math.sqrt(3))),
      new Vector2(0, (1 / 6) * (-6 - 7 * Math.sqrt(3))),
    ],
    [
      new Vector2(0, (1 / 6) * (-6 - 7 * Math.sqrt(3))),
      new Vector2(0.25 * (-1 - Math.sqrt(3)), 0.25 * (-5 - 5 * Math.sqrt(3))),
      new Vector2((1 / 6) * (-3 - 2 * Math.sqrt(3)), -1 - Math.sqrt(3)),
      new Vector2(0.25 * (-1 - Math.sqrt(3)), 0.25 * (-3 - 3 * Math.sqrt(3))),
      new Vector2(0, (1 / 6) * (-6 - 5 * Math.sqrt(3))),
    ],
    [
      new Vector2(0, (1 / 6) * (-6 - 7 * Math.sqrt(3))),
      new Vector2(0.25 * (1 + Math.sqrt(3)), 0.25 * (-5 - 5 * Math.sqrt(3))),
      new Vector2(1 / (2 * Math.sqrt(3)), 0.5 * (-3 - 3 * Math.sqrt(3))),
      new Vector2(-1 / (2 * Math.sqrt(3)), 0.5 * (-3 - 3 * Math.sqrt(3))),
      new Vector2(0.25 * (-1 - Math.sqrt(3)), 0.25 * (-5 - 5 * Math.sqrt(3))),
    ],
  ],
  translation: new Vector2(0.5 * (-1 - Math.sqrt(3)) + 0.5 * (1 + Math.sqrt(3)), -1 - Math.sqrt(3)),
};
export const triakisTriangularTiling: PeriodicBoardTiling = {
  name: 'Triakis Triangular',
  urlName: 'triakis-triangular',
  basisA: new Vector2(2 + Math.sqrt(3), 0),
  basisB: new Vector2(0.5 * (2 + Math.sqrt(3)), 1.5 + Math.sqrt(3)),
  polygons: [
    [
      new Vector2(4 + 2 * Math.sqrt(3), (1 / 3) * (6 + 4 * Math.sqrt(3))),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), 0.5 * (3 + 2 * Math.sqrt(3))),
      new Vector2(0.5 * (6 + 3 * Math.sqrt(3)), 0.5 * (3 + 2 * Math.sqrt(3))),
    ],
    [
      new Vector2(4 + 2 * Math.sqrt(3), (1 / 3) * (6 + 4 * Math.sqrt(3))),
      new Vector2(0.5 * (6 + 3 * Math.sqrt(3)), 0.5 * (3 + 2 * Math.sqrt(3))),
      new Vector2(4 + 2 * Math.sqrt(3), 3 + 2 * Math.sqrt(3)),
    ],
    [
      new Vector2(4 + 2 * Math.sqrt(3), (1 / 3) * (6 + 4 * Math.sqrt(3))),
      new Vector2(4 + 2 * Math.sqrt(3), 3 + 2 * Math.sqrt(3)),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), 0.5 * (3 + 2 * Math.sqrt(3))),
    ],
    [
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), (1 / 6) * (15 + 10 * Math.sqrt(3))),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), 0.5 * (3 + 2 * Math.sqrt(3))),
      new Vector2(4 + 2 * Math.sqrt(3), 3 + 2 * Math.sqrt(3)),
    ],
    [
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), (1 / 6) * (15 + 10 * Math.sqrt(3))),
      new Vector2(4 + 2 * Math.sqrt(3), 3 + 2 * Math.sqrt(3)),
      new Vector2(6 + 3 * Math.sqrt(3), 3 + 2 * Math.sqrt(3)),
    ],
    [
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), (1 / 6) * (15 + 10 * Math.sqrt(3))),
      new Vector2(6 + 3 * Math.sqrt(3), 3 + 2 * Math.sqrt(3)),
      new Vector2(0.5 * (10 + 5 * Math.sqrt(3)), 0.5 * (3 + 2 * Math.sqrt(3))),
    ],
  ],
  translation: new Vector2(2 + Math.sqrt(3) + 0.5 * (2 + Math.sqrt(3)), 1.5 + Math.sqrt(3)),
};
export const prismaticPentagonalTiling: PeriodicBoardTiling = {
  name: 'Prismatic Pentagonal',
  urlName: 'prismatic-pentagonal',
  basisA: new Vector2(1, 0),
  basisB: new Vector2(0.5, 0.5 * (2 + Math.sqrt(3))),
  polygons: [
    [
      new Vector2(2, (1 / 6) * (9 + 5 * Math.sqrt(3))),
      new Vector2(2.5, (1 / 6) * (9 + 4 * Math.sqrt(3))),
      new Vector2(2.5, 0.5 * (2 + Math.sqrt(3))),
      new Vector2(1.5, 0.5 * (2 + Math.sqrt(3))),
      new Vector2(1.5, (1 / 6) * (9 + 4 * Math.sqrt(3))),
    ],
    [
      new Vector2(2.5, (1 / 6) * (9 + 4 * Math.sqrt(3))),
      new Vector2(2, (1 / 6) * (9 + 5 * Math.sqrt(3))),
      new Vector2(2, 2 + Math.sqrt(3)),
      new Vector2(3, 2 + Math.sqrt(3)),
      new Vector2(3, (1 / 6) * (9 + 5 * Math.sqrt(3))),
    ],
  ],
  translation: new Vector2(1.5, 0.5 * (2 + Math.sqrt(3))),
};
export const bisectedHexagonalTiling: PeriodicBoardTiling = {
  name: 'Bisected Hexagonal',
  urlName: 'bisected-hexagonal',
  basisA: new Vector2(3 + Math.sqrt(3), 0),
  basisB: new Vector2(0.5 * (3 + Math.sqrt(3)), 1.5 * (1 + Math.sqrt(3))),
  polygons: [
    [
      new Vector2(6 + 2 * Math.sqrt(3), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 2 + 2 * Math.sqrt(3)),
      new Vector2(0.5 * (15 + 5 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
    ],
    [
      new Vector2(6 + 2 * Math.sqrt(3), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(0.5 * (15 + 5 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 1 + Math.sqrt(3)),
    ],
    [
      new Vector2(6 + 2 * Math.sqrt(3), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 1 + Math.sqrt(3)),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
    ],
    [
      new Vector2(6 + 2 * Math.sqrt(3), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 2 + 2 * Math.sqrt(3)),
    ],
    [
      new Vector2(0.25 * (21 + 7 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 2 + 2 * Math.sqrt(3)),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
    ],
    [
      new Vector2(0.25 * (21 + 7 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (5 + 5 * Math.sqrt(3))),
    ],
    [
      new Vector2(0.25 * (21 + 7 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(0.5 * (9 + 3 * Math.sqrt(3)), 0.5 * (5 + 5 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 3 + 3 * Math.sqrt(3)),
    ],
    [
      new Vector2(0.25 * (21 + 7 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 3 + 3 * Math.sqrt(3)),
      new Vector2(6 + 2 * Math.sqrt(3), 2 + 2 * Math.sqrt(3)),
    ],
    [
      new Vector2(0.25 * (27 + 9 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 2 + 2 * Math.sqrt(3)),
      new Vector2(6 + 2 * Math.sqrt(3), 3 + 3 * Math.sqrt(3)),
    ],
    [
      new Vector2(0.25 * (27 + 9 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 3 + 3 * Math.sqrt(3)),
      new Vector2(0.5 * (15 + 5 * Math.sqrt(3)), 0.5 * (5 + 5 * Math.sqrt(3))),
    ],
    [
      new Vector2(0.25 * (27 + 9 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(0.5 * (15 + 5 * Math.sqrt(3)), 0.5 * (5 + 5 * Math.sqrt(3))),
      new Vector2(0.5 * (15 + 5 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
    ],
    [
      new Vector2(0.25 * (27 + 9 * Math.sqrt(3)), 0.25 * (9 + 9 * Math.sqrt(3))),
      new Vector2(0.5 * (15 + 5 * Math.sqrt(3)), 0.5 * (3 + 3 * Math.sqrt(3))),
      new Vector2(6 + 2 * Math.sqrt(3), 2 + 2 * Math.sqrt(3)),
    ],
  ],
  translation: new Vector2(3 + Math.sqrt(3) + 0.5 * (3 + Math.sqrt(3)), 1.5 * (1 + Math.sqrt(3))),
};
export const floretPentagonalTiling: PeriodicBoardTiling = {
  name: 'Floret Pentagonal',
  urlName: 'floret-pentagonal',
  basisA: new Vector2(2.5, -Math.sqrt(3) / 2),
  basisB: new Vector2(-0.5, (3 * Math.sqrt(3)) / 2),
  polygons: [
    [
      new Vector2(2, Math.sqrt(3)),
      new Vector2(3, 4 / Math.sqrt(3)),
      new Vector2(3.5, 7 / (2 * Math.sqrt(3))),
      new Vector2(3.5, 5 / (2 * Math.sqrt(3))),
      new Vector2(3, 2 / Math.sqrt(3)),
    ],
    [
      new Vector2(2, Math.sqrt(3)),
      new Vector2(3, 2 / Math.sqrt(3)),
      new Vector2(3, 1 / Math.sqrt(3)),
      new Vector2(2.5, 1 / (2 * Math.sqrt(3))),
      new Vector2(2, 1 / Math.sqrt(3)),
    ],
    [
      new Vector2(2, Math.sqrt(3)),
      new Vector2(2, 1 / Math.sqrt(3)),
      new Vector2(1.5, 1 / (2 * Math.sqrt(3))),
      new Vector2(1, 1 / Math.sqrt(3)),
      new Vector2(1, 2 / Math.sqrt(3)),
    ],
    [
      new Vector2(2, Math.sqrt(3)),
      new Vector2(1, 2 / Math.sqrt(3)),
      new Vector2(0.5, 5 / (2 * Math.sqrt(3))),
      new Vector2(0.5, 7 / (2 * Math.sqrt(3))),
      new Vector2(1, 4 / Math.sqrt(3)),
    ],
    [
      new Vector2(2, Math.sqrt(3)),
      new Vector2(1, 4 / Math.sqrt(3)),
      new Vector2(1, 5 / Math.sqrt(3)),
      new Vector2(1.5, 11 / (2 * Math.sqrt(3))),
      new Vector2(2, 5 / Math.sqrt(3)),
    ],
    [
      new Vector2(2, Math.sqrt(3)),
      new Vector2(2, 5 / Math.sqrt(3)),
      new Vector2(2.5, 11 / (2 * Math.sqrt(3))),
      new Vector2(3, 5 / Math.sqrt(3)),
      new Vector2(3, 4 / Math.sqrt(3)),
    ],
  ],
  translation: new Vector2(2, Math.sqrt(3)),
};
export const portugalTiling: PeriodicBoardTiling = {
  name: 'Portugal',
  urlName: 'portugal',
  basisA: new Vector2(2, 2),
  basisB: new Vector2(-2, 2),
  polygons: [
    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 1), new Vector2(2, 2), new Vector2(1, 2), new Vector2(0, 1)],
    [new Vector2(2, 2), new Vector2(3, 2), new Vector2(4, 1), new Vector2(4, 0), new Vector2(3, 0), new Vector2(2, 1)],
    [new Vector2(1, 0), new Vector2(2, 1), new Vector2(3, 0), new Vector2(2, -1)],
  ],
  translation: new Vector2(0, 4),
};
export const falseCubicTiling: PeriodicBoardTiling = {
  name: 'False Cubic',
  urlName: 'false-cubic',
  basisA: new Vector2(1.5, Math.sqrt(3) / 2),
  basisB: new Vector2(0, Math.sqrt(3)),
  polygons: [
    [
      new Vector2(-1, 0),
      new Vector2(-1, 1 / Math.sqrt(3)),
      new Vector2(-0.5, Math.sqrt(3) / 2),
      new Vector2(0, 1 / Math.sqrt(3)),
      new Vector2(0.5, Math.sqrt(3) / 2),
      new Vector2(1, 1 / Math.sqrt(3)),
      new Vector2(1, 0),
      new Vector2(0.5, -1 / (2 * Math.sqrt(3))),
      new Vector2(0.5, -Math.sqrt(3) / 2),
      new Vector2(0, -2 / Math.sqrt(3)),
      new Vector2(-0.5, -Math.sqrt(3) / 2),
      new Vector2(-0.5, -1 / (2 * Math.sqrt(3))),
    ],
  ],
  translation: new Vector2(1.5, 1.5 * Math.sqrt(3)),
  scale: 2,
};
export const trihexAndHexTiling: PeriodicBoardTiling = {
  name: 'Trihex and Hex',
  urlName: 'trihex-and-hex',
  basisA: new Vector2(2, 0),
  basisB: new Vector2(1, Math.sqrt(3)),
  polygons: [
    [
      new Vector2(-1, 0),
      new Vector2(-1, 1 / Math.sqrt(3)),
      new Vector2(-0.5, Math.sqrt(3) / 2),
      new Vector2(0, 1 / Math.sqrt(3)),
      new Vector2(0.5, Math.sqrt(3) / 2),
      new Vector2(1, 1 / Math.sqrt(3)),
      new Vector2(1, 0),
      new Vector2(0.5, -1 / (2 * Math.sqrt(3))),
      new Vector2(0.5, -Math.sqrt(3) / 2),
      new Vector2(0, -2 / Math.sqrt(3)),
      new Vector2(-0.5, -Math.sqrt(3) / 2),
      new Vector2(-0.5, -1 / (2 * Math.sqrt(3))),
    ],
    [
      new Vector2(-0.5, 5 / (2 * Math.sqrt(3))),
      new Vector2(0, Math.sqrt(3)),
      new Vector2(0.5, 5 / (2 * Math.sqrt(3))),
      new Vector2(0.5, Math.sqrt(3) / 2),
      new Vector2(0, 1 / Math.sqrt(3)),
      new Vector2(-0.5, Math.sqrt(3) / 2),
    ],
  ],
  translation: new Vector2(3, Math.sqrt(3)),
};
export const periodicTilings: PeriodicBoardTiling[] = [
  squareTiling,
  hexagonalTiling,
  triangularTiling,
  trihexagonalTiling,
  smallRhombitrihexagonalTiling,
  truncatedSquareTiling,
  snubSquareTiling,
  truncatedHexagonalTiling,
  elongatedTriangularTiling,
  greatRhombitrihexagonalTiling,
  snubHexagonalTiling,
  rhombilleTiling,
  deltoidalTrihexagonalTiling,
  tetrakisSquareTiling,
  cairoPentagonalTiling,
  triakisTriangularTiling,
  prismaticPentagonalTiling,
  bisectedHexagonalTiling,
  floretPentagonalTiling,
  portugalTiling,
  falseCubicTiling,
  trihexAndHexTiling,
];
