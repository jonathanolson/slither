import { Term } from './Term.ts';

export type Formula<T> = {
  // Can add things from logic-solver
  type: 'not' | 'and' | 'or' | 'exactly-one' | 'true' | 'false';
  logic: unknown;
  parameters: Formula<T>[];
} | Term<T>;
