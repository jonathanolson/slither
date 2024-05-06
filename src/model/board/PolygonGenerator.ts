import { Range, Vector2 } from 'phet-lib/dot';

export type PolygonGeneratorParameter = {
  label: string;
  advanced?: boolean;
} & ( {
  type: 'integer';
  range: Range;
} | {
  type: 'float';
  range: Range;
} | {
  type: 'boolean';
} | {
  type: 'choice';
  choices: {
    value: string;
    label: string;
  }[];
} );
export type PolygonGenerator = {
  name: string;
  parameters: Record<string, PolygonGeneratorParameter>;
  defaultParameterValues: Record<string, any>; // TODO: maybe sometime do the typing work for this?
  generate: ( parameters: Record<string, any> ) => Vector2[][];
  scale?: number;
};