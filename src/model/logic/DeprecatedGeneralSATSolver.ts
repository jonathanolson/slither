export interface GeneralClause {
  literals: number[];
}

export interface GeneralAssignment {
  variable: number;
  value: boolean;
  level: number; // Decision level at which the variable was assigned
}

export class GeneralUnsatisfiableError extends Error {
  public constructor() {
    super( 'Unsatisfiable' );
  }
}

export class DeprecatedGeneralSATSolver {
  public clauses: GeneralClause[];
  public assignment: GeneralAssignment[];
  public decisionLevel: number;
  public vsidsScores: Map<number, number>;
  public watches: Map<number, number[]>;
  public learnedClauses: GeneralClause[] = [];

  public constructor( clauses: GeneralClause[] ) {
    this.clauses = clauses;
    this.assignment = [];
    this.decisionLevel = 0;
    this.vsidsScores = new Map<number, number>();
    this.watches = new Map<number, number[]>();

    this.initialize();
  }

  private initialize() {
    for ( const clause of this.clauses ) {
      for ( const literal of clause.literals ) {
        if ( !this.watches.has( literal ) ) {
          this.watches.set( literal, [] );
        }
        if ( !this.watches.has( -literal ) ) {
          this.watches.set( -literal, [] );
        }
      }
      this.watchLiteral( clause.literals[ 0 ], clause );
      if ( clause.literals.length >= 2 ) {
        this.watchLiteral( clause.literals[ 1 ], clause );
      }
    }
  }

  private watchLiteral( literal: number, clause: GeneralClause ) {
    if ( !this.watches.has( literal ) ) {
      this.watches.set( literal, [] );
    }
    this.watches.get( literal )!.push( this.clauses.indexOf( clause ) );
  }

  private assign( variable: number, value: boolean ) {
    this.assignment.push( { variable, value, level: this.decisionLevel } );
    this.vsidsScores.set( variable, ( this.vsidsScores.get( variable ) || 0 ) + 1 );
  }

  private unassign() {
    const unassigned = this.assignment.pop();
    if ( unassigned ) {
      // Check if the unassigned variable is the last one in its decision level
      if ( this.assignment.length === 0 || this.assignment[ this.assignment.length - 1 ].level < this.decisionLevel ) {
        this.decisionLevel--;
      }
    }
  }

  private unitPropagate( literal: number ): boolean {
    const watchList = this.watches.get( -literal ) || [];
    for ( let i = 0; i < watchList.length; ) {
      const clause = this.clauses[ watchList[ i ] ];
      const otherLiteral = clause.literals.find( l => l !== -literal && !this.isAssigned( Math.abs( l ) ) );
      if ( otherLiteral === undefined ) {
        if ( !this.isSatisfied( clause ) ) {
          return false; // Conflict
        }
        i++;
      }
      else {
        this.watchLiteral( otherLiteral, clause );
        watchList[ i ] = watchList[ watchList.length - 1 ];
        watchList.pop();
        i++;
        if ( !this.isAssigned( Math.abs( otherLiteral ) ) ) {
          this.assign( Math.abs( otherLiteral ), otherLiteral > 0 );
          if ( !this.unitPropagate( otherLiteral ) ) {
            return false;
          }
        }
      }
    }
    return true; // No conflict
  }

  private propagate(): GeneralClause | null {
    while ( true ) {
      let conflictClause: GeneralClause | null = null;
      for ( const clause of this.clauses ) {
        if ( this.isSatisfied( clause ) ) {
          continue;
        }
        const unassignedLiteral = clause.literals.find( l => !this.isAssigned( Math.abs( l ) ) );
        if ( unassignedLiteral === undefined ) {
          conflictClause = clause; // Conflict
          break;
        }
        if ( !this.isAssigned( Math.abs( unassignedLiteral ) ) ) {
          this.assign( Math.abs( unassignedLiteral ), unassignedLiteral > 0 );
          if ( !this.unitPropagate( unassignedLiteral ) ) {
            conflictClause = clause;
            break;
          }
        }
      }
      if ( conflictClause ) {
        return conflictClause; // Conflict found
      }
      return null; // No conflict
    }
  }

  private isSatisfied( clause: GeneralClause ) {
    for ( const literal of clause.literals ) {
      if ( this.isAssigned( Math.abs( literal ) ) && this.getAssignedValue( literal ) ) {
        return true;
      }
    }
    return false;
  }

  private isAssigned( variable: number ) {
    return this.assignment.some( a => a.variable === variable );
  }

  private getAssignedValue( variable: number ) {
    const assignment = this.assignment.find( a => a.variable === variable );
    return assignment ? assignment.value : null;
  }

  private conflictAnalysis( conflictClause: GeneralClause ): number[] {
    const conflictVariables: Set<number> = new Set();
    for ( const literal of conflictClause.literals ) {
      const variable = Math.abs( literal );
      if ( this.isAssigned( variable ) ) {
        conflictVariables.add( variable );
      }
    }
    if ( conflictVariables.size === 0 ) {
      return [];
    }
    const backtrackLevel = Array.from( conflictVariables ).reduce( ( maxLevel, variable ) => {
      const assignment = this.assignment.find( a => a.variable === variable );
      if ( assignment && assignment.level > maxLevel ) {
        return assignment.level;
      }
      return maxLevel;
    }, 0 );
    return this.assignment.filter( a => a.level >= backtrackLevel ).map( a => a.variable );
  }

  private addLearnedClause( clause: GeneralClause ) {
    this.learnedClauses.push( clause );
    this.clauses.push( clause );
    for ( const literal of clause.literals ) {
      const variable = Math.abs( literal );
      this.vsidsScores.set( variable, ( this.vsidsScores.get( variable ) || 0 ) + 1 );
    }
  }

  public addClause( clause: GeneralClause ) {
    this.clauses.push( clause );
    for ( const literal of clause.literals ) {
      if ( !this.watches.has( literal ) ) {
        this.watches.set( literal, [] );
      }
      if ( !this.watches.has( -literal ) ) {
        this.watches.set( -literal, [] );
      }
    }
    this.watchLiteral( clause.literals[ 0 ], clause );
    if ( clause.literals.length >= 2 ) {
      this.watchLiteral( clause.literals[ 1 ], clause );
    }
  }

  public solve() {
    while ( true ) {
      const conflictClause = this.propagate();
      if ( conflictClause === null ) {
        // All clauses satisfied, solution found
        return this.assignment;
      }
      else {
        // Conflict occurred, backtrack
        const backjumpVariables = this.conflictAnalysis( conflictClause );
        if ( backjumpVariables.length === 0 ) {
          throw new GeneralUnsatisfiableError();
        }
        const backtrackLevel = Math.max( ...backjumpVariables.map( v => this.assignment.find( a => a.variable === v )!.level ) );
        for ( const variable of backjumpVariables ) {
          this.vsidsScores.set( variable, ( this.vsidsScores.get( variable ) || 0 ) + 1 );
        }
        // Learn a no-good clause
        const learnedClause = { literals: backjumpVariables.map( v => -v ) };
        this.addLearnedClause( learnedClause );
        // Backtrack to the highest decision level and unassign variables
        while ( this.assignment.length > 0 && this.assignment[ this.assignment.length - 1 ].level >= backtrackLevel ) {
          this.unassign();
        }
        if ( this.decisionLevel < 0 ) {
          throw new Error( 'Backtrack below level 0' );
        }
      }
    }
  }

  private getNegatedLiteral( variable: number ): number {
    return this.isAssigned( variable ) ? ( this.getAssignedValue( variable ) ? -variable : variable ) : variable;
  }

  public findAllSolutions(): GeneralAssignment[][] {
    const allSolutions: GeneralAssignment[][] = [];
    try {
      while ( true ) {
        const solution = this.solve();
        allSolutions.push( [ ...solution ] );
        const negatedClause = { literals: solution.map( a => ( a.value ? -a.variable : a.variable ) ) };
        this.addClause( negatedClause );
        this.reset();
      }
    }
    catch( e ) {
      if ( !( e instanceof GeneralUnsatisfiableError ) ) {
        throw e;
      }
    }
    return allSolutions;
  }

  private reset() {
    this.assignment = [];
    this.decisionLevel = 0;
  }
}

export class GeneralFormula {
  public clauses: GeneralClause[];

  public constructor( clauses: GeneralClause[] ) {
    this.clauses = clauses;
  }

  public getClauses(): GeneralClause[] {
    return this.clauses;
  }

  public static and( ...formulas: GeneralFormula[] ): GeneralFormula {
    const clauses: GeneralClause[] = [];
    for ( const formula of formulas ) {
      clauses.push( ...formula.getClauses() );
    }
    return new GeneralFormula( clauses );
  }

  public static or( ...formulas: GeneralFormula[] ): GeneralFormula {
    const combinedClauses: GeneralClause[] = [];
    const newClause: GeneralClause = { literals: [] };

    for ( const formula of formulas ) {
      const clauses = formula.getClauses();
      if ( clauses.length === 1 && clauses[ 0 ].literals.length === 1 ) {
        newClause.literals.push( clauses[ 0 ].literals[ 0 ] );
      }
      else {
        combinedClauses.push( ...clauses );
      }
    }

    combinedClauses.push( newClause );
    return new GeneralFormula( combinedClauses );
  }

  public static not( formula: GeneralFormula ): GeneralFormula {
    const negatedClauses: GeneralClause[] = formula.getClauses().map( clause => ( {
      literals: clause.literals.map( literal => -literal )
    } ) );
    return new GeneralFormula( negatedClauses );
  }

  public static exactlyOne( ...formulas: GeneralFormula[] ): GeneralFormula {
    const combinedClauses: GeneralClause[] = [];
    const literals: number[] = [];

    for ( const formula of formulas ) {
      const clauses = formula.getClauses();
      if ( clauses.length === 1 && clauses[ 0 ].literals.length === 1 ) {
        literals.push( clauses[ 0 ].literals[ 0 ] );
      }
    }

    combinedClauses.push( { literals } );

    for ( let i = 0; i < literals.length; i++ ) {
      for ( let j = i + 1; j < literals.length; j++ ) {
        combinedClauses.push( { literals: [ -literals[ i ], -literals[ j ] ] } );
      }
    }

    return new GeneralFormula( combinedClauses );
  }

  public static none( ...formulas: GeneralFormula[] ): GeneralFormula {
    return GeneralFormula.and( ...formulas.map( GeneralFormula.not ) );
  }

  public static some( ...formulas: GeneralFormula[] ): GeneralFormula {
    return GeneralFormula.or( ...formulas );
  }

  public static notAll( ...formulas: GeneralFormula[] ): GeneralFormula {
    return GeneralFormula.not( GeneralFormula.and( ...formulas ) );
  }

  public static atLeastN( count: number, ...formulas: GeneralFormula[] ): GeneralFormula {
    const combinedClauses: GeneralClause[] = [];
    const literals: number[] = [];

    for ( const formula of formulas ) {
      const clauses = formula.getClauses();
      if ( clauses.length === 1 && clauses[ 0 ].literals.length === 1 ) {
        literals.push( clauses[ 0 ].literals[ 0 ] );
      }
    }

    const combs = combinations( literals, count );

    for ( const comb of combs ) {
      combinedClauses.push( { literals: comb } );
    }

    return new GeneralFormula( combinedClauses );
  }

  public static atMostN( count: number, ...formulas: GeneralFormula[] ): GeneralFormula {
    return GeneralFormula.not( GeneralFormula.atLeastN( formulas.length - count + 1, ...formulas ) );
  }

  public static exactlyN( count: number, ...formulas: GeneralFormula[] ): GeneralFormula {
    return GeneralFormula.and(
      GeneralFormula.atLeastN( count, ...formulas ),
      GeneralFormula.atMostN( count, ...formulas )
    );
  }
}

function combinations( arr: number[], k: number ): number[][] {
  const results: number[][] = [];

  function combine( start: number, path: number[] ) {
    if ( path.length === k ) {
      results.push( path );
      return;
    }
    for ( let i = start; i < arr.length; i++ ) {
      combine( i + 1, path.concat( arr[ i ] ) );
    }
  }

  combine( 0, [] );
  return results;
}

// Example usage:
const clause1: GeneralClause = { literals: [ 1, 2 ] };
const clause2: GeneralClause = { literals: [ -1, 3 ] };
const clause3: GeneralClause = { literals: [ -2, -3 ] };

const formula1 = new GeneralFormula( [ clause1 ] );
const formula2 = new GeneralFormula( [ clause2 ] );
const formula3 = new GeneralFormula( [ clause3 ] );

const combinedFormula = GeneralFormula.and( formula1, formula2, formula3 );
const solver = new DeprecatedGeneralSATSolver( combinedFormula.getClauses() );

const allSolutions = solver.findAllSolutions();
console.log( allSolutions );
