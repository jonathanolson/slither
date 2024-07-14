import { PolygonGenerator } from '../PolygonGenerator.ts';
import { hexagonalPolygonGenerator } from '../generators/hexagonalPolygonGenerator.ts';
import { penroseTilingGenerator } from '../generators/penroseTilingGenerator.ts';
import { polygonGenerators } from '../generators/polygonGenerators.ts';
import { PolygonalBoard } from './PolygonalBoard.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

const polygonGeneratorBoardMap = new Map<string, PolygonGeneratorBoard>();

// TODO: simplify PolygonalBoard into this?
export class PolygonGeneratorBoard extends PolygonalBoard {
  protected constructor(
    public readonly generator: PolygonGenerator,
    public readonly parameters: Record<string, any>,
  ) {
    const polygons = generator.generate(parameters);

    super(polygons, generator.scale ?? 1);
  }

  public static get(generator: PolygonGenerator, parameters: Record<string, any>): PolygonGeneratorBoard {
    const key = generator.name + '/' + JSON.stringify(parameters);

    if (!polygonGeneratorBoardMap.has(key)) {
      polygonGeneratorBoardMap.set(key, new PolygonGeneratorBoard(generator, parameters));
    }

    return polygonGeneratorBoardMap.get(key)!;
  }

  public static fromShortName(shortName: string): PolygonGeneratorBoard {
    const generator = polygonGenerators.find((generator) => shortName.startsWith(generator.urlName))!;
    assertEnabled() && assert(generator);

    const parameters: Record<string, any> = {};

    let shortParameters = shortName.slice(generator.urlName.length + 1);

    if (shortParameters.startsWith('sq-')) {
      shortParameters = shortParameters.slice(3);
      parameters.squareRegion = true;
    } else {
      parameters.squareRegion = false;
    }

    let numericParameters = shortParameters.split('x').map((s) => parseInt(s, 10));

    if (generator === hexagonalPolygonGenerator) {
      parameters.radius = numericParameters[0];
      parameters.isPointyTop = true;
      parameters.holeRadius = 0;
    } else if (generator === penroseTilingGenerator) {
      parameters.radius = numericParameters[0];
    } else {
      parameters.width = numericParameters[0];
      parameters.height = numericParameters[1];
      assertEnabled() && assert(numericParameters.length > 1);
    }

    console.log(generator, parameters);

    return PolygonGeneratorBoard.get(generator, parameters);
  }
}
