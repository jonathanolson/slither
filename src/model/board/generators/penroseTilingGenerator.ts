import { PolygonGenerator } from '../PolygonGenerator.ts';
import { Vector2 } from 'phet-lib/dot';
import { penrose10, penrose11, penrose13, penrose14, penrose20, penrose6 } from '../core/TiledBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const penroseTilingGenerator: PolygonGenerator = {
  name: 'Penrose',
  parameters: {
    // TODO: support all radii, and handle prescale
    radius: {
      label: 'Radius',
      type: 'choice',
      choices: [
        {
          value: '6',
          label: '6',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '20',
          label: '20',
        },
      ],
    },
  },
  defaultParameterValues: {
    radius: '6',
  },
  generate: ((parameters: { radius: string }): Vector2[][] => {
    const penroseTiling = {
      '6': penrose6,
      '10': penrose10,
      '11': penrose11,
      '13': penrose13,
      '14': penrose14,
      '20': penrose20,
    }[parameters.radius]!;

    assertEnabled() && assert(penroseTiling);

    const prescale = 0.01;

    // They are closed, we ignore the last point
    const thinPolygons = penroseTiling.thinShape.subpaths
      .filter((subpath) => subpath.segments.length)
      .map((subpath) => subpath.points.slice(0, -1).map((v) => v.timesScalar(prescale)));
    const thickPolygons = penroseTiling.thickShape.subpaths
      .filter((subpath) => subpath.segments.length)
      .map((subpath) => subpath.points.slice(0, -1).map((v) => v.timesScalar(prescale)));

    return [...thickPolygons, ...thinPolygons];
  }) as (parameters: Record<string, any>) => Vector2[][],
};
