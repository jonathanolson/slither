import _ from '../../workarounds/_.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { arrayRemove } from 'phet-lib/phet-core';

type Variable = number;
type ClauseIndex = number;

type Clause = Variable[];

export class DeprecatedGeneralSolver {
  private readonly numVariables: number;
  private readonly possibleLiterals: Variable[];

  private readonly decisionLevels: number[] = []; // decide_pos
  private readonly initialAssignments: Variable[] = []; // back
  private readonly assignments: Variable[] = []; // M
  private readonly clauses: Clause[];
  private readonly vsidsMap: Map<Variable, number> = new Map(); // counter

  private readonly watchedClauseIndicesByLiteral: Map<Variable, ClauseIndex[]> = new Map(); // literal_watch
  private readonly watchedLiteralsByClauseIndex: Variable[][] = []; // clauses_literal_watched

  private restartProbability: number = 0.9; // probability
  private restartCount: number = 0;

  public constructor(initialClauses: Clause[], numVariables?: number) {
    // Defensive copy, since we want to modify these
    this.clauses = initialClauses.map((clause) => clause.slice());

    const assignments = DeprecatedGeneralSolver.unitPropagation(this.clauses);

    if (assignments === null) {
      // UNSAT
      return;
    }

    this.initialAssignments.push(...assignments);
    this.assignments.push(...assignments);

    if (!numVariables) {
      numVariables = Math.max(...this.clauses.map((clause) => Math.max(...clause.map((v) => Math.abs(v)))));
    }

    this.numVariables = numVariables;
    this.possibleLiterals = _.sortBy(_.range(1, this.numVariables + 1).flatMap((v) => [v, -v]));

    this.resetVSIDS();
    this.resetWatchedLiterals();
    this.resetProbability();

    while (this.assignments.length < this.numVariables) {
      const variable = this.getVSIDSVariable();

      this.assign(variable);
      let conflictClause = this.propagateWatchedLiterals(variable);

      while (conflictClause) {
        this.onConflictVSIDS(conflictClause);
        this.decayVSIDS();

        const learnedClause = this.analyzeConflict(conflictClause);

        // TODO: is this... JUST NOT USED WTF
        let declareLevel = this.addLearnedClauseTo(learnedClause);

        // jump_status
        // var
        // (decide_pos is decisionLevels)
        if (this.decisionLevels.length === 0) {
          // jump_status = -1;
          // var = -1;
        } else {
        }
      }
    }
  }

  private resetVSIDS(): void {
    // Initialize VSIDS counts
    for (const literal of this.possibleLiterals) {
      this.vsidsMap.set(literal, this.clauses.filter((clause) => clause.includes(literal)).length);
    }
  }

  private resetWatchedLiterals(): void {
    for (const literal of this.possibleLiterals) {
      this.watchedClauseIndicesByLiteral.set(literal, []);
    }
    this.watchedLiteralsByClauseIndex.length = 0;

    for (let clauseIndex = 0; clauseIndex < this.clauses.length; clauseIndex++) {
      const clause = this.clauses[clauseIndex];
      const watchedLiterals: Variable[] = [];
      for (const literal of clause) {
        if (!this.assignments.includes(literal)) {
          watchedLiterals.push(literal);
          if (watchedLiterals.length === 2) {
            break;
          }
        }
      }
      assertEnabled() && assert(watchedLiterals.length === 2, 'Expected two watched literals');

      this.watchedLiteralsByClauseIndex.push(watchedLiterals);
      this.watchedClauseIndicesByLiteral.get(watchedLiterals[0])!.push(clauseIndex);
      this.watchedClauseIndicesByLiteral.get(watchedLiterals[1])!.push(clauseIndex);
    }
  }

  private resetProbability(): void {
    this.restartProbability = 0.9;
  }

  // returns conflict or null
  private propagateWatchedLiterals(variable: Variable): Clause | null {
    const stack: Variable[] = [variable];

    while (stack.length) {
      const nextVariable = stack.pop()!;

      const clauseIndices = this.watchedClauseIndicesByLiteral.get(-nextVariable)!;
      for (let i = clauseIndices.length - 1; i >= 0; i--) {
        const affectedClauseIndex = clauseIndices[i];
        const affectedClause = this.clauses[affectedClauseIndex];

        const watchedLiterals = this.watchedLiteralsByClauseIndex[affectedClauseIndex];
        const initialA = watchedLiterals[0];
        const initialB = watchedLiterals[1];

        let a = initialA;
        let b = initialB;

        // check_status TODO remove
        let unit: Variable = 0;
        let isSatisfied = false;

        if (this.assignments.includes(a) || this.assignments.includes(b)) {
          // is satisfied
          isSatisfied = true;
        } else {
          const symbols: Variable[] = [];

          for (const literal of affectedClause) {
            if (!this.assignments.includes(-literal)) {
              symbols.push(literal);
            }
            if (this.assignments.includes(literal)) {
              if (!this.assignments.includes(-a)) {
                b = literal;
              } else {
                a = literal;
              }
              // is... satisfied?
              isSatisfied = true;
              break;
            }
          }

          if (!isSatisfied) {
            if (symbols.length === 1) {
              // unit

              unit = symbols[0];

              stack.push(unit);
              this.assignments.push(unit);
            } else if (symbols.length === 0) {
              // unsatisfied

              return affectedClause;
            } else {
              // unresolved

              a = symbols[0];
              b = symbols[1];
            }
          }
        }

        if (a !== initialA) {
          // TODO: consider Set<?>
          arrayRemove(this.watchedClauseIndicesByLiteral.get(initialA)!, affectedClauseIndex);
          this.watchedClauseIndicesByLiteral.get(a)!.push(affectedClauseIndex);
          watchedLiterals[0] = a;
        }
        if (b !== initialB) {
          arrayRemove(this.watchedClauseIndicesByLiteral.get(initialB)!, affectedClauseIndex);
          this.watchedClauseIndicesByLiteral.get(b)!.push(affectedClauseIndex);
          watchedLiterals[1] = b;
        }
      }
    }

    return null;
  }

  private potentialRandomRestart(): void {
    if (this.restartProbability && Math.random() < this.restartProbability) {
      this.restartCount++;

      this.assignments.length = 0;
      this.assignments.push(...this.initialAssignments);

      this.decisionLevels.length = 0;
      this.restartProbability *= 0.5;

      if (this.restartProbability < 0.001) {
        this.restartProbability = 0.2;
      }
      if (this.restartCount > this.assignments.length + 10) {
        // TODO: potentially adjust this?
        this.restartProbability = 0;
      }
    }
  }

  private analyzeConflict(conflictClause: Clause): Clause {
    // TODO: implement a full analysis(!). This is unacceptable
    const learnedClause: Clause = this.decisionLevels.map((i) => -this.assignments[i]);

    return learnedClause;
  }

  private assign(variable: Variable): void {
    this.decisionLevels.push(this.assignments.length); // TODO: why not length - 1?
    this.assignments.push(variable);
  }

  // returns declare level TODO: enum?
  private addLearnedClauseTo(learnedClause: Clause): number {
    if (learnedClause.length === 0) {
      return -1;
    } else if (learnedClause.length === 1) {
      this.assignments.push(learnedClause[0]);
      return 1;
    }

    const clauseIndex = this.clauses.length;
    this.clauses.push(learnedClause);

    const a = learnedClause[0];
    const b = learnedClause[1];
    const watchedLiterals = [a, b];
    this.watchedLiteralsByClauseIndex.push(watchedLiterals);
    this.watchedClauseIndicesByLiteral.get(a)!.push(clauseIndex);
    this.watchedClauseIndicesByLiteral.get(b)!.push(clauseIndex);
    return 0;
  }

  private onConflictVSIDS(conflictClause: Clause): void {
    for (const variable of conflictClause) {
      this.vsidsMap.set(variable, this.vsidsMap.get(variable)! + 1);
    }
  }

  private decayVSIDS(): void {
    for (const [variable, count] of this.vsidsMap.entries()) {
      this.vsidsMap.set(variable, count * 0.95);
    }
  }

  private getVSIDSVariable(): Variable {
    let bestCount = 0;
    let bestVariable = -1;

    for (const variable of this.possibleLiterals) {
      const count = this.vsidsMap.get(variable)!;

      if (count >= bestCount && !this.assignments.some((y) => y === variable || y === -variable)) {
        bestCount = count;
        bestVariable = variable;
      }
    }

    return bestVariable;
  }

  // mutates input array
  // null return is UNSAT, otherwise return the assignments
  public static unitPropagation(clauses: Clause[]): Variable[] | null {
    const assignments: Variable[] = [];

    let done = false;
    while (!done) {
      done = true;

      for (const clause of clauses) {
        if (clause.length === 0) {
          return null; // UNSAT
        } else if (clause.length === 1) {
          // unit cause
          const variable = clause[0];

          const nextClauses: Clause[] = [];

          for (const otherClause of clauses) {
            if (!otherClause.includes(variable)) {
              if (otherClause.includes(-variable)) {
                if (otherClause.length === 1) {
                  return null; // UNSAT
                } else {
                  nextClauses.push(otherClause.filter((v) => v !== -variable));
                }
              } else {
                nextClauses.push(otherClause);
              }
            }
          }

          assignments.push(variable);
          done = false;

          if (clauses.length === 0) {
            return assignments;
          }
        }
      }
    }

    return assignments;
  }
}
