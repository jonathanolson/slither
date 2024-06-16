// @ts-expect-error
import Logic from '../solver/logic-solver/logic-solver.js';
import { Formula } from './Formula.ts';
import { Term } from './Term.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

export class FormulaSolver<T> {
  private readonly nameMap: Map<string, T> = new Map();
  private readonly termMap: Map<T, string> = new Map();

  private readonly solver: Logic.Solver = new Logic.Solver();

  public constructor(initialFormulas?: Formula<T>[]) {
    if (initialFormulas) {
      this.addFormulas(initialFormulas);
    }
  }

  public addFormula(formula: Formula<T>): void {
    this.solver.require(formula instanceof Term ? formula.name : formula.logic);

    this.addTermsFrom(formula);
  }

  public addFormulas(formulas: Formula<T>[]): void {
    for (const formula of formulas) {
      this.addFormula(formula);
    }
  }

  private addTermsFrom(formula: Formula<T>): void {
    if (formula instanceof Term) {
      if (!this.nameMap.has(formula.name)) {
        this.nameMap.set(formula.name, formula.value);

        assertEnabled() && assert(!this.termMap.has(formula.value));
        this.termMap.set(formula.value, formula.name);
      } else if (assertEnabled()) {
        assert(this.nameMap.get(formula.name) === formula.value);
        assert(this.termMap.get(formula.value) === formula.name);
      }
    } else {
      for (const parameter of formula.parameters) {
        this.addTermsFrom(parameter);
      }
    }
  }

  public getNextSolution(): T[] | null {
    let solution: Logic.Solution | null = null;
    Logic.disablingAssertions(() => {
      solution = this.solver.solve();
    });

    if (solution) {
      const variables: string[] = solution.getTrueVars();

      const trueVariableSet = new Set(variables);
      const falseVariableSet = new Set([...this.nameMap.keys()].filter((variable) => !trueVariableSet.has(variable)));

      // Exclude more
      this.solver.require(
        Logic.or(
          ...[
            ...[...trueVariableSet].map((variable) => `-${variable}`),
            ...[...falseVariableSet].map((variable) => variable),
          ],
        ),
      );

      return variables.map((variable) => {
        const value = this.nameMap.get(variable);
        assertEnabled() && assert(value !== undefined);
        return value!;
      });
    } else {
      return null;
    }
  }
}
