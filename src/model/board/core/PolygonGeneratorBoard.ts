import { PolygonGenerator } from '../PolygonGenerator.ts';
import { PolygonalBoard } from './PolygonalBoard.ts';

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
}
